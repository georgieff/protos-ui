//--------------------------------------------------- ProtoCore code BEGIN ------------------------------------------------------

function createInstance(options, author, func) {
    var newOptions = {
        author: author,
        widgetName: (func).name,
    };
    options = $.extend(options, newOptions);
    $(options.author.selector).data(options.widgetName, new func(options)); // (func).name returns name of function "func"
}

//Attach proto object to jQery object
(function ($) {
    $.fn.proto = function () {
        var that = this;
        return {
            popUp: function (options) {
                createInstance(options, that, popUp);
            },
            swap: function (options) {
                createInstance(options, that, swap);
            },
            protoDraggable: function (options) {
                createInstance(options, that, draggable);
            },
        };
    }
})(jQuery);

var proto = function () {
    var tempalte = function (templateId, values) {
        this.render = function () {
            return convertTemplateToString(templateId, values);
        };
    };

    function getElementOffset(element) {
        var _x = 0;
        var _y = 0;
        while (element && !isNaN(element.offsetLeft) && !isNaN(element.offsetTop)) {
            _x += element.offsetLeft - element.scrollLeft;
            _y += element.offsetTop - element.scrollTop;
            element = element.offsetParent;
        }
        return { top: _y, left: _x };
    }

    return {
        template: tempalte,
        getElementOffset: getElementOffset,
    };
}();

function convertTemplateToString(templateId, values) {
    var template = $("#" + templateId);

    if (template.length !== 0) {
        var html = template.html();
        var result = html.displayStringsTemplate(values).executeJavaScriptInTemplate(values);
        return result; //If exsist object with templateId return html
    }
    else {
        return templateId.displayStringsTemplate(values).executeJavaScriptInTemplate(values); //If isn't exist return the exact string (template)
    }
}

String.prototype.executeJavaScriptInTemplate = function (values) {
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
        }
        else {
            break;
        }
    }
    return templateHtml;
}

String.prototype.displayStringsTemplate = function (values) {
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
        }
        else {
            break;
        }
    }
    return templateHtml;
}
//--------------------------------------------------- ProtoCore code END ------------------------------------------------------


//--------------------------------------------------- PopUp code BEGIN ------------------------------------------------------
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
        author.on("showPopUp", function () {
		if(!visible)
			{
				showPopUp(options);
			}
        });
		
        author.on("hidePopUp", function () {
			hidePopUp();
        });
    })();

    this.show = function () { //Show function bind "show" event to jQuery object
        author.trigger("showPopUp");
    };

    this.hide = function () { //Hide function bind "hide" event to jQuery object
        author.trigger("hidePopUp");
    };

    //Function that shows the popUp when "show" event is fired
    function showPopUp(options) {
        //Add elements in DOM
        elements = addElements(options.darkness);

        //Set css properties wich come from options
        addStyles(options, elements.popUp);

        $("a").on('click', ".p-closePopUpButton", function () {
            author.data(options.widgetName).hide();
        });

        elements.body.on('click', ".p-darkLayer", function () {
            author.data(options.widgetName).hide();
        });

		visible = true;
        //TODO: When press ESC button close popUp
    }

	function hidePopUp()
	{
		$(".p-popUp").remove();
        $(".p-darkLayer").remove();
		visible = false;
	}
	
    function addElements() {
        body.append(darkLayerHtml); //Apply dark layer
        body.append(popUpHtml); //Add popUp div

        var popUp = $(".p-popUp");

        popUp.append(closePopUpButtonHtml); //Add button that fires "hide" event
        if (options.title) {
            popUp.append(titleHtml);
        }
        popUp.append(contentHtml); //Add popUp content

        return {
            popUp: popUp,
            body: body
        };
    }

    function addStyles(options, popUp) {

        var documentElement = document.documentElement;
        var popUpLeftPosition = (documentElement.clientWidth / 2) - (options.width / 2); //Calculate popUp left position
        var popUpTopPosition = (documentElement.clientHeight / 2) - (options.height / 2); //Calculate popUp top position

        popUp.css({
            left: popUpLeftPosition,
            top: popUpTopPosition,
            width: options.width,
            height: options.height,
            position: "absolute",
        });

        $(".p-popUpContent").css({
            width: options.width,
            height: options.height - 50,
            "overflow-y": "auto",
            "overflow-x": "auto",
        });
    }
};
//--------------------------------------------------- PopUp code END --------------------------------------------------------

//--------------------------------------------------- Swap code BEGIN ------------------------------------------------------
function swap(options) {
}
//--------------------------------------------------- Swap code END --------------------------------------------------------

//--------------------------------------------------- Draggable code BEGIN ------------------------------------------------------
function draggable(options) {
    var clicked = false;
    var clickPositionX,
        clickPositionY,
        author = $(options.author.selector); // author is draggable element

    author.on('mousedown', function (e) {
        clicked = true;
        clickPositionX = e.clientX - proto.getElementOffset(this).left;
        clickPositionY = e.clientY - proto.getElementOffset(this).top;
    });
	
    $(document).on('mousemove', function (e) {
        if (clicked) {
            var xPosition = e.clientX - clickPositionX,
                yPosition = e.clientY - clickPositionY,
                container = options.container;
                var containerOffset = proto.getElementOffset($(container)[0]);
            if (container) {
                container = $(options.container);
                proto.getElementOffset(author.element).left;
				
               if (containerOffset.left < xPosition && containerOffset.top < yPosition) // Check does draggable element is in container
                {
					var authorRightBorder = proto.getElementOffset(author[0]).left + author.outerWidth(),
							authorBottomBorder = proto.getElementOffset(author[0]).top + author.outerHeight();
					var containerWidth = containerOffset.left + container.outerWidth();
					var containerHeight = containerOffset.top + container.outerHeight();
					var x = containerWidth - author.outerWidth(),
							y = containerHeight - author.outerHeight() - 1;
							
					if(authorRightBorder <= containerWidth)
					{
						setPosition(author, xPosition, "");
					}
					else
					{		
						setPosition(author, x, "");
					}
					
					if(authorBottomBorder < containerHeight - 1)
					{
						setPosition(author, "", yPosition);
					}
					else
					{
						setPosition(author, "", y);
					}
                }			
            }
            else {
                setPosition(author, xPosition, yPosition);
            }

        }
    });

    $(document).on('mouseup', function () {
        clicked = false;
    });

    function setPosition(element, x, y) {
		var styles = {};
		if(x)
		{
			$.extend(styles, {left: x + "px"});
		}
		if(y)
		{
			$.extend(styles, {top: y + "px"});
		}
        element.css(styles);
    }
}
//--------------------------------------------------- Draggable code END --------------------------------------------------------

// popUp.prototype.trigger = function(eventName){
// var options = this.options;
// $(options.author.selector).data("protoPopUp").show(options);
// };