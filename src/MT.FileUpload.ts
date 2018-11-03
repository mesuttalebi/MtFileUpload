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
    private readonly mtImgPreview = "mtImgPreview";

    public options: MtFileUploadOptions = <MtFileUploadOptions>{
        // 4 MB
        maxSize: 1024 * 1024 * 4,
        types: [FileTypes.image],
        inputReplacementTemplate: "<button type='button' class='btn btn-primary' id='MtFileUpload'>Dosya Seç...</button>",
        previewImgTemaplte: `<img alt='' class='img-thumbnail ${this.mtImgPreview}' />`
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
        console.log($(this.inputName));
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
        $(fileInput).on('change', function (ev) {
            $(self.options.previewContainer).html('');
            let inputElm = <HTMLInputElement>this;
            if (self.checkFileValidity(inputElm.files, self.options.types)) {

                var reader = new FileReader();

                // inject an image with the src url
                if (self.options.types.some((value) => { return value >= FileTypes.png })) {

                    reader.onload = function (event: ProgressEvent) {
                        var preview = $(self.options.previewImgTemaplte).attr('src', (<FileReader>event.target).result.toString());
                        $(self.options.previewContainer).append(preview);                        
                    }

                    if (inputElm.files.length > 0) {
                        let ul = '<ul></ul>';
                        // when the file is read it triggers the onload event above.  
                        for (var i = 0; i < inputElm.files.length; i++) {
                            if (inputElm.files[i].type.indexOf("image/") >= 0) {
                                reader.readAsDataURL(inputElm.files[i]);
                            }

                            let li = "<li>" + inputElm.files[i].name + "</li>";
                            $(ul).append(li);
                        }
                        $(self.options.previewContainer).append(ul);
                    }
                    else {
                        // 
                        // What to do if no files added?
                    }
                }                                
            }
        });
    }

    checkFileValidity(files, types: Array<FileTypes>) {        
        if (File && FileReader && FileList && window.Blob) {
            // when the file is read it triggers the onload event above.
            for (var i = 0; i < files.length; i++) {
                if (files[i]) {
                    var file = files[i];
                    var typeIsValid = false;

                    if (Object.prototype.toString.call(types) === '[object Array]') {
                        for (var t = 0; t < types.length; t++) {
                            typeIsValid = this.typeCheck(file.type, types[t]);
                            if (!typeIsValid) {
                                break;
                            }
                        }
                    }

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
                return fileType.indexOf("image/") >= 0;
            default:
                return false;
        }
    }
}
