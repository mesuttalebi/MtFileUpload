interface MtFileUploadOptions {
    /**
     * Maxiumum allowed file size in bytes (Default: 4MB)
     * */
    maxSize: number,
    /**
     * Allowed file types. (Default: image)
     * */
    types: Array<FileTypes>,
    /**
     * Selector 
     */
    previewContainer: string,
    /**
     * Selector
     * */
    errorMessageContainer: string,
    /**
     * Template for replacing element instead of file input element.
     * */
    inputReplacementTemplate: string,
    /**
     * Template for image item
     * */
    previewImgTemaplte: string,
    /**
     * Template for remove button
     */
    // TODO: implement later
    //removeButtonTemplate: string,
}

enum FileTypes {
    xls,
    xlsx,
    pdf,
    doc,
    docx,
    txt,
    xml,
    png,
    jpg,
    gif,
    tif,
    jpeg,
    image
}

enum ErrorTypes {
    FileSizeError,
    FileTypeError
}

class MtFileUpload {
    private readonly mtImgPreview = "mt-img-preview";
    private readonly mtRemoveBtnClass = "mt-remove-file";    

    public options: MtFileUploadOptions = <MtFileUploadOptions>{
        // 4 MB
        maxSize: 1024 * 1024 * 4,
        types: [FileTypes.image],
        inputReplacementTemplate: "<button type='button' class='btn btn-primary' id='MtFileUpload'>Dosya Seç...</button>",
        previewImgTemaplte: `<img alt='' class='img-thumbnail ${this.mtImgPreview}' />`,
        //removeButtonTemplate: `<a href="javascript:;" class="${this.mtRemoveBtnClass} text-danger">X Remove</a><br/>`
    }

    constructor(private inputName: string) {
        this.inputName = inputName;

        this.initDom();
        this.bindEvents();
    }

    /**
     * replaces file input area with bootstrap button
     * */
    private initDom(): void {       
        let fileInput = $(this.inputName);

        fileInput.after(this.options.inputReplacementTemplate);
        fileInput.css('position', 'absolute');
        fileInput.css('left', '-9999999px');

        var templateId = '#' + $(this.options.inputReplacementTemplate).attr('id');
        console.log(templateId);

        $(templateId).on('click', function () {
            fileInput.trigger('click');
        });
    }

    /**
     * Binds Events to when files added.
     * */
    private bindEvents(): void {
        let fileInput = $(this.inputName);
        let self = this;
        $(fileInput).on('change', function () {
            
            // Empty the container.
            $(self.options.previewContainer).html('');
            var fileInput = (<HTMLInputElement>this);

            // Check for files validity
            if (self.checkFileValidity(fileInput.files, self.options.types)) {                
                
                // Preview Container markup
                let ul = '<ul></ul>';
                $(self.options.previewContainer).append(ul);

                // loop files to load details into container
                for (var i = 0; i < fileInput.files.length; i++) {                        
                    let currentFile = fileInput.files[i];                    

                    // inject an image with the src url                    
                    if(self.typeCheck(currentFile.type, FileTypes.image)){
                        self.previewImage(currentFile);                        
                    }
                    else {
                        // If file is not image    
                        //var removeBtn = $(self.options.removeButtonTemplate).attr('data-file',currentFile.name).clone();                    
                        let li = $(`<li>${currentFile.name}<br />${self.parseFileSize(currentFile.size)}</li>`);//.prepend(removeBtn);
                        $(self.options.previewContainer).find('ul').append(li);
                    }
                }                            
            }
        });

        // $(document).on('click','.' + self.mtRemoveBtnClass, function(ev) {
        //     ev.stopPropagation();
        //     ev.preventDefault();
        //     var fileToRemove= $(ev.target).attr('data-file');
        //     self.storedFiles.forEach((file, i ) => {
        //         if(file.name === fileToRemove)
        //         {
        //             self.storedFiles = self.storedFiles.splice(i,1);
        //             return;
        //         }
        //     });

        //     $(this).parents('li').remove();            
            
        //     // for(let i =0; i < self.storedFiles.length; i++) {
                                           
        //     // }
        //     console.log(fileToRemove);
        // });
    }

    private previewImage(currentFile: File) {
        let self = this;
        let reader = new FileReader();        
        // when the file is read it triggers the onload event above. 
        reader.readAsDataURL(currentFile);

        reader.onload = function (event: ProgressEvent) {
            let preview = $(self.options.previewImgTemaplte).attr('src', (<FileReader>event.target).result.toString());
            let img = $(preview).clone();
            //let removeBtn = $(self.options.removeButtonTemplate).attr('data-file',currentFile.name).clone();
            // let li = $("<li></li>").append(removeBtn).append(img);            
             let li = $("<li></li>").append(img);            
            $(self.options.previewContainer).find('ul').append(li);
        };
    }

    checkFileValidity(files, types: Array<FileTypes>) {        
        if (File && FileReader && FileList && window.Blob) {
            // when the file is read it triggers the onload event above.
            for (var i = 0; i < files.length; i++) {
                if (files[i]) {
                    var file = files[i];
                    var typeIsValid = false;

                    //if (Object.prototype.toString.call(types) === '[object Array]') {                        
                    for (var t = 0; t < types.length; t++) {
                        typeIsValid = this.typeCheck(file.type, types[t]);
                        if (typeIsValid) {
                            break;
                        }
                    }
                    //}

                    if (!typeIsValid) {
                        this.addError(ErrorTypes.FileTypeError, file.name);
                        return false;
                    } else {                        
                        this.removeError();
                    }

                    if (file.size > this.options.maxSize) {
                        this.addError(ErrorTypes.FileSizeError, file.name);
                        return false;
                    } else if (!typeIsValid) {
                        this.removeError();
                    }

                   
                }
                else {
                    this.removeError();

                    return false;
                }
            }

            return true;
        }
    }

    addError(errorType, fileName) {
        //$('input[name="' + this.inputName + '"]').addClass('input-validation-error');
        let inputNameCleared = this.inputName.substr(1);
        let errorContainer = this.options.errorMessageContainer;
        if (errorContainer === undefined || errorContainer === null) {
            errorContainer = 'span[data-valmsg-for="' + inputNameCleared + '"]';
        }

        let errorSpan = $(errorContainer);
        errorSpan.removeClass('field-validation-valid').addClass('field-validation-error');
      
        let errorMessage:string = '';
        if (errorType === ErrorTypes.FileSizeError) {
            if ($(errorSpan).text().length > 0)
                errorMessage += '<br/>';
            errorMessage += '"' + fileName + '": Doküman en fazla ' + this.parseFileSize(this.options.maxSize) + ' olmalıdır.';;
        }
        else if (errorType === ErrorTypes.FileTypeError) {
            errorMessage += '"' + fileName + '": Dosya türü hatalı! (kabul edilen dosya tür(ü/leri): "' + this.options.types.map<string>((value) => { return FileTypes[value] }).join(',') + '").<br/>';
        }        

        errorSpan.html(errorMessage);
        $(this.inputName).val('');
    }

    removeError() {
        let inputNameCleared = this.inputName.substr(1);
        let errorContainer = this.options.errorMessageContainer;
        if (errorContainer === undefined || errorContainer === null) {
            errorContainer = 'span[data-valmsg-for="' + inputNameCleared + '"]';
        }

        let errorSpan = $(errorContainer);
        errorSpan.removeClass('field-validation-error').addClass('field-validation-valid').html('');
    }

    parseFileSize(bytes: number): string {
        let thresh = 1024;
        if (bytes < thresh) return bytes + ' B';
        let units = ['KB', 'MB', 'GB'];
        let u = -1;
        do {
            bytes /= thresh;
            ++u;
        } while (bytes >= thresh);
        return bytes.toFixed(1) + ' ' + units[u];
    }

    typeCheck(fileType, type): boolean {
        switch (type) {
            case FileTypes.xls:
            case FileTypes.xlsx:
                return fileType.indexOf("officedocument.spreadsheetml.sheet") >= 0 || fileType.indexOf("vnd.ms-excel") >= 0;
            case FileTypes.pdf:
                return fileType.indexOf("application/pdf") >= 0;
            case FileTypes.doc:
            case FileTypes.docx:
                return fileType.indexOf("application/msword") >= 0 || fileType.indexOf("vnd.ms-word") >= 0 || fileType.indexOf("officedocument.wordprocessingml.document") >= 0;
            case FileTypes.png:
            case FileTypes.jpg:
            case FileTypes.gif:
            case FileTypes.jpeg:
            case FileTypes.tif:
            case FileTypes.image:
                return fileType.indexOf("image/") >= 0 && fileType.indexOf("ico") === -1;
            default:
                return false;
        }
    }   
}
