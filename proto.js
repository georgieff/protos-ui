//--------------------------------------------------- ProtoCore code BEGIN ------------------------------------------------------

//Attach proto object to jQery object
(function ($) {
    $.fn.proto = function () {
        var that = this;
        return {
            popUp: function (options) { options.author = that; $(options.author.selector).data("protoPopUp", new popUp(options)); },
            swap: function (options) { options.author = that; $(options.author.selector).data("protoSwap", new swap(options)); },
        };
    }
})(jQuery);

function proto(){}

proto.prototype = function()
{
	var that = this;
	return {
	    template: function (templateId) { return convertTemplateToString(templateId); },
	}
}();

var proto = new proto();

function convertTemplateToString(templateId)
{
	var template = $("#" + templateId);
	
	if(template){
		var html = template.html();
		var result = html.displayStringsTemplate().executeJavaScriptInTemplate(); 
		return result; //If exsist object with templateId return html
	}
	else
	{
		return templateId.displayStringsTemplate().executeJavaScriptInTemplate(); //If isn't exist return the exact string (template)
	}
}

String.prototype.executeJavaScriptInTemplate = function ()
{
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

String.prototype.displayStringsTemplate = function ()
{
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
    this.show = function () { //Show function bind "show" event to jQuery object
        $(options.author.selector).one("show", function () {
            showPopUp(options);
        });
        author.trigger("show");
    };
        
    this.hide = function () { //Hide function bind "hide" event to jQuery object
        $(options.author.selector).one("hide", function () {
            $("#popUp").remove();
            $("#darkLayer").remove();
        });
        author.trigger("hide");
    };

    //Function that shows the popUp when "show" event is fired
    function showPopUp(options) {
        var darkLayerHtml = '<div id="darkLayer" style="background-color: rgba(0,0,0,' +
        options.darkness + '); left: 0px; top: 0px; height: 100%; width: 100%; position: fixed;"></div>';
        var body = $("body");

        var closePopUpButtonHtml = '<a href="#"><div class="closePopUpButton">X</div></a>';

        body.append(darkLayerHtml); //Apply dark layer
        body.append('<div id="popUp"></div>'); //Add popUp div
        
        var popUp = $("#popUp");

        popUp.append(closePopUpButtonHtml); //Add button that fires "hide" event
        popUp.append('<div id="popUpContent">' + options.text + '</div>'); //Add popUp content

        var popUpLeftPosition = (screen.width / 2) - (options.width / 2); //Calculate popUp left position
        var popUpTopPosition = (screen.height / 2) - (options.height / 2); //Calculate popUp top position

        //Set css properties wich come from options
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

        $("a").on('click', ".closePopUpButton", function () {
            author.data("protoPopUp").hide();
        });

        body.on('click', "#darkLayer", function () {
            author.data("protoPopUp").hide();
        });

        // $(document).on('keypress', function(e)
        // {
        // console.log(e);
        // if(e.keyCode == 13)													SHOULD TO IMPLEMENT IT!!!
        // {
        // $(options.author.selector).data("protoPopUp").hide();
        // }
        // });
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