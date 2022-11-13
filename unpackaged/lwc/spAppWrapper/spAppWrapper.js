import { LightningElement, api } from 'lwc';

export default class SpAppWrapper extends LightningElement {
    @api recordId; 

    menuItemActions = {
        SAVE_TO_NOTE: () => {
            console.log('Saving to note form app wrapper');
            this.template.querySelector('c-sp-writing-area').saveSpContentToNote();
        }, 

        CLEAR_SCRATCH_PAD: () => {
            console.log('Clearning Scratch pad');
            this.template.querySelector('c-sp-writing-area').clearSpContent();
        }
    };  

    menuItemClickHandler(event) {
        if(!event.detail.action) return;
        this.menuItemActions[event.detail.action]();
    }
}