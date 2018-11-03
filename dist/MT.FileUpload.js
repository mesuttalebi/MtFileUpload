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
        this.mtImgPreview = "mtImgPreview";
        this.options = {
            // 4 MB
            maxSize: 1024 * 1024 * 4,
            types: [FileTypes.image],
            inputReplacementTemplate: "<button type='button' class='btn btn-primary' id='MtFileUpload'>Dosya Seç...</button>",
            previewImgTemaplte: "<img alt='' class='img-thumbnail " + this.mtImgPreview + "' />"
        };
        this.inputName = inputName;
        this.initDom();
        this.bindEvents();
    }
    /**
     * replaces file input area with bootstrap button
     * */
    MtFileUpload.prototype.initDom = function () {
        console.log($(this.inputName));
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
        $(fileInput).on('change', function (ev) {
            $(self.options.previewContainer).html('');
            var inputElm = this;
            if (self.checkFileValidity(inputElm.files, self.options.types)) {
                var reader = new FileReader();
                // inject an image with the src url
                if (self.options.types.some(function (value) { return value >= FileTypes.png; })) {
                    reader.onload = function (event) {
                        var preview = $(self.options.previewImgTemaplte).attr('src', event.target.result.toString());
                        $(self.options.previewContainer).append(preview);
                    };
                    if (inputElm.files.length > 0) {
                        var ul = '<ul></ul>';
                        // when the file is read it triggers the onload event above.  
                        for (var i = 0; i < inputElm.files.length; i++) {
                            if (inputElm.files[i].type.indexOf("image/") >= 0) {
                                reader.readAsDataURL(inputElm.files[i]);
                            }
                            var li = "<li>" + inputElm.files[i].name + "</li>";
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
    };
    MtFileUpload.prototype.checkFileValidity = function (files, types) {
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
                return fileType.indexOf("image/") >= 0;
            default:
                return false;
        }
    };
    return MtFileUpload;
}());
