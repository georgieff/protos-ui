//--------------------------------------------------- ProtoCore code BEGIN ------------------------------------------------------

//Attach proto object to jQery object
(function ($) {
    $.fn.proto = function () {
        var that = this;
        return {
            popUp: function (options) {
                options.author = that;
                $(options.author.selector).data("protoPopUp", new popUp(options));
            },
            swap: function (options) {
                options.author = that;
                $(options.author.selector).data("protoSwap", new swap(options));
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

    return {
        template: tempalte,
    };
}();

function convertTemplateToString(templateId, values)
{
	var template = $("#" + templateId);
	
	if(template.length !== 0){
		var html = template.html();
		var result = html.displayStringsTemplate(values).executeJavaScriptInTemplate(values); 
		return result; //If exsist object with templateId return html
	}
	else
	{
	    return templateId.displayStringsTemplate(values).executeJavaScriptInTemplate(values); //If isn't exist return the exact string (template)
	}
}

String.prototype.executeJavaScriptInTemplate = function (values)
{
    for (var name in values) {
        window[name] = values[name];
    }

	var templateHtml = this;
	var firstIndexOfHash =  templateHtml.indexOf("#");
	var lastIndexOfHash = templateHtml.lastIndexOf("#");
	var templateHtmlLenght = templateHtml.length;
	
	for(var i = firstIndexOfHash; i <= lastIndexOfHash; i++)
	{
		var startIndex = templateHtml.indexOf("#", i);
		if(startIndex !== - 1)
		{
			startIndex += 1;
			
			var endIndex = templateHtml.indexOf("#", startIndex);
			var stringForExecuting = templateHtml.substr(startIndex, endIndex - startIndex);
			
			templateHtml = templateHtml.substr(0, startIndex - 2) + templateHtml.substr(endIndex + 2, templateHtmlLenght)
			i = startIndex - 2;
			
			eval(stringForExecuting);
		}
		else
		{
			break;
		}
	}
	return templateHtml;
}

String.prototype.displayStringsTemplate = function (values)
{
    for (var name in values) {
        window[name] = values[name];
    }

	var templateHtml = this;
	var firstIndexOfHash =  templateHtml.indexOf("#=");
	var lastIndexOfHash = templateHtml.lastIndexOf("#");
	var templateHtmlLenght = templateHtml.length;
	
	for(var i = firstIndexOfHash; i <= lastIndexOfHash; i++)
	{
		var startIndex = templateHtml.indexOf("#=", i);
		if(startIndex !== -1)
		{
			startIndex += 2; //Add string literal length
			var endIndex = templateHtml.indexOf("#", startIndex); //Find end of string literal
			var stringForExecuting = templateHtml.substr(startIndex, endIndex-startIndex); //Get the string which will be executed
			templateHtml = templateHtml.substr(0, startIndex - 2) + eval(stringForExecuting) + templateHtml.substr(endIndex + 1, templateHtmlLenght);
			
			i = startIndex - 2;
		}
		else
		{
			break;
		}
	}
	return templateHtml;
}
//--------------------------------------------------- ProtoCore code END ------------------------------------------------------


//--------------------------------------------------- PopUp code BEGIN ------------------------------------------------------
function popUp(options)
{    
    var author = $(options.author.selector);

    (function attachPopUpEvents() {
        author.on("showPopUp", function () {
            showPopUp(options);
        });

        author.on("hidePopUp", function () {
            $("#popUp").remove();
            $("#darkLayer").remove();
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

        $("a").on('click', ".closePopUpButton", function () {
            author.data("protoPopUp").hide();
        });

        elements.body.on('click', "#darkLayer", function () {
            author.data("protoPopUp").hide();
        });

        //TODO: When press ESC button close popUp
    }

    function addElements(darkness) {
        var darkLayerHtml = '<div id="darkLayer" style="background-color: rgba(0,0,0,' +
        darkness + '); "></div>';
		var contentHtml = '<div id="popUpContent">' + options.content + '</div>';
        var body = $("body");
		var titleHtml = '<div class="p-popUpTitle">' + options.title +'</div>';

        var closePopUpButtonHtml = '<a href="#"><div class="closePopUpButton">X</div></a>';

        body.append(darkLayerHtml); //Apply dark layer
        body.append('<div id="popUp"></div>'); //Add popUp div

        var popUp = $("#popUp");

        popUp.append(closePopUpButtonHtml); //Add button that fires "hide" event
		if(options.title){
			popUp.append(titleHtml);
		}
        popUp.append(contentHtml); //Add popUp content

        return {
            popUp: popUp,
            body: body
        };
    }

    function addStyles(options, popUp) {

        var popUpLeftPosition = (screen.width / 2) - (options.width / 2); //Calculate popUp left position
        var popUpTopPosition = (screen.height / 2) - (options.height / 2); //Calculate popUp top position

        popUp.css({
            left: popUpLeftPosition,
            top: popUpTopPosition,
            width: options.width,
            height: options.height,
            position: "absolute",
        });

        $("#popUpContent").css({
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

// popUp.prototype.trigger = function(eventName){
	// var options = this.options;
	// $(options.author.selector).data("protoPopUp").show(options);
// };