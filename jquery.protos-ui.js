// protos-ui 
// version: 0.1 beta
// creator: Simeon Nenov

// TODO: function generateElement()
// TODO: Improve performance
// TODO: Write documentation
// TODO: Cookies
// TODO: Aminations
// TODO: Confirmation window

(function($, document) {
    //--------------------------------------------------- ProtoCore code BEGIN ------------------------------------------------------

    function getFunctionName(fn) {
        return (fn.toString().match(/function (.+?)\(/) || [, ''])[1];
    }

    function getElementOffset(element) {
        var _x = 0;
        var _y = 0;
        while (element && !isNaN(element.offsetLeft) && !isNaN(element.offsetTop)) {
            _x += element.offsetLeft - element.scrollLeft;
            _y += element.offsetTop - element.scrollTop;
            element = element.offsetParent;
        }
        return {
            top: _y,
            left: _x
        };
    }

    function template(templateId, values) {
        this.render = function() {
            return convertTemplateToString(templateId, values);
        };
    };

    function createInstance(options, author, func) {
        var newOptions = {
            author: author,
            widgetName: protos.getFunctionName(func),
        };

        options = $.extend(options, newOptions);
        var widgetName = options.widgetName;
        var widget = new func(options);

        $.extend(widget, protos.widget[widgetName]); //Apply public methods from protos.widget.<widgetName> to the new instance of widget
        $.data(options.author[0], widgetName, widget); // (func).name returns name of function "func"

    }

    //Attach protos object to jQery object
    $.fn.protos = function() {
        var that = this;
        return {
            popUp: function(options) {
                createInstance(options, that, popUp);
            },
            alertPopUp: function(text, options) {
                if (typeof(text) === 'string') {
                    options = {};
                    options["content"] = text;
                } else {
                    options = text;
                }
                createInstance(options, that, alertPopUp);
            },
            swap: function(options) {
                createInstance(options, that, swap);
            },
            draggable: function(options) {
                createInstance(options, that, draggable);
            },
        };
    }

    this.protos = function() {
        this.widget = {
            popUp: popUp,
            draggable: draggable,
            swap: swap,
            alertPopUp: alertPopUp
        };

        return {
            template: template,
            getElementOffset: getElementOffset,
            widget: this.widget,
            getFunctionName: getFunctionName,
            generateHTML: generateHTML
        };
    }();

    function convertTemplateToString(templateId, values) {
        var template = $("#" + templateId);

        if (template.length !== 0) {
            var html = template.html();
            var result = html.displayStringsTemplate(values).executeJavaScriptInTemplate(values);
            return result; //If exsist object with templateId return html
        } else {
            return templateId.displayStringsTemplate(values).executeJavaScriptInTemplate(values); //If isn't exist return the exact string (template)
        }
    }

    String.prototype.executeJavaScriptInTemplate = function(values) {
        for (var name in values) {
            window[name] = values[name];
        }

        var templateHtml = this;
        var firstIndexOfHash = templateHtml.indexOf("#");
        var lastIndexOfHash = templateHtml.lastIndexOf("#");
        var templateHtmlLenght = templateHtml.length;

        for (var i = firstIndexOfHash; i <= lastIndexOfHash; i++) {
            var startIndex = templateHtml.indexOf("#", i);
            if (startIndex !== -1) {
                startIndex += 1;

                var endIndex = templateHtml.indexOf("#", startIndex);
                var stringForExecuting = templateHtml.substr(startIndex, endIndex - startIndex);

                templateHtml = templateHtml.substr(0, startIndex - 2) + templateHtml.substr(endIndex + 2, templateHtmlLenght)
                i = startIndex - 2;

                eval(stringForExecuting);
            } else {
                break;
            }
        }
        return templateHtml;
    }

    String.prototype.displayStringsTemplate = function(values) {
        for (var name in values) {
            window[name] = values[name];
        }

        var templateHtml = this;
        var firstIndexOfHash = templateHtml.indexOf("#=");
        var lastIndexOfHash = templateHtml.lastIndexOf("#");
        var templateHtmlLenght = templateHtml.length;

        for (var i = firstIndexOfHash; i <= lastIndexOfHash; i++) {
            var startIndex = templateHtml.indexOf("#=", i);
            if (startIndex !== -1) {
                startIndex += 2; //Add string literal length
                var endIndex = templateHtml.indexOf("#", startIndex); //Find end of string literal
                var stringForExecuting = templateHtml.substr(startIndex, endIndex - startIndex); //Get the string which will be executed
                templateHtml = templateHtml.substr(0, startIndex - 2) + eval(stringForExecuting) + templateHtml.substr(endIndex + 1, templateHtmlLenght);

                i = startIndex - 2;
            } else {
                break;
            }
        }
        return templateHtml;
    }

    function generateHTML(options) {
        var defaultOptions = {
            tag: "div",
            classes: [],
            styles: {},
            text: "",
            id: ""
        };
        options = $.extend(defaultOptions, options);
        var html = "";
        var tagName = options.tag;

        function openTag() {
            html += '<' + tagName + ' ';
        }

        function closeTag() {
            html += '</' + tagName + '>';
        }

        function addIdOfElement() {
            var id = options.id;
            if (id !== "") {
                html += 'id="' + id + '" ';
            } else {
                html += ' ';
            }
        }

        function addClasses() {
            var classes = options.classes;
            if (classes !== null) {
                html += 'class="' + classes.join(" ") + '"';
            }
        }

        function addContent() {
            html += '>' + options.text;
        }

        (function generate() {
            openTag();
            addIdOfElement();
            addClasses();
            addContent();
            closeTag();
        })();

        return html;


    }
    //--------------------------------------------------- ProtoCore code END ------------------------------------------------------


    //--------------------------------------------------- PopUp code BEGIN ------------------------------------------------------

    function popUpCore(options) {
        this.author = $(options.author.selector);
        var visible = false;
        this.darkLayerHtml = '<div class="p-darkLayer" style="background-color: rgba(0,0,0,' + options.darkness + '); "></div>';
        this.contentHtml = '<div class="p-popUpContent">' + options.content + '</div>';
        this.titleHtml = '<div class="p-popUpTitle">' + options.title + '</div>';
        this.closePopUpButtonHtml = '<a href="#"><div class="p-closePopUpButton">X</div></a>';
        this.body = $("body");
        var that = this;

        (function attachPopUpEvents() {
            that.author.on("showPopUp", function() {
                if (!visible) {
                    that.showPopUp(options);
                }
            });

            that.author.on("hidePopUp", function() {
                that.hidePopUp();
            });
        })();

        this.show = function() { //Show function bind "show" event to jQuery object
            that.author.trigger("showPopUp");
        };

        this.hide = function() { //Hide function bind "hide" event to jQuery object
            that.author.trigger("hidePopUp");
        };

        //Function that shows the popUp when "show" event is fired

        this.showPopUp = function(options) {
            //Add elements in DOM
            popUpObject = that.addElements(options.darkness);

            //Set css properties wich come from options
            that.addStyles(options, popUpObject);

            var instanceFromData = $.data(that.author[0], options.widgetName); // $.data(...) is faster than $(...).data()
            that.attachCloseEvents(instanceFromData);

            visible = true;
            //TODO: When press ESC button close popUp
        }

        this.attachCloseEvents = function(instanceFromData) {
            $("a").on('click', ".p-closePopUpButton", function() {
                instanceFromData.hide();
            });

            that.body.on('click', ".p-darkLayer", function() {
                instanceFromData.hide();
            });
        }

        this.hidePopUp = function() {
            $(".p-PopUp").remove();
            $(".p-darkLayer").remove();
            visible = false;
        }

        this.addElements = function() {
            that.popUpHtml = '<div class="p-PopUp">' + that.closePopUpButtonHtml + that.addTitle() + that.contentHtml + '</div>';
            that.body.append(that.darkLayerHtml); //Apply dark layer
            that.body.append(that.popUpHtml); //Add popUp div
            that.makeTitleDraggable();

            var popUp = $(".p-PopUp", "body");

            return popUp;
        }

        this.addStyles = function(options, popUp) {

            console.profile("declarations");
            var documentElement = document.body;
            var popUpLeftPosition = (window.innerWidth / 2) - (options.width / 2); //Calculate popUp left position
            var popUpTopPosition = (window.innerHeight / 2) - (options.height / 2); //Calculate popUp top position
            console.profileEnd("declarations");

            console.profile("setting styles");
            popUp.css({
                left: popUpLeftPosition + "px",
                top: popUpTopPosition + "px",
                width: options.width + "px",
                height: options.height + "px",
                position: "fixed",
            });

            $(".p-popUpContent", "div.p-PopUp").css({
                width: options.width + "px",
                height: options.height - 50 + "px",
                "overflow-y": "auto",
                "overflow-x": "auto",
            });
            console.profileEnd("setting styles");
        }

        this.makeTitleDraggable = function() {
            if (options.title && options.draggable === true) {
                $(".p-popUpTitle").protos().draggable({ //Makes popup draggable
                    moveParent: ".p-PopUp",
                    isParentDraggable: options.isContentDraggable === true ? true : false
                });
            }
        }

        this.addTitle = function() {
            if (options.title) {
                return that.titleHtml;
            }
            return "";
        }
    }

    function popUp(options) {
        var author = $(options.author.selector),
            visible = false;
        var darkLayerHtml = '<div class="p-darkLayer" style="background-color: rgba(0,0,0,' + options.darkness + '); "></div>';
        var contentHtml = '<div class="p-popUpContent">' + options.content + '</div>',
            popUpHtml = '<div class="p-PopUp"></div>',
            body = $("body"),
            titleHtml = '<div class="p-popUpTitle">' + options.title + '</div>',
            closePopUpButtonHtml = '<a href="#"><div class="p-closePopUpButton">X</div></a>';

        (function attachPopUpEvents() {
            author.on("showPopUp", function() {
                if (!visible) {
                    showPopUp(options);
                }
            });

            author.on("hidePopUp", function() {
                hidePopUp();
            });
        })();

        this.show = function() { //Show function bind "show" event to jQuery object
            author.trigger("showPopUp");
        };

        this.hide = function() { //Hide function bind "hide" event to jQuery object
            author.trigger("hidePopUp");
        };

        //Function that shows the popUp when "show" event is fired

        function showPopUp(options) {
            //Add elements in DOM
            elements = addElements(options.darkness);

            //Set css properties wich come from options
            addStyles(options, elements.popUp);

            var instanceFromData = $.data(author[0], options.widgetName); // $.data(...) is faster than $(...).data()
            attachCloseEvents(instanceFromData);

            visible = true;
            //TODO: When press ESC button close popUp
        }

        function attachCloseEvents(instanceFromData) {
            $("a").on('click', ".p-closePopUpButton", function() {
                instanceFromData.hide();
            });

            elements.body.on('click', ".p-darkLayer", function() {
                instanceFromData.hide();
            });
        }

        function hidePopUp() {
            $(".p-PopUp").remove();
            $(".p-darkLayer").remove();
            visible = false;
        }

        function addElements() {
            body.append(darkLayerHtml); //Apply dark layer
            body.append(popUpHtml); //Add popUp div

            var popUp = $(".p-PopUp");

            popUp.append(closePopUpButtonHtml); //Add button that fires "hide" event

            if (options.title) {
                popUp.append(titleHtml);

                if (options.draggable === true) {
                    $(".p-popUpTitle").protos().draggable({ //Makes popup draggable
                        moveParent: ".p-PopUp",
                        isParentDraggable: options.isContentDraggable === true ? true : false
                    });
                }
            }

            popUp.append(contentHtml); //Add popUp content

            return {
                popUp: popUp,
                body: body
            };
        }

        function addStyles(options, popUp) {

            var documentElement = document.body;
            var popUpLeftPosition = (window.innerWidth / 2) - (options.width / 2); //Calculate popUp left position
            var popUpTopPosition = (window.innerHeight / 2) - (options.height / 2); //Calculate popUp top position

            popUp.css({
                left: popUpLeftPosition + "px",
                top: popUpTopPosition + "px",
                width: options.width + "px",
                height: options.height + "px",
                position: "fixed",
            });

            $(".p-popUpContent").css({
                width: options.width + "px",
                height: options.height - 50 + "px",
                "overflow-y": "auto",
                "overflow-x": "auto",
            });
        }

    };
    //--------------------------------------------------- PopUp code END --------------------------------------------------------

    //--------------------------------------------------- Aler code BEGIN ------------------------------------------------------

    function alertPopUp(options) {
        var defaultOptions = {
            width: 380,
            height: 120,
            author: $(document),
            widgetName: "alertPopUp",
            darkness: 0.3,
            title: "JavaScript Alert",
            draggable: true
        };
        options = $.extend(defaultOptions, options);
        options.content += '<div style="padding-top: 15px; text-align: center;"><button>Ok</button></div>';

        var defaultPopUp = new popUpCore(options);
        var dataObject = options.author[0];

        defaultPopUp.hidePopUp = function() {
            $(".p-PopUp").remove();
            $(".p-darkLayer").remove();
            visible = false;
            $.removeData(dataObject, "alertPopUp");
        }

        $.data(dataObject, "alertPopUp", defaultPopUp);
        $.data(dataObject, "alertPopUp").show();

        return defaultPopUp;
    }
    //--------------------------------------------------- Alert code END --------------------------------------------------------

    //--------------------------------------------------- Swap code BEGIN ------------------------------------------------------

    function swap(options) {
        var author = options.author;

        author.on(options.event, function() {
            author.data(options.widgetName).start();
        });

        this.start = function() {
            author.animate({
                width: 0,
            }, options.speed / 2);

            var old = $(options.element).width();
            $(options.element).width(0);
            $(options.element).css("display", "");

            $(options.element).animate({
                width: old,
            }, options.speed / 2);
        }
    }
    //--------------------------------------------------- Swap code END --------------------------------------------------------

    //--------------------------------------------------- Draggable code BEGIN ------------------------------------------------------

    function draggable(options) {
        var clicked = false;
        var clickPositionX,
            clickPositionY,
            author = $(options.author.selector),
            draggable; // author is draggable element

        if (options.moveParent && options.isParentDraggable) {
            author = $(options.moveParent);
            draggable = $(options.moveParent);
        } else {
            draggable = $(options.moveParent);
        }

        author.on('mousedown', function(e) {
            clicked = true;
            clickPositionX = e.clientX - protos.getElementOffset(this).left;
            clickPositionY = e.clientY - protos.getElementOffset(this).top;
            var container = options.container;

            if (container) { // If draggable object hasn't got setted container jus bind simple draggable 
                $(document).on('mousemove', function(e) {
                    var xPosition = e.clientX - clickPositionX,
                        yPosition = e.clientY - clickPositionY
                    var containerOffset = protos.getElementOffset($(container)[0]);


                    container = $(options.container);
                    protos.getElementOffset(author.element).left;

                    if (containerOffset.left < xPosition && containerOffset.top < yPosition) // Check does draggable element is in container
                    {
                        var authorRightBorder = protos.getElementOffset(author[0]).left + author.outerWidth(),
                            authorBottomBorder = protos.getElementOffset(author[0]).top + author.outerHeight();
                        var containerWidth = containerOffset.left + container.outerWidth();
                        var containerHeight = containerOffset.top + container.outerHeight();
                        var x = containerWidth - author.outerWidth(),
                            y = containerHeight - author.outerHeight() - 1;

                        if (authorRightBorder <= containerWidth) {
                            setPosition(draggable, xPosition, "");
                        } else {
                            setPosition(draggable, x, "");
                        }

                        if (authorBottomBorder < containerHeight - 1) {
                            setPosition(draggable, "", yPosition);
                        } else {
                            setPosition(draggable, "", y);
                        }
                    }

                });
            } else {
                $(document).on('mousemove', function(e) {
                    var xPosition = e.clientX - clickPositionX,
                        yPosition = e.clientY - clickPositionY
                    var containerOffset = protos.getElementOffset($(container)[0]);

                    setPosition(draggable, xPosition, yPosition);
                });
            }



            $(document).on('mouseup', function() {
                clicked = false;
                $(document).unbind('mousemove');
            });

            function setPosition(element, x, y) {
                var styles = {};
                if (x) {
                    $.extend(styles, {
                        left: x + "px"
                    });
                }
                if (y) {
                    $.extend(styles, {
                        top: y + "px"
                    });
                }
                element.css(styles);
            }
        });
    }
    //--------------------------------------------------- Draggable code END --------------------------------------------------------

    // popUp.prototype.trigger = function(eventName){
    // var options = this.options;
    // $(options.author.selector).data("protoPopUp").show(options);
    // };
})(jQuery, document);