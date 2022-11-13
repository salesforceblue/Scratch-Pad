import { LightningElement, api, wire } from 'lwc';
import { deBounce } from 'c/deBounceService';
import saveSpContentToDB from '@salesforce/apex/ScratchPadController.saveSpContentToDB';
import saveSpContentToNoteDB from '@salesforce/apex/ScratchPadController.saveSpContentToNoteDB';
import readSpContentFromDB from '@salesforce/apex/ScratchPadController.readSpContentFromDB';
import spMessageChannel from '@salesforce/messageChannel/spMessageChannel__c';
import { MessageContext, publish } from 'lightning/messageService';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class SpWritingArea extends LightningElement {
    @api recordId;
    spContent;
    isProcessing;
    DEBOUNCE_TIME = 1200; // In ms

    debounceSaveSpContent = deBounce(this.saveSpContent, this.DEBOUNCE_TIME);

    @wire(MessageContext)
    messagContext;

    /* @Desc: This will act as a handler for save call to key up event */
    saveSpContentHandler() {
        this.processingContent();
        this.debounceSaveSpContent();
    }

    processingContent() {
        if(!this.isProcessing) {
            this.isProcessing = true;
            publish(this.messagContext, spMessageChannel, {status: "PROCESSING"});
        }
    }

    processedContent() {
        this.isProcessing = false;
    }

    /* @Desc: This will save scratch pad content to DB */
    saveSpContent() {
        const writingAreaElement = this.template.querySelector('textarea.sp-writing-ta');
        const content = writingAreaElement?.value; 
        const paramWrapper = {
            recordId: this.recordId,
            content: content
        };

        saveSpContentToDB({paramJSON: JSON.stringify(paramWrapper)}).then(()=>{
            console.log('data upserted');
            this.processedContent();
            publish(this.messagContext, spMessageChannel, {status: "SUCCESS"});
        })
        .catch((error)=>{
            this.processedContent();
            publish(this.messagContext, spMessageChannel, {status: "ERROR"}); 
            console.log(`error occured : ${error}`);
        });
    }
    /* @Desc: This will save scratch pad content to DB */
    @api saveSpContentToNote() {
        const writingAreaElement = this.template.querySelector('textarea.sp-writing-ta');
        const content = writingAreaElement?.value; 

        console.log('saveSpContentToNote invoked');
        const paramWrapper = {
            recordId: this.recordId,
            content: content
        };

        saveSpContentToNoteDB({paramJSON: JSON.stringify(paramWrapper)}).then(()=>{
            console.log('data inserted');
            this.processedContent();
            publish(this.messagContext, spMessageChannel, {status: "SUCCESS"});
            this.clearSpContent();
            this.dispatchEvent(new ShowToastEvent({
                title: 'Notes saved successfully',
                variant: 'success'
            }));


        })
        .catch((error)=>{
            this.processedContent();
            publish(this.messagContext, spMessageChannel, {status: "ERROR"}); 
            console.log(`error occured : ${error}`);
        });
    }

    @wire(readSpContentFromDB, {recordId:'$recordId'})
       readSpContent({ error, data }) {
        if (data) {
            console.log(`data : ${data}`);            
            this.spContent = data.Sp_Notes__c;
            this.processedContent();
            publish(this.messagContext, spMessageChannel, {status: "SUCCESS"});
                
        } else if (error) {
            console.error('error occured ' + error);
            this.processedContent();
            publish(this.messagContext, spMessageChannel, {status: "ERROR"});
        }
    }

    /* @Desc: This will clear the scratch pad content area */
    @api clearSpContent() {
        const writingAreaElement = this.template.querySelector('textarea.sp-writing-ta');
        writingAreaElement.value = ''; 
        this.processedContent();
        this.saveSpContent();
        console.log('content cleared');
    }
}
