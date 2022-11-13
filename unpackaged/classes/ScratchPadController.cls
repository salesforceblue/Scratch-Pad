/* 
* @Author: Pankaj Agrahari 
* @Desc: Controller for Scratch Pad  
*/

public with sharing class ScratchPadController {

    /* @Desc: Save SP content to DB */
    @AuraEnabled
    public static void saveSpContentToDB(String paramJSON) {
        try {

            System.debug('Saving content to DB initialized');

            SpParamWrapper paramWrapper = (SpParamWrapper)JSON.deserialize(paramJSON, SpParamWrapper.class);

            Scratch_Pad__c spRecord = new Scratch_Pad__c(
                Sp_Notes__c = paramWrapper.content,
                Sp_Record_Id__c = paramWrapper.recordId,
                SP_Unique_Identifier__c = paramWrapper.recordId + UserInfo.getUserId()
            );

           upsert spRecord SP_Unique_Identifier__c;

           System.debug('upsert happened');

        } catch (Exception e) {
            System.debug('Exception occured ' + e.getCause());
            throw new AuraHandledException(e.getMessage());
        }
    }

    /* @Desc: Save sp content as a note record*/
    @AuraEnabled
    public static void saveSpContentToNoteDB(String paramJSON) {
        try {

            SpParamWrapper paramWrapper = (SpParamWrapper)JSON.deserialize(paramJSON, SpParamWrapper.class);
            ContentNote newNote = new ContentNote(
                Content = Blob.valueOf(paramWrapper.content.escapeHTML4()),
                Title = 'Created From Scratch Pad'
            );
                  
            insert newNote;

            ContentDocumentLink cdLink = new ContentDocumentLink(
                LinkedEntityId = paramWrapper.recordId,
                ContentDocumentId = newNote.Id 
            );

            insert cdLink;

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    
    /* @Desc: Read SP content from DB. @Param:RecordId is the actual record against which scratch pad record is saved */
    @AuraEnabled(cacheable=true)
    public static Scratch_Pad__c readSpContentFromDB(String recordId) {
        System.debug('record Id in read call > ' + recordId);
        
        try {
            List<Scratch_Pad__c> sp_record = [SELECT Id, sp_notes__c, Sp_Record_Id__c FROM Scratch_Pad__c WHERE sp_Record_Id__c =:recordId AND OwnerId =:UserInfo.getUserId() LIMIT 1]; // @note: There will be always a single sp record exist with respect to given record and ownerid
    
            if(!sp_record.isEmpty()) {
                return sp_record[0];
            } else {
                return null;
            }
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    class SpParamWrapper {
        String recordId;
        String content;
    }
}