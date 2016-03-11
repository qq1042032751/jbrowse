/**
 * SVGLollipop - implements lollipop features
 */

define( [
            'dojo/_base/declare',
            'dojo/_base/array',
            'dojo/_base/lang',
            'dojo/_base/event',
            'dojo/dom-construct',
            'dojo/dom-style',
            'JBrowse/Util',
            'JBrowse/View/Track/SVGTrackBase',
            'JBrowse/View/Track/SVG/SVGLayerCoords',
            'JBrowse/View/Track/SVG/SVGLayerBpSpace',
            'JBrowse/View/Track/SVG/SVGLayerPxSpace',
        ],
        function(
            declare,
            array,
            lang,
            domEvent,
            domConstruct,
            domStyle,
            Util,
            SVGTrackBase,
            SVGLayerCoords,
            SVGLayerBpSpace,
            SVGLayerPxSpace
        ) {

return declare(
    [ SVGTrackBase ], {

    _defaultConfig: function() {
        return Util.deepUpdate( lang.clone(this.inherited(arguments)), {
            "style": {
                "height": 10,
                "lineColor": "rgba(255,0,0,.5)",
                "circleColor": "rgba(0,0,255,.5)",
                "circleRadius": 15,
                "lineWidth": 6
            }
        });
    },

    setViewInfo: function( genomeView, heightUpdate, numBlocks, trackDiv, widthPct, widthPx, scale ) {
        console.log("SVGFeatures::setViewInfo");
        console.log(numBlocks+" "+widthPct+" "+widthPx+" "+scale);

        this.inherited( arguments );
        
        this.svgCoords = new SVGLayerCoords(this);
        this.svgCoords.setViewInfo( genomeView, heightUpdate, numBlocks, trackDiv, widthPct, widthPx, scale );

        this.svgSpace = new SVGLayerPxSpace(this);      // px-space svg layer
        //this.svgSpace = new SVGLayerBpSpace(this);    // bp-space svg layer
        this.svgSpace.setViewInfo( genomeView, heightUpdate, numBlocks, trackDiv, widthPct, widthPx, scale );
    },

    showRange: function(first, last, startBase, bpPerBlock, scale, containerStart, containerEnd) {
        console.log("SVGFeatures::showRange");
        console.log(first+" "+last+" "+startBase+" "+bpPerBlock+" "+scale+" "+containerStart+" "+containerEnd);

        this.displayContext = {
            first: first,
            last: last,
            startBase: startBase,
            bpPerBlock: bpPerBlock,
            scale: scale,
            containerStart: containerStart,
            containerEnd: containerEnd
        }
        
        this.svgScale = scale;
        
        this.inherited(arguments);      // call the superclass's showRange

        this.svgCoords.showRange(first, last, startBase, bpPerBlock, scale, containerStart, containerEnd);
        this.svgSpace.showRange(first, last, startBase, bpPerBlock, scale, containerStart, containerEnd);
        
    },
    /*
       id = unique string of object
       bpCoord = basepair coordinate of object
       width = width of object
       height = height of object
       callback = function that returns object
                
    */
    addSVGObject: function(id,bpCoord,width,height,callback) {

        this.svgSpace.addSVGObject(id,bpCoord,width,height,callback);
    },
    fixId: function(val) {
        return val.replace(",", "-");
    },
    computeHeight: function() {
        return this.svgSpace.getHeight();
    },
    fillFeatures: function( args ) {
        
        this.inherited(arguments);      // call the superclass's 
    },

    startZoom: function() {
        this.inherited( arguments );

        array.forEach( this.blocks, function(b) {
            try {
                b.featureCanvas.style.width = '100%';
            } catch(e) {};
        });
    },

    endZoom: function() {
        array.forEach( this.blocks, function(b) {
            try {
                delete b.featureCanvas.style.width;
            } catch(e) {};
        });

        this.clear();
        this.inherited( arguments );
    },

    // draw the features on the canvas
    renderFeatures: function( args, fRects ) {
        
        this.inherited(arguments);      // call the superclass
        
    },

    // draw each feature
    renderFeature: function( context, fRect ) {

        this.inherited(arguments);      // call the superclass

        var feature = fRect.f;
        var thisB = this;
        // create svg element new
        
        // draw line
        var svgSpace = this.svgSpace;
        
        // compute the x coord given the bpCoord
        var bpCoord = feature.get("start");
        var cx = svgSpace.bp2Native(bpCoord);

        var height = this.getConf( "style.height", [feature, this ] );
        var lineColor = this.getConf( "style.lineColor", [feature, this ] );
        var circleColor = this.getConf( "style.circleColor", [feature, this ] );
        var circleRadius = this.getConf( "style.circleRadius", [feature, this ] );
        var lineWidth = this.getConf( "style.lineWidth", [feature, this ] );


        var len = svgSpace.getHeight()-height*0.8;
        console.log("cx="+cx+" len="+len+" scale="+this.svgScale); 

        // draw line
        var id = "L-"+this.fixId(fRect.f.id());
        
        this.addSVGObject(id,bpCoord,100,100,function () {
            var svgItem = document.createElementNS('http://www.w3.org/2000/svg','line');
            svgItem.setAttribute('x1',0);
            svgItem.setAttribute('y1',len);
            svgItem.setAttribute('x2',0);
            svgItem.setAttribute('y2',svgSpace.getHeight());
            svgItem.setAttribute('stroke',lineColor);
            svgItem.setAttribute('stroke-width',lineWidth);
            svgItem.setAttribute('stroke-linecap','round');
            return svgItem;
        });

        // draw circle
        var id = "C-"+this.fixId(fRect.f.id());

        this.addSVGObject(id,bpCoord,100,100,function () {
            var apple = document.createElementNS('http://www.w3.org/2000/svg','circle');
            apple.setAttribute('r', circleRadius);
            apple.setAttribute('style', 'cy:'+len+';fill:'+circleColor);
            return apple;
        });
        return;
    },
    
});
});
