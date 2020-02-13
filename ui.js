function initUI(){
    let structButtons = document.getElementsByClassName('struct_button');
    for(let button of structButtons){
        button.addEventListener('mouseover', (e) => {

            if(!e.toElement.classList.contains('locked')){
                return;
            }

            // attach the unlock tooltip to this button
            let tooltip = document.getElementById('unlock_tooltip');
            tooltip.parentElement.removeChild(tooltip);
            tooltip.classList.remove('hidden');

            e.toElement.appendChild(tooltip);

            let nameText = 'Error!';
            let nameArticle = 'Error! (article)';
            let hook = getHook(e.toElement.id);
            nameText = hook.displayNoun;
            nameArticle = hook.displayArticle;

            // edit the tooltip text to reflect this button 
            const nameEls = document.getElementsByClassName('unlock_tooltip_item_name');
            for(let el of nameEls){
                el.textContent = nameText;
            }
            const nameEls2 = document.getElementsByClassName('unlock_tooltip_item_name_article');
            for(let el of nameEls2){
                el.textContent = nameArticle;
            }
        });

        button.addEventListener('mouseout', (e) => {
            let tooltip = document.getElementById('unlock_tooltip');
            tooltip.classList.add('hidden');
        })

        button.addEventListener('click', (e) => {
            let buttonEl = e.toElement;

            if(buttonEl.classList.contains('locked')){
                buttonEl.classList.add('unlock_in_progress');
                document.getElementById('unlock_in_progress_tooltip').innerHTML = getHook(buttonEl.id).constructionInfoHTML;
            } else {
                return;
            }

            document.getElementById('unlock_tooltip').classList.add('hidden');

            let inProgressTooltip = document.getElementById('unlock_in_progress_tooltip');
            inProgressTooltip.parentElement.removeChild(inProgressTooltip);
            buttonEl.appendChild(inProgressTooltip);

            inProgressTooltip.classList.remove('hidden');

            // make everything except canvas unresponsive 
            for(let button of document.getElementsByTagName('button')){
                button.disabled = true;
            }

            let hook = getHook(buttonEl.id);
            let oldSelectionHook = selectionInfo.hook;

            waitForSelection(hook.unlockSelectCount, (selectedNodes) => {
                // clear all callbacks from SELECTION_HOOKS.NODE_SELECTION
                SELECTION_HOOKS.NODE_SELECTION.callback = undefined;
                SELECTION_HOOKS.NODE_SELECTION.escapeCallback = undefined;
                SELECTION_HOOKS.NODE_SELECTION.dependencyCount = 0;

                // remove in progress tooltip
                inProgressTooltip.classList.add('hidden');
                buttonEl.classList.remove('unlock_in_progress');

                // un-disable all the buttons 
                for(let button of document.getElementsByTagName('button')){
                    button.disabled = false;
                }
                // check if the selection is correct
                if(!selectedNodes || !hook.verify(selectedNodes)){
                    // make the unlock button red for a little while, then transfer back to locked state
                    button.classList.add('unlock_failed');
                    selectionInfo.hook = oldSelectionHook;
                    setTimeout(() => {
                        button.classList.remove('unlock_failed');
                    }, 1000);
                } else {
                    // make the unlock button green for a little while, then transfer to unlocked state
                    hook.implementIfImprovement(selectedNodes);
                    button.classList.add('unlock_successful');
                    selectionInfo.hook = hook;
                    setTimeout(() => {
                        button.classList.remove('locked');
                        button.click();
                    }, 1000);
                }
            });
        })
    }    
}

// callback has argument selectedNodes (the nodes selected)
function waitForSelection(numPointsToSelect, callback){
    selectionInfo.escape();
    SELECTION_HOOKS.NODE_SELECTION.callback = callback;
    SELECTION_HOOKS.NODE_SELECTION.escapeCallback = callback;
    SELECTION_HOOKS.NODE_SELECTION.dependencyCount = numPointsToSelect;
    selectionInfo.hook = SELECTION_HOOKS.NODE_SELECTION;
    // select the root nodes 
    selectionInfo.nodeList.push(root1, root2);

    // make sure the nodes are updated as red 
    for(let node of selectionInfo.nodeList){
        node.color = 'rgba(255,0,0,0.7)';
    }
    drawGraph();
}

function getHook(id){
    for(let hookName in SELECTION_HOOKS){
        hook = SELECTION_HOOKS[hookName];
        if(hook.buttonID === id){
            return hook;
        }
    }
}