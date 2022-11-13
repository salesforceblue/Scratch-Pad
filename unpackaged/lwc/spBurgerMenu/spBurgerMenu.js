import { LightningElement } from 'lwc';

export default class SpBurgerMenu extends LightningElement {
    isMenuVisible = false; 

    /* @Desc: Update Or Add Menu Item Actions Here */
    menuItemActions = {
        SAVE_TO_NOTE: (event) => {
            console.log('save to note called ' + event.target.getAttribute('data-action'));

            this.dispatchEvent(new CustomEvent('menuitemclicked', {
                detail: {
                    'action': 'SAVE_TO_NOTE'
                }
            }));
            console.log('event dispatched save to note');
        }, 

        CLEAR_SCRATCH_PAD: (event) => {
            console.log('clear scratch pad called ' + event.target.getAttribute('data-action'));
            
            console.log('typeof this ' + typeof this);
            
            this.dispatchEvent(new CustomEvent('menuitemclicked', {
                detail: {
                    action: 'CLEAR_SCRATCH_PAD'
                }
            }));

            console.log('event dispatched clear scratch pad');
        }
    };    
    
    /* @Desc: This will toggle menu */
    toggleMenu() {
        this.isMenuVisible = !this.isMenuVisible;
    }

    /* @Desc: Handler for menu item clicks */
    menuItemHandler(event) {
        this.menuItemActionInvoke(event);
        this.toggleMenu();
    }

    /* @Desc: This will fire an action associated to a menu item */
    menuItemActionInvoke(event) {
        if(!event.target.getAttribute('data-action')) return;
        this.menuItemActions[event.target.getAttribute('data-action')](event);
    }

}