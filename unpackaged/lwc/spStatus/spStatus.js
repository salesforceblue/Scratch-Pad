import { LightningElement, wire } from 'lwc';
import { subscribe, unsubscribe, MessageContext } from 'lightning/messageService';
import spMessageChannel from '@salesforce/messageChannel/spMessageChannel__c';
export default class SpStatus extends LightningElement {
    isSuccess = true; // Initial Status Set To Processing
    isError;
    isProcessing;
    subscription = null;

    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        this.subscribeToMessageChannel();
    }

    disconnectedCallback() {
        this.unsubscribeToMessageChannel();
    }

    subscribeToMessageChannel() {
        if(!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                spMessageChannel,
                (message) => this.handleMessage(message)
            )
        }
    }

    unsubscribeToMessageChannel() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    handleMessage(message) {
        switch (message.status) {
            case 'SUCCESS':
                this.successHandler();
            break;
            
            case 'ERROR':
                this.errorHandler();
            break;
            
            case 'PROCESSING':
                this.processingHandler();
            break;
            
            default:
                break;
        }
    }

    processingHandler(){
        this.isProcessing = true;
        this.isSuccess = false;
        this.isError = false;
    } 

    successHandler(){
        this.isProcessing = false;
        this.isSuccess = true;
        this.isError = false;
    } 

    errorHandler(){
        this.isProcessing = false;
        this.isSuccess = false;
        this.isError = true;
    } 

}