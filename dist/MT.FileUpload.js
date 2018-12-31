var FileTypes;
(function (FileTypes) {
    FileTypes[FileTypes["xls"] = 0] = "xls";
    FileTypes[FileTypes["xlsx"] = 1] = "xlsx";
    FileTypes[FileTypes["pdf"] = 2] = "pdf";
    FileTypes[FileTypes["doc"] = 3] = "doc";
    FileTypes[FileTypes["docx"] = 4] = "docx";
    FileTypes[FileTypes["txt"] = 5] = "txt";
    FileTypes[FileTypes["xml"] = 6] = "xml";
    FileTypes[FileTypes["png"] = 7] = "png";
    FileTypes[FileTypes["jpg"] = 8] = "jpg";
    FileTypes[FileTypes["gif"] = 9] = "gif";
    FileTypes[FileTypes["tif"] = 10] = "tif";
    FileTypes[FileTypes["jpeg"] = 11] = "jpeg";
    FileTypes[FileTypes["image"] = 12] = "image";
})(FileTypes || (FileTypes = {}));
var ErrorTypes;
(function (ErrorTypes) {
    ErrorTypes[ErrorTypes["FileSizeError"] = 0] = "FileSizeError";
    ErrorTypes[ErrorTypes["FileTypeError"] = 1] = "FileTypeError";
})(ErrorTypes || (ErrorTypes = {}));
var MtFileUpload = /** @class */ (function () {
    function MtFileUpload(inputName) {
        this.inputName = inputName;
        this.mtImgPreview = "mt-img-preview";
        this.mtRemoveBtnClass = "mt-remove-file";
        this.options = {
            // 4 MB
            maxSize: 1024 * 1024 * 4,
            types: [FileTypes.image],
            inputReplacementTemplate: "<button type='button' class='btn btn-primary' id='MtFileUpload'>Dosya Seç...</button>",
            previewImgTemaplte: "<img alt='' class='img-thumbnail " + this.mtImgPreview + "' />",
        };
        this.inputName = inputName;
        this.initDom();
        this.bindEvents();
    }
    /**
     * replaces file input area with bootstrap button
     * */
    MtFileUpload.prototype.initDom = function () {
        var fileInput = $(this.inputName);
        fileInput.after(this.options.inputReplacementTemplate);
        fileInput.css('position', 'absolute');
        fileInput.css('left', '-9999999px');
        var templateId = '#' + $(this.options.inputReplacementTemplate).attr('id');
        console.log(templateId);
        $(templateId).on('click', function () {
            fileInput.trigger('click');
        });
    };
    /**
     * Binds Events to when files added.
     * */
    MtFileUpload.prototype.bindEvents = function () {
        var fileInput = $(this.inputName);
        var self = this;
        $(fileInput).on('change', function () {
            // Empty the container.
            $(self.options.previewContainer).html('');
            var fileInput = this;
            // Check for files validity
            if (self.checkFileValidity(fileInput.files, self.options.types)) {
                // Preview Container markup
                var ul = '<ul></ul>';
                $(self.options.previewContainer).append(ul);
                // loop files to load details into container
                for (var i = 0; i < fileInput.files.length; i++) {
                    var currentFile = fileInput.files[i];
                    // inject an image with the src url                    
                    if (self.typeCheck(currentFile.type, FileTypes.image)) {
                        self.previewImage(currentFile);
                    }
                    else {
                        // If file is not image    
                        //var removeBtn = $(self.options.removeButtonTemplate).attr('data-file',currentFile.name).clone();                    
                        var li = $("<li>" + currentFile.name + "<br />" + self.parseFileSize(currentFile.size) + "</li>"); //.prepend(removeBtn);
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
    };
    MtFileUpload.prototype.previewImage = function (currentFile) {
        var self = this;
        var reader = new FileReader();
        // when the file is read it triggers the onload event above. 
        reader.readAsDataURL(currentFile);
        reader.onload = function (event) {
            var preview = $(self.options.previewImgTemaplte).attr('src', event.target.result.toString());
            var img = $(preview).clone();
            //let removeBtn = $(self.options.removeButtonTemplate).attr('data-file',currentFile.name).clone();
            // let li = $("<li></li>").append(removeBtn).append(img);            
            var li = $("<li></li>").append(img);
            $(self.options.previewContainer).find('ul').append(li);
        };
    };
    MtFileUpload.prototype.checkFileValidity = function (files, types) {
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
                    }
                    else {
                        this.removeError();
                    }
                    if (file.size > this.options.maxSize) {
                        this.addError(ErrorTypes.FileSizeError, file.name);
                        return false;
                    }
                    else if (!typeIsValid) {
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
    };
    MtFileUpload.prototype.addError = function (errorType, fileName) {
        //$('input[name="' + this.inputName + '"]').addClass('input-validation-error');
        var inputNameCleared = this.inputName.substr(1);
        var errorContainer = this.options.errorMessageContainer;
        if (errorContainer === undefined || errorContainer === null) {
            errorContainer = 'span[data-valmsg-for="' + inputNameCleared + '"]';
        }
        var errorSpan = $(errorContainer);
        errorSpan.removeClass('field-validation-valid').addClass('field-validation-error');
        var errorMessage = '';
        if (errorType === ErrorTypes.FileSizeError) {
            if ($(errorSpan).text().length > 0)
                errorMessage += '<br/>';
            errorMessage += '"' + fileName + '": Doküman en fazla ' + this.parseFileSize(this.options.maxSize) + ' olmalıdır.';
            ;
        }
        else if (errorType === ErrorTypes.FileTypeError) {
            errorMessage += '"' + fileName + '": Dosya türü hatalı! (kabul edilen dosya tür(ü/leri): "' + this.options.types.map(function (value) { return FileTypes[value]; }).join(',') + '").<br/>';
        }
        errorSpan.html(errorMessage);
        $(this.inputName).val('');
    };
    MtFileUpload.prototype.removeError = function () {
        var inputNameCleared = this.inputName.substr(1);
        var errorContainer = this.options.errorMessageContainer;
        if (errorContainer === undefined || errorContainer === null) {
            errorContainer = 'span[data-valmsg-for="' + inputNameCleared + '"]';
        }
        var errorSpan = $(errorContainer);
        errorSpan.removeClass('field-validation-error').addClass('field-validation-valid').html('');
    };
    MtFileUpload.prototype.parseFileSize = function (bytes) {
        var thresh = 1024;
        if (bytes < thresh)
            return bytes + ' B';
        var units = ['KB', 'MB', 'GB'];
        var u = -1;
        do {
            bytes /= thresh;
            ++u;
        } while (bytes >= thresh);
        return bytes.toFixed(1) + ' ' + units[u];
    };
    MtFileUpload.prototype.typeCheck = function (fileType, type) {
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
    };
    return MtFileUpload;
}());
