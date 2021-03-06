// protos-ui 
// version: 0.1
// creator: Simeon Nenov

// TODO: Improve performance -String search (better algorithm) ....
// TODO: Escape # symbol in templates
// TODO: Write documentation
// TODO: Cookies
// TODO: Animations
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
            widgetName: protos.getFunctionName(func)
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
            }
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

    function generateHTML() {
        var defaultOptions = {
            tag: "div",
            classes: [],
            text: "",
            id: ""
        },
            arrg = arguments,
            options = {
                tag: arrg[0],
                classes: arrg[1],
                text: arrg[2],
                id: arrg[3]
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

    //--------------------------------------------------- PopUpCore code BEGIN ------------------------------------------------------

    function popUpCore(options) {
        this.author = $(options.author.selector);
        var visible = false,
            generateHTML = protos.generateHTML, CLOSEBUTTONCLASS = "p-closePopUpButton", CONTENTCLASS = "p-popUpContent", POPUPCLASS = ".p-PopUp";
        this.darkLayerHtml = '<div class="p-darkLayer" style="background-color: rgba(0,0,0,' + options.darkness + '); "></div>';
        this.contentHtml = generateHTML("div",[CONTENTCLASS], options.content); 
        this.titleHtml = generateHTML("div",["p-popUpTitle"], options.title);
        this.closePopUpButtonHtml = '<a href="#">' + generateHTML("div", [CLOSEBUTTONCLASS], "X") + '</a>';
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
            $("div" + POPUPCLASS + " a").on('click', "." + CLOSEBUTTONCLASS, function() {
                instanceFromData.hide();
            });

            that.body.on('click', ".p-darkLayer", function() {
                instanceFromData.hide();
            });
        }

        this.hidePopUp = function() {
            $(POPUPCLASS).remove();
            $(".p-darkLayer").remove();
            visible = false;
        }

        this.addElements = function() {
            that.popUpHtml = '<div class="p-PopUp">' + that.closePopUpButtonHtml + that.addTitle() + that.contentHtml + '</div>';
            that.body.append(that.darkLayerHtml); //Apply dark layer
            that.body.append(that.popUpHtml); //Add popUp div
            that.makeTitleDraggable();

            var popUp = $(POPUPCLASS, "body");

            return popUp;
        }

        this.addStyles = function(options, popUp) {
            var documentElement = document.body;
            var popUpLeftPosition = (window.innerWidth / 2) - (options.width / 2); //Calculate popUp left position
            var popUpTopPosition = (window.innerHeight / 2) - (options.height / 2); //Calculate popUp top position

            popUp.css({
                left: popUpLeftPosition + "px",
                top: popUpTopPosition + "px",
                width: options.width + "px",
                height: options.height + "px",
                position: "fixed"
            });

            $("." + CONTENTCLASS, "div" + POPUPCLASS).css({
                width: options.width + "px",
                height: options.height - 50 + "px",
                "overflow-y": "auto",
                "overflow-x": "auto"
            });
        }

        this.makeTitleDraggable = function() {
            if (options.title && options.draggable === true) {
                $(".p-popUpTitle").protos().draggable({ //Makes popup draggable
                    moveParent: POPUPCLASS,
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

        return this;
    }
    //--------------------------------------------------- PopUpCore code BEGIN ------------------------------------------------------

    function popUp(options) {
        var defaultOptions = {
            width: 500,
            height: 300,
            darkness: 0.3,
            title: "Window",
            draggable: true
        };

        options = $.extend(defaultOptions, options);

        var defaultPopUp = new popUpCore(options);

        return defaultPopUp;
    };
    //--------------------------------------------------- PopUp code END --------------------------------------------------------

    //--------------------------------------------------- Alert code BEGIN ------------------------------------------------------

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
        options.content += '<div style="padding-top: 15px; text-align: center;"><button id="protosOKbutton">Ok</button></div>';

        var defaultPopUp = new popUpCore(options);
        var dataObject = options.author[0];

        defaultPopUp.hidePopUp = function() {
            $(".p-PopUp").remove();
            $(".p-darkLayer").remove();
            visible = false;
            $.removeData(dataObject, "alertPopUp");
        }

        defaultPopUp.attachCloseEvents = function(instanceFromData) {
            $("div.p-PopUp a").on('click', ".p-closePopUpButton", function() {
                instanceFromData.hide();
            });

            $("#protosOKbutton").on('click', function() {
                instanceFromData.hide();
            });
        };

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
                width: 0
            }, options.speed / 2);

            var old = $(options.element).width();
            $(options.element).width(0);
            $(options.element).css("display", "");

            $(options.element).animate({
                width: old
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