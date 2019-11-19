
((function(){"use strict";var ARController=(function(width,height,camera){var id;var w=width,h=height;this.orientation="landscape";this.listeners={};if(typeof width!=="number"){var image=width;camera=height;w=image.videoWidth||image.width;h=image.videoHeight||image.height;this.image=image}this.defaultMarkerWidth=1;this.patternMarkers={};this.barcodeMarkers={};this.transform_mat=new Float32Array(16);this.canvas=document.createElement("canvas");this.canvas.width=w;this.canvas.height=h;this.ctx=this.canvas.getContext("2d");this.videoWidth=w;this.videoHeight=h;if(typeof camera==="string"){var self=this;this.cameraParam=new ARCameraParam(camera,(function(){self._initialize()}),(function(err){console.error("ARController: Failed to load ARCameraParam",err)}))}else{this.cameraParam=camera;this._initialize()}});ARController.prototype.dispose=(function(){artoolkit.teardown(this.id);for(var t in this){this[t]=null}});ARController.prototype.process=(function(image){this.detectMarker(image);var markerNum=this.getMarkerNum();var k,o;for(k in this.patternMarkers){o=this.patternMarkers[k];o.inPrevious=o.inCurrent;o.inCurrent=false}for(k in this.barcodeMarkers){o=this.barcodeMarkers[k];o.inPrevious=o.inCurrent;o.inCurrent=false}for(var i=0;i<markerNum;i++){var markerInfo=this.getMarker(i);var markerType=artoolkit.UNKNOWN_MARKER;var visible=this.trackPatternMarkerId(-1);if(markerInfo.idPatt>-1&&(markerInfo.id===markerInfo.idPatt||markerInfo.idMatrix===-1)){visible=this.trackPatternMarkerId(markerInfo.idPatt);markerType=artoolkit.PATTERN_MARKER;if(markerInfo.dir!==markerInfo.dirPatt){this.setMarkerInfoDir(i,markerInfo.dirPatt)}}else if(markerInfo.idMatrix>-1){visible=this.trackBarcodeMarkerId(markerInfo.idMatrix);markerType=artoolkit.BARCODE_MARKER;if(markerInfo.dir!==markerInfo.dirMatrix){this.setMarkerInfoDir(i,markerInfo.dirMatrix)}}if(markerType!==artoolkit.UNKNOWN_MARKER&&visible.inPrevious){this.getTransMatSquareCont(i,visible.markerWidth,visible.matrix,visible.matrix)}else{this.getTransMatSquare(i,visible.markerWidth,visible.matrix)}visible.inCurrent=true;this.transMatToGLMat(visible.matrix,this.transform_mat);this.dispatchEvent({name:"getMarker",target:this,data:{index:i,type:markerType,marker:markerInfo,matrix:this.transform_mat}})}var multiMarkerCount=this.getMultiMarkerCount();for(var i=0;i<multiMarkerCount;i++){var subMarkerCount=this.getMultiMarkerPatternCount(i);var visible=false;artoolkit.getTransMatMultiSquareRobust(this.id,i);this.transMatToGLMat(this.marker_transform_mat,this.transform_mat);for(var j=0;j<subMarkerCount;j++){var multiEachMarkerInfo=this.getMultiEachMarker(i,j);if(multiEachMarkerInfo.visible>=0){visible=true;this.dispatchEvent({name:"getMultiMarker",target:this,data:{multiMarkerId:i,matrix:this.transform_mat}});break}}if(visible){for(var j=0;j<subMarkerCount;j++){var multiEachMarkerInfo=this.getMultiEachMarker(i,j);this.transMatToGLMat(this.marker_transform_mat,this.transform_mat);this.dispatchEvent({name:"getMultiMarkerSub",target:this,data:{multiMarkerId:i,markerIndex:j,marker:multiEachMarkerInfo,matrix:this.transform_mat}})}}}if(this._bwpointer){this.debugDraw()}});ARController.prototype.trackPatternMarkerId=(function(id,markerWidth){var obj=this.patternMarkers[id];if(!obj){this.patternMarkers[id]=obj={inPrevious:false,inCurrent:false,matrix:new Float32Array(12),markerWidth:markerWidth||this.defaultMarkerWidth}}if(markerWidth){obj.markerWidth=markerWidth}return obj});ARController.prototype.trackBarcodeMarkerId=(function(id,markerWidth){var obj=this.barcodeMarkers[id];if(!obj){this.barcodeMarkers[id]=obj={inPrevious:false,inCurrent:false,matrix:new Float32Array(12),markerWidth:markerWidth||this.defaultMarkerWidth}}if(markerWidth){obj.markerWidth=markerWidth}return obj});ARController.prototype.getMultiMarkerCount=(function(){return artoolkit.getMultiMarkerCount(this.id)});ARController.prototype.getMultiMarkerPatternCount=(function(multiMarkerId){return artoolkit.getMultiMarkerNum(this.id,multiMarkerId)});ARController.prototype.addEventListener=(function(name,callback){if(!this.listeners[name]){this.listeners[name]=[]}this.listeners[name].push(callback)});ARController.prototype.removeEventListener=(function(name,callback){if(this.listeners[name]){var index=this.listeners[name].indexOf(callback);if(index>-1){this.listeners[name].splice(index,1)}}});ARController.prototype.dispatchEvent=(function(event){var listeners=this.listeners[event.name];if(listeners){for(var i=0;i<listeners.length;i++){listeners[i].call(this,event)}}});ARController.prototype.debugSetup=(function(){document.body.appendChild(this.canvas);this.setDebugMode(1);this._bwpointer=this.getProcessingImage()});ARController.prototype.loadMarker=(function(markerURL,onSuccess,onError){return artoolkit.addMarker(this.id,markerURL,onSuccess,onError)});ARController.prototype.loadMultiMarker=(function(markerURL,onSuccess,onError){return artoolkit.addMultiMarker(this.id,markerURL,onSuccess,onError)});ARController.prototype.getTransMatSquare=(function(markerIndex,markerWidth,dst){artoolkit.getTransMatSquare(this.id,markerIndex,markerWidth);dst.set(this.marker_transform_mat);return dst});ARController.prototype.getTransMatSquareCont=(function(markerIndex,markerWidth,previousMarkerTransform,dst){this.marker_transform_mat.set(previousMarkerTransform);artoolkit.getTransMatSquareCont(this.id,markerIndex,markerWidth);dst.set(this.marker_transform_mat);return dst});ARController.prototype.getTransMatMultiSquare=(function(multiMarkerId,dst){artoolkit.getTransMatMultiSquare(this.id,multiMarkerId);dst.set(this.marker_transform_mat);return dst});ARController.prototype.getTransMatMultiSquareRobust=(function(multiMarkerId,dst){artoolkit.getTransMatMultiSquare(this.id,multiMarkerId);dst.set(this.marker_transform_mat);return dst});ARController.prototype.transMatToGLMat=(function(transMat,glMat,scale){glMat[0+0*4]=transMat[0];glMat[0+1*4]=transMat[1];glMat[0+2*4]=transMat[2];glMat[0+3*4]=transMat[3];glMat[1+0*4]=transMat[4];glMat[1+1*4]=transMat[5];glMat[1+2*4]=transMat[6];glMat[1+3*4]=transMat[7];glMat[2+0*4]=transMat[8];glMat[2+1*4]=transMat[9];glMat[2+2*4]=transMat[10];glMat[2+3*4]=transMat[11];glMat[3+0*4]=0;glMat[3+1*4]=0;glMat[3+2*4]=0;glMat[3+3*4]=1;if(scale!=undefined&&scale!==0){glMat[12]*=scale;glMat[13]*=scale;glMat[14]*=scale}return glMat});ARController.prototype.detectMarker=(function(image){if(this._copyImageToHeap(image)){return artoolkit.detectMarker(this.id)}return-99});ARController.prototype.getMarkerNum=(function(){return artoolkit.getMarkerNum(this.id)});ARController.prototype.getMarker=(function(markerIndex){if(0===artoolkit.getMarker(this.id,markerIndex)){return artoolkit.markerInfo}});ARController.prototype.setMarkerInfoVertex=(function(markerIndex,vertexData){for(var i=0;i<vertexData.length;i++){this.marker_transform_mat[i*2+0]=vertexData[i][0];this.marker_transform_mat[i*2+1]=vertexData[i][1]}return artoolkit.setMarkerInfoVertex(this.id,markerIndex)});ARController.prototype.cloneMarkerInfo=(function(markerInfo){return JSON.parse(JSON.stringify(markerInfo))});ARController.prototype.getMultiEachMarker=(function(multiMarkerId,markerIndex){if(0===artoolkit.getMultiEachMarker(this.id,multiMarkerId,markerIndex)){return artoolkit.multiEachMarkerInfo}});ARController.prototype.getTransformationMatrix=(function(){return this.transform_mat});ARController.prototype.getCameraMatrix=(function(){return this.camera_mat});ARController.prototype.getMarkerTransformationMatrix=(function(){return this.marker_transform_mat});ARController.prototype.setDebugMode=(function(mode){return artoolkit.setDebugMode(this.id,mode)});ARController.prototype.getDebugMode=(function(){return artoolkit.getDebugMode(this.id)});ARController.prototype.getProcessingImage=(function(){return artoolkit.getProcessingImage(this.id)});ARController.prototype.setLogLevel=(function(mode){return artoolkit.setLogLevel(mode)});ARController.prototype.getLogLevel=(function(){return artoolkit.getLogLevel()});ARController.prototype.setMarkerInfoDir=(function(markerIndex,dir){return artoolkit.setMarkerInfoDir(this.id,markerIndex,dir)});ARController.prototype.setProjectionNearPlane=(function(value){return artoolkit.setProjectionNearPlane(this.id,value)});ARController.prototype.getProjectionNearPlane=(function(){return artoolkit.getProjectionNearPlane(this.id)});ARController.prototype.setProjectionFarPlane=(function(value){return artoolkit.setProjectionFarPlane(this.id,value)});ARController.prototype.getProjectionFarPlane=(function(){return artoolkit.getProjectionFarPlane(this.id)});ARController.prototype.setThresholdMode=(function(mode){return artoolkit.setThresholdMode(this.id,mode)});ARController.prototype.getThresholdMode=(function(){return artoolkit.getThresholdMode(this.id)});ARController.prototype.setThreshold=(function(threshold){return artoolkit.setThreshold(this.id,threshold)});ARController.prototype.getThreshold=(function(){return artoolkit.getThreshold(this.id)});ARController.prototype.setPatternDetectionMode=(function(value){return artoolkit.setPatternDetectionMode(this.id,value)});ARController.prototype.getPatternDetectionMode=(function(){return artoolkit.getPatternDetectionMode(this.id)});ARController.prototype.setMatrixCodeType=(function(value){return artoolkit.setMatrixCodeType(this.id,value)});ARController.prototype.getMatrixCodeType=(function(){return artoolkit.getMatrixCodeType(this.id)});ARController.prototype.setLabelingMode=(function(value){return artoolkit.setLabelingMode(this.id,value)});ARController.prototype.getLabelingMode=(function(){return artoolkit.getLabelingMode(this.id)});ARController.prototype.setPattRatio=(function(value){return artoolkit.setPattRatio(this.id,value)});ARController.prototype.getPattRatio=(function(){return artoolkit.getPattRatio(this.id)});ARController.prototype.setImageProcMode=(function(value){return artoolkit.setImageProcMode(this.id,value)});ARController.prototype.getImageProcMode=(function(){return artoolkit.getImageProcMode(this.id)});ARController.prototype.debugDraw=(function(){var debugBuffer=new Uint8ClampedArray(Module.HEAPU8.buffer,this._bwpointer,this.framesize);var id=new ImageData(debugBuffer,this.canvas.width,this.canvas.height);this.ctx.putImageData(id,0,0);var marker_num=this.getMarkerNum();for(var i=0;i<marker_num;i++){this._debugMarker(this.getMarker(i))}});ARController.prototype._initialize=(function(){this.id=artoolkit.setup(this.canvas.width,this.canvas.height,this.cameraParam.id);var params=artoolkit.frameMalloc;this.framepointer=params.framepointer;this.framesize=params.framesize;this.dataHeap=new Uint8Array(Module.HEAPU8.buffer,this.framepointer,this.framesize);this.camera_mat=new Float64Array(Module.HEAPU8.buffer,params.camera,16);this.marker_transform_mat=new Float64Array(Module.HEAPU8.buffer,params.transform,12);this.setProjectionNearPlane(.1);this.setProjectionFarPlane(1e3);var self=this;setTimeout((function(){if(self.onload){self.onload()}self.dispatchEvent({name:"load",target:self})}),1)});ARController.prototype._copyImageToHeap=(function(image){if(!image){image=this.image}this.ctx.save();if(this.orientation==="portrait"){this.ctx.translate(this.canvas.width,0);this.ctx.rotate(Math.PI/2);this.ctx.drawImage(image,0,0,this.canvas.height,this.canvas.width)}else{this.ctx.drawImage(image,0,0,this.canvas.width,this.canvas.height)}this.ctx.restore();var imageData=this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height);var data=imageData.data;if(this.dataHeap){this.dataHeap.set(data);return true}return false});ARController.prototype._debugMarker=(function(marker){var vertex,pos;vertex=marker.vertex;var ctx=this.ctx;ctx.strokeStyle="red";ctx.beginPath();ctx.moveTo(vertex[0][0],vertex[0][1]);ctx.lineTo(vertex[1][0],vertex[1][1]);ctx.stroke();ctx.beginPath();ctx.moveTo(vertex[2][0],vertex[2][1]);ctx.lineTo(vertex[3][0],vertex[3][1]);ctx.stroke();ctx.strokeStyle="green";ctx.beginPath();ctx.lineTo(vertex[1][0],vertex[1][1]);ctx.lineTo(vertex[2][0],vertex[2][1]);ctx.stroke();ctx.beginPath();ctx.moveTo(vertex[3][0],vertex[3][1]);ctx.lineTo(vertex[0][0],vertex[0][1]);ctx.stroke();pos=marker.pos;ctx.beginPath();ctx.arc(pos[0],pos[1],8,0,Math.PI*2);ctx.fillStyle="red";ctx.fill()});ARController.getUserMedia=(function(configuration){var facing=configuration.facingMode||"environment";var onSuccess=configuration.onSuccess;var onError=configuration.onError||(function(err){console.error("ARController.getUserMedia",err)});var video=document.createElement("video");var initProgress=(function(){if(this.videoWidth!==0){onSuccess(video)}});var readyToPlay=false;var eventNames=["touchstart","touchend","touchmove","touchcancel","click","mousedown","mouseup","mousemove","keydown","keyup","keypress","scroll"];var play=(function(ev){if(readyToPlay){video.play();if(!video.paused){eventNames.forEach((function(eventName){window.removeEventListener(eventName,play,true)}))}}});eventNames.forEach((function(eventName){window.addEventListener(eventName,play,true)}));var success=(function(stream){video.addEventListener("loadedmetadata",initProgress,false);video.src=window.URL.createObjectURL(stream);readyToPlay=true;play()});var constraints={};var mediaDevicesConstraints={};if(configuration.width){mediaDevicesConstraints.width=configuration.width;if(typeof configuration.width==="object"){if(configuration.width.max){constraints.maxWidth=configuration.width.max}if(configuration.width.min){constraints.minWidth=configuration.width.max}}else{constraints.maxWidth=configuration.width}}if(configuration.height){mediaDevicesConstraints.height=configuration.height;if(typeof configuration.height==="object"){if(configuration.height.max){constraints.maxHeight=configuration.height.max}if(configuration.height.min){constraints.minHeight=configuration.height.max}}else{constraints.maxHeight=configuration.height}}mediaDevicesConstraints.facingMode=facing;navigator.getUserMedia=navigator.getUserMedia||navigator.webkitGetUserMedia||navigator.mozGetUserMedia||navigator.msGetUserMedia;var hdConstraints={audio:false,video:{mandatory:constraints}};if(false){if(navigator.mediaDevices){navigator.mediaDevices.getUserMedia({audio:false,video:mediaDevicesConstraints}).then(success,onError)}else{MediaStreamTrack.getSources((function(sources){var facingDir=mediaDevicesConstraints.facingMode;if(facing&&facing.exact){facingDir=facing.exact}for(var i=0;i<sources.length;i++){if(sources[i].kind==="video"&&sources[i].facing===facingDir){hdConstraints.video.mandatory.sourceId=sources[i].id;break}}if(facing&&facing.exact&&!hdConstraints.video.mandatory.sourceId){onError("Failed to get camera facing the wanted direction")}else{if(navigator.getUserMedia){navigator.getUserMedia(hdConstraints,success,onError)}else{onError("navigator.getUserMedia is not supported on your browser")}}}))}}else{if(navigator.getUserMedia){navigator.getUserMedia(hdConstraints,success,onError)}else{onError("navigator.getUserMedia is not supported on your browser")}}return video});ARController.getUserMediaARController=(function(configuration){var obj={};for(var i in configuration){obj[i]=configuration[i]}var onSuccess=configuration.onSuccess;var cameraParamURL=configuration.cameraParam;obj.onSuccess=(function(){new ARCameraParam(cameraParamURL,(function(){var arCameraParam=this;var maxSize=configuration.maxARVideoSize||Math.max(video.videoWidth,video.videoHeight);var f=maxSize/Math.max(video.videoWidth,video.videoHeight);var w=f*video.videoWidth;var h=f*video.videoHeight;if(video.videoWidth<video.videoHeight){var tmp=w;w=h;h=tmp}var arController=new ARController(w,h,arCameraParam);arController.image=video;if(video.videoWidth<video.videoHeight){arController.orientation="portrait";arController.videoWidth=video.videoHeight;arController.videoHeight=video.videoWidth}else{arController.orientation="landscape";arController.videoWidth=video.videoWidth;arController.videoHeight=video.videoHeight}onSuccess(arController,arCameraParam)}),(function(err){console.error("ARController: Failed to load ARCameraParam",err)}))});var video=this.getUserMedia(obj);return video});var ARCameraParam=(function(src,onload,onerror){this.id=-1;this._src="";this.complete=false;this.onload=onload;this.onerror=onerror;if(src){this.load(src)}});ARCameraParam.prototype.load=(function(src){if(this._src!==""){throw"ARCameraParam: Trying to load camera parameters twice."}this._src=src;if(src){var self=this;artoolkit.loadCamera(src,(function(id){self.id=id;self.complete=true;self.onload()}),(function(err){self.onerror(err)}))}});Object.defineProperty(ARCameraParam.prototype,"src",{set:(function(src){this.load(src)}),get:(function(){return this._src})});ARCameraParam.prototype.dispose=(function(){if(this.id!==-1){artoolkit.deleteCamera(this.id)}this.id=-1;this._src="";this.complete=false});var artoolkit={UNKNOWN_MARKER:-1,PATTERN_MARKER:0,BARCODE_MARKER:1,loadCamera:loadCamera,addMarker:addMarker,addMultiMarker:addMultiMarker};var FUNCTIONS=["setup","teardown","setLogLevel","getLogLevel","setDebugMode","getDebugMode","getProcessingImage","setMarkerInfoDir","setMarkerInfoVertex","getTransMatSquare","getTransMatSquareCont","getTransMatMultiSquare","getTransMatMultiSquareRobust","getMultiMarkerNum","getMultiMarkerCount","detectMarker","getMarkerNum","getMarker","getMultiEachMarker","setProjectionNearPlane","getProjectionNearPlane","setProjectionFarPlane","getProjectionFarPlane","setThresholdMode","getThresholdMode","setThreshold","getThreshold","setPatternDetectionMode","getPatternDetectionMode","setMatrixCodeType","getMatrixCodeType","setLabelingMode","getLabelingMode","setPattRatio","getPattRatio","setImageProcMode","getImageProcMode"];function runWhenLoaded(){FUNCTIONS.forEach((function(n){artoolkit[n]=Module[n]}));for(var m in Module){if(m.match(/^AR/))artoolkit[m]=Module[m]}}var marker_count=0;function addMarker(arId,url,callback){var filename="/marker_"+marker_count++;ajax(url,filename,(function(){var id=Module._addMarker(arId,filename);if(callback)callback(id)}))}function bytesToString(array){return String.fromCharCode.apply(String,array)}function parseMultiFile(bytes){var str=bytesToString(bytes);var lines=str.split("\n");var files=[];var state=0;var markers=0;lines.forEach((function(line){line=line.trim();if(!line||line.startsWith("#"))return;switch(state){case 0:markers=+line;state=1;return;case 1:if(!line.match(/^\d+$/)){files.push(line)};case 2:case 3:case 4:state++;return;case 5:state=1;return}}));return files}var multi_marker_count=0;function addMultiMarker(arId,url,callback){var filename="/multi_marker_"+multi_marker_count++;ajax(url,filename,(function(bytes){var files=parseMultiFile(bytes);function ok(){var markerID=Module._addMultiMarker(arId,filename);var markerNum=Module.getMultiMarkerNum(arId,markerID);if(callback)callback(markerID,markerNum)}if(!files.length)return ok();var path=url.split("/").slice(0,-1).join("/");files=files.map((function(file){return[path+"/"+file,file]}));ajaxDependencies(files,ok)}))}var camera_count=0;function loadCamera(url,callback){var filename="/camera_param_"+camera_count++;var writeCallback=(function(){var id=Module._loadCamera(filename);if(callback)callback(id)});if(typeof url==="object"){writeByteArrayToFS(filename,url,writeCallback)}else if(url.indexOf("\n")>-1){writeStringToFS(filename,url,writeCallback)}else{ajax(url,filename,writeCallback)}}function writeStringToFS(target,string,callback){var byteArray=new Uint8Array(string.length);for(var i=0;i<byteArray.length;i++){byteArray[i]=string.charCodeAt(i)&255}writeByteArrayToFS(target,byteArray,callback)}function writeByteArrayToFS(target,byteArray,callback){FS.writeFile(target,byteArray,{encoding:"binary"});callback(byteArray)}function ajax(url,target,callback){var oReq=new XMLHttpRequest;oReq.open("GET",url,true);oReq.responseType="arraybuffer";oReq.onload=(function(oEvent){var arrayBuffer=oReq.response;var byteArray=new Uint8Array(arrayBuffer);writeByteArrayToFS(target,byteArray,callback)});oReq.send()}function ajaxDependencies(files,callback){var next=files.pop();if(next){ajax(next[0],next[1],(function(){ajaxDependencies(files,callback)}))}else{callback()}}window.artoolkit=artoolkit;window.ARController=ARController;window.ARCameraParam=ARCameraParam;if(window.Module){runWhenLoaded()}else{window.Module={onRuntimeInitialized:(function(){runWhenLoaded()})}}}))();var Module;if(!Module)Module=(typeof Module!=="undefined"?Module:null)||{};var moduleOverrides={};for(var key in Module){if(Module.hasOwnProperty(key)){moduleOverrides[key]=Module[key]}}var ENVIRONMENT_IS_WEB=typeof window==="object";var ENVIRONMENT_IS_WORKER=typeof importScripts==="function";var ENVIRONMENT_IS_NODE=typeof process==="object"&&typeof require==="function"&&!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_WORKER;var ENVIRONMENT_IS_SHELL=!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_NODE&&!ENVIRONMENT_IS_WORKER;if(ENVIRONMENT_IS_NODE){if(!Module["print"])Module["print"]=function print(x){process["stdout"].write(x+"\n")};if(!Module["printErr"])Module["printErr"]=function printErr(x){process["stderr"].write(x+"\n")};var nodeFS=require("fs");var nodePath=require("path");Module["read"]=function read(filename,binary){filename=nodePath["normalize"](filename);var ret=nodeFS["readFileSync"](filename);if(!ret&&filename!=nodePath["resolve"](filename)){filename=path.join(__dirname,"..","src",filename);ret=nodeFS["readFileSync"](filename)}if(ret&&!binary)ret=ret.toString();return ret};Module["readBinary"]=function readBinary(filename){var ret=Module["read"](filename,true);if(!ret.buffer){ret=new Uint8Array(ret)}assert(ret.buffer);return ret};Module["load"]=function load(f){globalEval(read(f))};if(!Module["thisProgram"]){if(process["argv"].length>1){Module["thisProgram"]=process["argv"][1].replace(/\\/g,"/")}else{Module["thisProgram"]="unknown-program"}}Module["arguments"]=process["argv"].slice(2);if(typeof module!=="undefined"){module["exports"]=Module}process["on"]("uncaughtException",(function(ex){if(!(ex instanceof ExitStatus)){throw ex}}));Module["inspect"]=(function(){return"[Emscripten Module object]"})}else if(ENVIRONMENT_IS_SHELL){if(!Module["print"])Module["print"]=print;if(typeof printErr!="undefined")Module["printErr"]=printErr;if(typeof read!="undefined"){Module["read"]=read}else{Module["read"]=function read(){throw"no read() available (jsc?)"}}Module["readBinary"]=function readBinary(f){if(typeof readbuffer==="function"){return new Uint8Array(readbuffer(f))}var data=read(f,"binary");assert(typeof data==="object");return data};if(typeof scriptArgs!="undefined"){Module["arguments"]=scriptArgs}else if(typeof arguments!="undefined"){Module["arguments"]=arguments}}else if(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER){Module["read"]=function read(url){var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.send(null);return xhr.responseText};if(typeof arguments!="undefined"){Module["arguments"]=arguments}if(typeof console!=="undefined"){if(!Module["print"])Module["print"]=function print(x){console.log(x)};if(!Module["printErr"])Module["printErr"]=function printErr(x){console.log(x)}}else{var TRY_USE_DUMP=false;if(!Module["print"])Module["print"]=TRY_USE_DUMP&&typeof dump!=="undefined"?(function(x){dump(x)}):(function(x){})}if(ENVIRONMENT_IS_WORKER){Module["load"]=importScripts}if(typeof Module["setWindowTitle"]==="undefined"){Module["setWindowTitle"]=(function(title){document.title=title})}}else{throw"Unknown runtime environment. Where are we?"}function globalEval(x){eval.call(null,x)}if(!Module["load"]&&Module["read"]){Module["load"]=function load(f){globalEval(Module["read"](f))}}if(!Module["print"]){Module["print"]=(function(){})}if(!Module["printErr"]){Module["printErr"]=Module["print"]}if(!Module["arguments"]){Module["arguments"]=[]}if(!Module["thisProgram"]){Module["thisProgram"]="./this.program"}Module.print=Module["print"];Module.printErr=Module["printErr"];Module["preRun"]=[];Module["postRun"]=[];for(var key in moduleOverrides){if(moduleOverrides.hasOwnProperty(key)){Module[key]=moduleOverrides[key]}}var Runtime={setTempRet0:(function(value){tempRet0=value}),getTempRet0:(function(){return tempRet0}),stackSave:(function(){return STACKTOP}),stackRestore:(function(stackTop){STACKTOP=stackTop}),getNativeTypeSize:(function(type){switch(type){case"i1":case"i8":return 1;case"i16":return 2;case"i32":return 4;case"i64":return 8;case"float":return 4;case"double":return 8;default:{if(type[type.length-1]==="*"){return Runtime.QUANTUM_SIZE}else if(type[0]==="i"){var bits=parseInt(type.substr(1));assert(bits%8===0);return bits/8}else{return 0}}}}),getNativeFieldSize:(function(type){return Math.max(Runtime.getNativeTypeSize(type),Runtime.QUANTUM_SIZE)}),STACK_ALIGN:16,prepVararg:(function(ptr,type){if(type==="double"||type==="i64"){if(ptr&7){assert((ptr&7)===4);ptr+=4}}else{assert((ptr&3)===0)}return ptr}),getAlignSize:(function(type,size,vararg){if(!vararg&&(type=="i64"||type=="double"))return 8;if(!type)return Math.min(size,8);return Math.min(size||(type?Runtime.getNativeFieldSize(type):0),Runtime.QUANTUM_SIZE)}),dynCall:(function(sig,ptr,args){if(args&&args.length){if(!args.splice)args=Array.prototype.slice.call(args);args.splice(0,0,ptr);return Module["dynCall_"+sig].apply(null,args)}else{return Module["dynCall_"+sig].call(null,ptr)}}),functionPointers:[],addFunction:(function(func){for(var i=0;i<Runtime.functionPointers.length;i++){if(!Runtime.functionPointers[i]){Runtime.functionPointers[i]=func;return 2*(1+i)}}throw"Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS."}),removeFunction:(function(index){Runtime.functionPointers[(index-2)/2]=null}),warnOnce:(function(text){if(!Runtime.warnOnce.shown)Runtime.warnOnce.shown={};if(!Runtime.warnOnce.shown[text]){Runtime.warnOnce.shown[text]=1;Module.printErr(text)}}),funcWrappers:{},getFuncWrapper:(function(func,sig){assert(sig);if(!Runtime.funcWrappers[sig]){Runtime.funcWrappers[sig]={}}var sigCache=Runtime.funcWrappers[sig];if(!sigCache[func]){sigCache[func]=function dynCall_wrapper(){return Runtime.dynCall(sig,func,arguments)}}return sigCache[func]}),getCompilerSetting:(function(name){throw"You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work"}),stackAlloc:(function(size){var ret=STACKTOP;STACKTOP=STACKTOP+size|0;STACKTOP=STACKTOP+15&-16;return ret}),staticAlloc:(function(size){var ret=STATICTOP;STATICTOP=STATICTOP+size|0;STATICTOP=STATICTOP+15&-16;return ret}),dynamicAlloc:(function(size){var ret=DYNAMICTOP;DYNAMICTOP=DYNAMICTOP+size|0;DYNAMICTOP=DYNAMICTOP+15&-16;if(DYNAMICTOP>=TOTAL_MEMORY){var success=enlargeMemory();if(!success){DYNAMICTOP=ret;return 0}}return ret}),alignMemory:(function(size,quantum){var ret=size=Math.ceil(size/(quantum?quantum:16))*(quantum?quantum:16);return ret}),makeBigInt:(function(low,high,unsigned){var ret=unsigned?+(low>>>0)+ +(high>>>0)*+4294967296:+(low>>>0)+ +(high|0)*+4294967296;return ret}),GLOBAL_BASE:8,QUANTUM_SIZE:4,__dummy__:0};Module["Runtime"]=Runtime;var __THREW__=0;var ABORT=false;var EXITSTATUS=0;var undef=0;var tempValue,tempInt,tempBigInt,tempInt2,tempBigInt2,tempPair,tempBigIntI,tempBigIntR,tempBigIntS,tempBigIntP,tempBigIntD,tempDouble,tempFloat;var tempI64,tempI64b;var tempRet0,tempRet1,tempRet2,tempRet3,tempRet4,tempRet5,tempRet6,tempRet7,tempRet8,tempRet9;function assert(condition,text){if(!condition){abort("Assertion failed: "+text)}}var globalScope=this;function getCFunc(ident){var func=Module["_"+ident];if(!func){try{func=eval("_"+ident)}catch(e){}}assert(func,"Cannot call unknown function "+ident+" (perhaps LLVM optimizations or closure removed it?)");return func}var cwrap,ccall;((function(){var JSfuncs={"stackSave":(function(){Runtime.stackSave()}),"stackRestore":(function(){Runtime.stackRestore()}),"arrayToC":(function(arr){var ret=Runtime.stackAlloc(arr.length);writeArrayToMemory(arr,ret);return ret}),"stringToC":(function(str){var ret=0;if(str!==null&&str!==undefined&&str!==0){ret=Runtime.stackAlloc((str.length<<2)+1);writeStringToMemory(str,ret)}return ret})};var toC={"string":JSfuncs["stringToC"],"array":JSfuncs["arrayToC"]};ccall=function ccallFunc(ident,returnType,argTypes,args,opts){var func=getCFunc(ident);var cArgs=[];var stack=0;if(args){for(var i=0;i<args.length;i++){var converter=toC[argTypes[i]];if(converter){if(stack===0)stack=Runtime.stackSave();cArgs[i]=converter(args[i])}else{cArgs[i]=args[i]}}}var ret=func.apply(null,cArgs);if(returnType==="string")ret=Pointer_stringify(ret);if(stack!==0){if(opts&&opts.async){EmterpreterAsync.asyncFinalizers.push((function(){Runtime.stackRestore(stack)}));return}Runtime.stackRestore(stack)}return ret};var sourceRegex=/^function\s*\(([^)]*)\)\s*{\s*([^*]*?)[\s;]*(?:return\s*(.*?)[;\s]*)?}$/;function parseJSFunc(jsfunc){var parsed=jsfunc.toString().match(sourceRegex).slice(1);return{arguments:parsed[0],body:parsed[1],returnValue:parsed[2]}}var JSsource={};for(var fun in JSfuncs){if(JSfuncs.hasOwnProperty(fun)){JSsource[fun]=parseJSFunc(JSfuncs[fun])}}cwrap=function cwrap(ident,returnType,argTypes){argTypes=argTypes||[];var cfunc=getCFunc(ident);var numericArgs=argTypes.every((function(type){return type==="number"}));var numericRet=returnType!=="string";if(numericRet&&numericArgs){return cfunc}var argNames=argTypes.map((function(x,i){return"$"+i}));var funcstr="(function("+argNames.join(",")+") {";var nargs=argTypes.length;if(!numericArgs){funcstr+="var stack = "+JSsource["stackSave"].body+";";for(var i=0;i<nargs;i++){var arg=argNames[i],type=argTypes[i];if(type==="number")continue;var convertCode=JSsource[type+"ToC"];funcstr+="var "+convertCode.arguments+" = "+arg+";";funcstr+=convertCode.body+";";funcstr+=arg+"="+convertCode.returnValue+";"}}var cfuncname=parseJSFunc((function(){return cfunc})).returnValue;funcstr+="var ret = "+cfuncname+"("+argNames.join(",")+");";if(!numericRet){var strgfy=parseJSFunc((function(){return Pointer_stringify})).returnValue;funcstr+="ret = "+strgfy+"(ret);"}if(!numericArgs){funcstr+=JSsource["stackRestore"].body.replace("()","(stack)")+";"}funcstr+="return ret})";return eval(funcstr)}}))();Module["ccall"]=ccall;Module["cwrap"]=cwrap;function setValue(ptr,value,type,noSafe){type=type||"i8";if(type.charAt(type.length-1)==="*")type="i32";switch(type){case"i1":HEAP8[ptr>>0]=value;break;case"i8":HEAP8[ptr>>0]=value;break;case"i16":HEAP16[ptr>>1]=value;break;case"i32":HEAP32[ptr>>2]=value;break;case"i64":tempI64=[value>>>0,(tempDouble=value,+Math_abs(tempDouble)>=+1?tempDouble>+0?(Math_min(+Math_floor(tempDouble/+4294967296),+4294967295)|0)>>>0:~~+Math_ceil((tempDouble- +(~~tempDouble>>>0))/+4294967296)>>>0:0)],HEAP32[ptr>>2]=tempI64[0],HEAP32[ptr+4>>2]=tempI64[1];break;case"float":HEAPF32[ptr>>2]=value;break;case"double":HEAPF64[ptr>>3]=value;break;default:abort("invalid type for setValue: "+type)}}Module["setValue"]=setValue;function getValue(ptr,type,noSafe){type=type||"i8";if(type.charAt(type.length-1)==="*")type="i32";switch(type){case"i1":return HEAP8[ptr>>0];case"i8":return HEAP8[ptr>>0];case"i16":return HEAP16[ptr>>1];case"i32":return HEAP32[ptr>>2];case"i64":return HEAP32[ptr>>2];case"float":return HEAPF32[ptr>>2];case"double":return HEAPF64[ptr>>3];default:abort("invalid type for setValue: "+type)}return null}Module["getValue"]=getValue;var ALLOC_NORMAL=0;var ALLOC_STACK=1;var ALLOC_STATIC=2;var ALLOC_DYNAMIC=3;var ALLOC_NONE=4;Module["ALLOC_NORMAL"]=ALLOC_NORMAL;Module["ALLOC_STACK"]=ALLOC_STACK;Module["ALLOC_STATIC"]=ALLOC_STATIC;Module["ALLOC_DYNAMIC"]=ALLOC_DYNAMIC;Module["ALLOC_NONE"]=ALLOC_NONE;function allocate(slab,types,allocator,ptr){var zeroinit,size;if(typeof slab==="number"){zeroinit=true;size=slab}else{zeroinit=false;size=slab.length}var singleType=typeof types==="string"?types:null;var ret;if(allocator==ALLOC_NONE){ret=ptr}else{ret=[_malloc,Runtime.stackAlloc,Runtime.staticAlloc,Runtime.dynamicAlloc][allocator===undefined?ALLOC_STATIC:allocator](Math.max(size,singleType?1:types.length))}if(zeroinit){var ptr=ret,stop;assert((ret&3)==0);stop=ret+(size&~3);for(;ptr<stop;ptr+=4){HEAP32[ptr>>2]=0}stop=ret+size;while(ptr<stop){HEAP8[ptr++>>0]=0}return ret}if(singleType==="i8"){if(slab.subarray||slab.slice){HEAPU8.set(slab,ret)}else{HEAPU8.set(new Uint8Array(slab),ret)}return ret}var i=0,type,typeSize,previousType;while(i<size){var curr=slab[i];if(typeof curr==="function"){curr=Runtime.getFunctionIndex(curr)}type=singleType||types[i];if(type===0){i++;continue}if(type=="i64")type="i32";setValue(ret+i,curr,type);if(previousType!==type){typeSize=Runtime.getNativeTypeSize(type);previousType=type}i+=typeSize}return ret}Module["allocate"]=allocate;function getMemory(size){if(!staticSealed)return Runtime.staticAlloc(size);if(typeof _sbrk!=="undefined"&&!_sbrk.called||!runtimeInitialized)return Runtime.dynamicAlloc(size);return _malloc(size)}Module["getMemory"]=getMemory;function Pointer_stringify(ptr,length){if(length===0||!ptr)return"";var hasUtf=0;var t;var i=0;while(1){t=HEAPU8[ptr+i>>0];hasUtf|=t;if(t==0&&!length)break;i++;if(length&&i==length)break}if(!length)length=i;var ret="";if(hasUtf<128){var MAX_CHUNK=1024;var curr;while(length>0){curr=String.fromCharCode.apply(String,HEAPU8.subarray(ptr,ptr+Math.min(length,MAX_CHUNK)));ret=ret?ret+curr:curr;ptr+=MAX_CHUNK;length-=MAX_CHUNK}return ret}return Module["UTF8ToString"](ptr)}Module["Pointer_stringify"]=Pointer_stringify;function AsciiToString(ptr){var str="";while(1){var ch=HEAP8[ptr++>>0];if(!ch)return str;str+=String.fromCharCode(ch)}}Module["AsciiToString"]=AsciiToString;function stringToAscii(str,outPtr){return writeAsciiToMemory(str,outPtr,false)}Module["stringToAscii"]=stringToAscii;function UTF8ArrayToString(u8Array,idx){var u0,u1,u2,u3,u4,u5;var str="";while(1){u0=u8Array[idx++];if(!u0)return str;if(!(u0&128)){str+=String.fromCharCode(u0);continue}u1=u8Array[idx++]&63;if((u0&224)==192){str+=String.fromCharCode((u0&31)<<6|u1);continue}u2=u8Array[idx++]&63;if((u0&240)==224){u0=(u0&15)<<12|u1<<6|u2}else{u3=u8Array[idx++]&63;if((u0&248)==240){u0=(u0&7)<<18|u1<<12|u2<<6|u3}else{u4=u8Array[idx++]&63;if((u0&252)==248){u0=(u0&3)<<24|u1<<18|u2<<12|u3<<6|u4}else{u5=u8Array[idx++]&63;u0=(u0&1)<<30|u1<<24|u2<<18|u3<<12|u4<<6|u5}}}if(u0<65536){str+=String.fromCharCode(u0)}else{var ch=u0-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023)}}}Module["UTF8ArrayToString"]=UTF8ArrayToString;function UTF8ToString(ptr){return UTF8ArrayToString(HEAPU8,ptr)}Module["UTF8ToString"]=UTF8ToString;function stringToUTF8Array(str,outU8Array,outIdx,maxBytesToWrite){if(!(maxBytesToWrite>0))return 0;var startIdx=outIdx;var endIdx=outIdx+maxBytesToWrite-1;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343)u=65536+((u&1023)<<10)|str.charCodeAt(++i)&1023;if(u<=127){if(outIdx>=endIdx)break;outU8Array[outIdx++]=u}else if(u<=2047){if(outIdx+1>=endIdx)break;outU8Array[outIdx++]=192|u>>6;outU8Array[outIdx++]=128|u&63}else if(u<=65535){if(outIdx+2>=endIdx)break;outU8Array[outIdx++]=224|u>>12;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}else if(u<=2097151){if(outIdx+3>=endIdx)break;outU8Array[outIdx++]=240|u>>18;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}else if(u<=67108863){if(outIdx+4>=endIdx)break;outU8Array[outIdx++]=248|u>>24;outU8Array[outIdx++]=128|u>>18&63;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}else{if(outIdx+5>=endIdx)break;outU8Array[outIdx++]=252|u>>30;outU8Array[outIdx++]=128|u>>24&63;outU8Array[outIdx++]=128|u>>18&63;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}}outU8Array[outIdx]=0;return outIdx-startIdx}Module["stringToUTF8Array"]=stringToUTF8Array;function stringToUTF8(str,outPtr,maxBytesToWrite){return stringToUTF8Array(str,HEAPU8,outPtr,maxBytesToWrite)}Module["stringToUTF8"]=stringToUTF8;function lengthBytesUTF8(str){var len=0;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343)u=65536+((u&1023)<<10)|str.charCodeAt(++i)&1023;if(u<=127){++len}else if(u<=2047){len+=2}else if(u<=65535){len+=3}else if(u<=2097151){len+=4}else if(u<=67108863){len+=5}else{len+=6}}return len}Module["lengthBytesUTF8"]=lengthBytesUTF8;function UTF16ToString(ptr){var i=0;var str="";while(1){var codeUnit=HEAP16[ptr+i*2>>1];if(codeUnit==0)return str;++i;str+=String.fromCharCode(codeUnit)}}Module["UTF16ToString"]=UTF16ToString;function stringToUTF16(str,outPtr,maxBytesToWrite){if(maxBytesToWrite===undefined){maxBytesToWrite=2147483647}if(maxBytesToWrite<2)return 0;maxBytesToWrite-=2;var startPtr=outPtr;var numCharsToWrite=maxBytesToWrite<str.length*2?maxBytesToWrite/2:str.length;for(var i=0;i<numCharsToWrite;++i){var codeUnit=str.charCodeAt(i);HEAP16[outPtr>>1]=codeUnit;outPtr+=2}HEAP16[outPtr>>1]=0;return outPtr-startPtr}Module["stringToUTF16"]=stringToUTF16;function lengthBytesUTF16(str){return str.length*2}Module["lengthBytesUTF16"]=lengthBytesUTF16;function UTF32ToString(ptr){var i=0;var str="";while(1){var utf32=HEAP32[ptr+i*4>>2];if(utf32==0)return str;++i;if(utf32>=65536){var ch=utf32-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023)}else{str+=String.fromCharCode(utf32)}}}Module["UTF32ToString"]=UTF32ToString;function stringToUTF32(str,outPtr,maxBytesToWrite){if(maxBytesToWrite===undefined){maxBytesToWrite=2147483647}if(maxBytesToWrite<4)return 0;var startPtr=outPtr;var endPtr=startPtr+maxBytesToWrite-4;for(var i=0;i<str.length;++i){var codeUnit=str.charCodeAt(i);if(codeUnit>=55296&&codeUnit<=57343){var trailSurrogate=str.charCodeAt(++i);codeUnit=65536+((codeUnit&1023)<<10)|trailSurrogate&1023}HEAP32[outPtr>>2]=codeUnit;outPtr+=4;if(outPtr+4>endPtr)break}HEAP32[outPtr>>2]=0;return outPtr-startPtr}Module["stringToUTF32"]=stringToUTF32;function lengthBytesUTF32(str){var len=0;for(var i=0;i<str.length;++i){var codeUnit=str.charCodeAt(i);if(codeUnit>=55296&&codeUnit<=57343)++i;len+=4}return len}Module["lengthBytesUTF32"]=lengthBytesUTF32;function demangle(func){var hasLibcxxabi=!!Module["___cxa_demangle"];if(hasLibcxxabi){try{var buf=_malloc(func.length);writeStringToMemory(func.substr(1),buf);var status=_malloc(4);var ret=Module["___cxa_demangle"](buf,0,0,status);if(getValue(status,"i32")===0&&ret){return Pointer_stringify(ret)}}catch(e){}finally{if(buf)_free(buf);if(status)_free(status);if(ret)_free(ret)}}var i=3;var basicTypes={"v":"void","b":"bool","c":"char","s":"short","i":"int","l":"long","f":"float","d":"double","w":"wchar_t","a":"signed char","h":"unsigned char","t":"unsigned short","j":"unsigned int","m":"unsigned long","x":"long long","y":"unsigned long long","z":"..."};var subs=[];var first=true;function dump(x){if(x)Module.print(x);Module.print(func);var pre="";for(var a=0;a<i;a++)pre+=" ";Module.print(pre+"^")}function parseNested(){i++;if(func[i]==="K")i++;var parts=[];while(func[i]!=="E"){if(func[i]==="S"){i++;var next=func.indexOf("_",i);var num=func.substring(i,next)||0;parts.push(subs[num]||"?");i=next+1;continue}if(func[i]==="C"){parts.push(parts[parts.length-1]);i+=2;continue}var size=parseInt(func.substr(i));var pre=size.toString().length;if(!size||!pre){i--;break}var curr=func.substr(i+pre,size);parts.push(curr);subs.push(curr);i+=pre+size}i++;return parts}function parse(rawList,limit,allowVoid){limit=limit||Infinity;var ret="",list=[];function flushList(){return"("+list.join(", ")+")"}var name;if(func[i]==="N"){name=parseNested().join("::");limit--;if(limit===0)return rawList?[name]:name}else{if(func[i]==="K"||first&&func[i]==="L")i++;var size=parseInt(func.substr(i));if(size){var pre=size.toString().length;name=func.substr(i+pre,size);i+=pre+size}}first=false;if(func[i]==="I"){i++;var iList=parse(true);var iRet=parse(true,1,true);ret+=iRet[0]+" "+name+"<"+iList.join(", ")+">"}else{ret=name}paramLoop:while(i<func.length&&limit-->0){var c=func[i++];if(c in basicTypes){list.push(basicTypes[c])}else{switch(c){case"P":list.push(parse(true,1,true)[0]+"*");break;case"R":list.push(parse(true,1,true)[0]+"&");break;case"L":{i++;var end=func.indexOf("E",i);var size=end-i;list.push(func.substr(i,size));i+=size+2;break};case"A":{var size=parseInt(func.substr(i));i+=size.toString().length;if(func[i]!=="_")throw"?";i++;list.push(parse(true,1,true)[0]+" ["+size+"]");break};case"E":break paramLoop;default:ret+="?"+c;break paramLoop}}}if(!allowVoid&&list.length===1&&list[0]==="void")list=[];if(rawList){if(ret){list.push(ret+"?")}return list}else{return ret+flushList()}}var parsed=func;try{if(func=="Object._main"||func=="_main"){return"main()"}if(typeof func==="number")func=Pointer_stringify(func);if(func[0]!=="_")return func;if(func[1]!=="_")return func;if(func[2]!=="Z")return func;switch(func[3]){case"n":return"operator new()";case"d":return"operator delete()"}parsed=parse()}catch(e){parsed+="?"}if(parsed.indexOf("?")>=0&&!hasLibcxxabi){Runtime.warnOnce("warning: a problem occurred in builtin C++ name demangling; build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling")}return parsed}function demangleAll(text){return text.replace(/__Z[\w\d_]+/g,(function(x){var y=demangle(x);return x===y?x:x+" ["+y+"]"}))}function jsStackTrace(){var err=new Error;if(!err.stack){try{throw new Error(0)}catch(e){err=e}if(!err.stack){return"(no stack trace available)"}}return err.stack.toString()}function stackTrace(){return demangleAll(jsStackTrace())}Module["stackTrace"]=stackTrace;var PAGE_SIZE=4096;function alignMemoryPage(x){if(x%4096>0){x+=4096-x%4096}return x}var HEAP;var HEAP8,HEAPU8,HEAP16,HEAPU16,HEAP32,HEAPU32,HEAPF32,HEAPF64;var STATIC_BASE=0,STATICTOP=0,staticSealed=false;var STACK_BASE=0,STACKTOP=0,STACK_MAX=0;var DYNAMIC_BASE=0,DYNAMICTOP=0;function abortOnCannotGrowMemory(){abort("Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value "+TOTAL_MEMORY+", (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which adjusts the size at runtime but prevents some optimizations, (3) set Module.TOTAL_MEMORY to a higher value before the program runs, or if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ")}function enlargeMemory(){abortOnCannotGrowMemory()}var TOTAL_STACK=Module["TOTAL_STACK"]||5242880;var TOTAL_MEMORY=Module["TOTAL_MEMORY"]||268435456;var totalMemory=64*1024;while(totalMemory<TOTAL_MEMORY||totalMemory<2*TOTAL_STACK){if(totalMemory<16*1024*1024){totalMemory*=2}else{totalMemory+=16*1024*1024}}if(totalMemory!==TOTAL_MEMORY){TOTAL_MEMORY=totalMemory}assert(typeof Int32Array!=="undefined"&&typeof Float64Array!=="undefined"&&!!(new Int32Array(1))["subarray"]&&!!(new Int32Array(1))["set"],"JS engine does not provide full typed array support");var buffer;buffer=new ArrayBuffer(TOTAL_MEMORY);HEAP8=new Int8Array(buffer);HEAP16=new Int16Array(buffer);HEAP32=new Int32Array(buffer);HEAPU8=new Uint8Array(buffer);HEAPU16=new Uint16Array(buffer);HEAPU32=new Uint32Array(buffer);HEAPF32=new Float32Array(buffer);HEAPF64=new Float64Array(buffer);HEAP32[0]=255;assert(HEAPU8[0]===255&&HEAPU8[3]===0,"Typed arrays 2 must be run on a little-endian system");Module["HEAP"]=HEAP;Module["buffer"]=buffer;Module["HEAP8"]=HEAP8;Module["HEAP16"]=HEAP16;Module["HEAP32"]=HEAP32;Module["HEAPU8"]=HEAPU8;Module["HEAPU16"]=HEAPU16;Module["HEAPU32"]=HEAPU32;Module["HEAPF32"]=HEAPF32;Module["HEAPF64"]=HEAPF64;function callRuntimeCallbacks(callbacks){while(callbacks.length>0){var callback=callbacks.shift();if(typeof callback=="function"){callback();continue}var func=callback.func;if(typeof func==="number"){if(callback.arg===undefined){Runtime.dynCall("v",func)}else{Runtime.dynCall("vi",func,[callback.arg])}}else{func(callback.arg===undefined?null:callback.arg)}}}var __ATPRERUN__=[];var __ATINIT__=[];var __ATMAIN__=[];var __ATEXIT__=[];var __ATPOSTRUN__=[];var runtimeInitialized=false;var runtimeExited=false;function preRun(){if(Module["preRun"]){if(typeof Module["preRun"]=="function")Module["preRun"]=[Module["preRun"]];while(Module["preRun"].length){addOnPreRun(Module["preRun"].shift())}}callRuntimeCallbacks(__ATPRERUN__)}function ensureInitRuntime(){if(runtimeInitialized)return;runtimeInitialized=true;callRuntimeCallbacks(__ATINIT__)}function preMain(){callRuntimeCallbacks(__ATMAIN__)}function exitRuntime(){callRuntimeCallbacks(__ATEXIT__);runtimeExited=true}function postRun(){if(Module["postRun"]){if(typeof Module["postRun"]=="function")Module["postRun"]=[Module["postRun"]];while(Module["postRun"].length){addOnPostRun(Module["postRun"].shift())}}callRuntimeCallbacks(__ATPOSTRUN__)}function addOnPreRun(cb){__ATPRERUN__.unshift(cb)}Module["addOnPreRun"]=addOnPreRun;function addOnInit(cb){__ATINIT__.unshift(cb)}Module["addOnInit"]=addOnInit;function addOnPreMain(cb){__ATMAIN__.unshift(cb)}Module["addOnPreMain"]=addOnPreMain;function addOnExit(cb){__ATEXIT__.unshift(cb)}Module["addOnExit"]=addOnExit;function addOnPostRun(cb){__ATPOSTRUN__.unshift(cb)}Module["addOnPostRun"]=addOnPostRun;function intArrayFromString(stringy,dontAddNull,length){var len=length>0?length:lengthBytesUTF8(stringy)+1;var u8array=new Array(len);var numBytesWritten=stringToUTF8Array(stringy,u8array,0,u8array.length);if(dontAddNull)u8array.length=numBytesWritten;return u8array}Module["intArrayFromString"]=intArrayFromString;function intArrayToString(array){var ret=[];for(var i=0;i<array.length;i++){var chr=array[i];if(chr>255){chr&=255}ret.push(String.fromCharCode(chr))}return ret.join("")}Module["intArrayToString"]=intArrayToString;function writeStringToMemory(string,buffer,dontAddNull){var array=intArrayFromString(string,dontAddNull);var i=0;while(i<array.length){var chr=array[i];HEAP8[buffer+i>>0]=chr;i=i+1}}Module["writeStringToMemory"]=writeStringToMemory;function writeArrayToMemory(array,buffer){for(var i=0;i<array.length;i++){HEAP8[buffer++>>0]=array[i]}}Module["writeArrayToMemory"]=writeArrayToMemory;function writeAsciiToMemory(str,buffer,dontAddNull){for(var i=0;i<str.length;++i){HEAP8[buffer++>>0]=str.charCodeAt(i)}if(!dontAddNull)HEAP8[buffer>>0]=0}Module["writeAsciiToMemory"]=writeAsciiToMemory;function unSign(value,bits,ignore){if(value>=0){return value}return bits<=32?2*Math.abs(1<<bits-1)+value:Math.pow(2,bits)+value}function reSign(value,bits,ignore){if(value<=0){return value}var half=bits<=32?Math.abs(1<<bits-1):Math.pow(2,bits-1);if(value>=half&&(bits<=32||value>half)){value=-2*half+value}return value}if(!Math["imul"]||Math["imul"](4294967295,5)!==-5)Math["imul"]=function imul(a,b){var ah=a>>>16;var al=a&65535;var bh=b>>>16;var bl=b&65535;return al*bl+(ah*bl+al*bh<<16)|0};Math.imul=Math["imul"];if(!Math["clz32"])Math["clz32"]=(function(x){x=x>>>0;for(var i=0;i<32;i++){if(x&1<<31-i)return i}return 32});Math.clz32=Math["clz32"];var Math_abs=Math.abs;var Math_cos=Math.cos;var Math_sin=Math.sin;var Math_tan=Math.tan;var Math_acos=Math.acos;var Math_asin=Math.asin;var Math_atan=Math.atan;var Math_atan2=Math.atan2;var Math_exp=Math.exp;var Math_log=Math.log;var Math_sqrt=Math.sqrt;var Math_ceil=Math.ceil;var Math_floor=Math.floor;var Math_pow=Math.pow;var Math_imul=Math.imul;var Math_fround=Math.fround;var Math_min=Math.min;var Math_clz32=Math.clz32;var runDependencies=0;var runDependencyWatcher=null;var dependenciesFulfilled=null;function getUniqueRunDependency(id){return id}function addRunDependency(id){runDependencies++;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}}Module["addRunDependency"]=addRunDependency;function removeRunDependency(id){runDependencies--;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}if(runDependencies==0){if(runDependencyWatcher!==null){clearInterval(runDependencyWatcher);runDependencyWatcher=null}if(dependenciesFulfilled){var callback=dependenciesFulfilled;dependenciesFulfilled=null;callback()}}}Module["removeRunDependency"]=removeRunDependency;Module["preloadedImages"]={};Module["preloadedAudios"]={};var memoryInitializer=null;var ASM_CONSTS=[(function($0,$1,$2,$3){{if(!artoolkit["multiEachMarkerInfo"]){artoolkit["multiEachMarkerInfo"]={}}var multiEachMarker=artoolkit["multiEachMarkerInfo"];multiEachMarker["visible"]=$0;multiEachMarker["pattId"]=$1;multiEachMarker["pattType"]=$2;multiEachMarker["width"]=$3}}),(function($0,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32){{var $a=arguments;var i=12;if(!artoolkit["markerInfo"]){artoolkit["markerInfo"]={pos:[0,0],line:[[0,0,0],[0,0,0],[0,0,0],[0,0,0]],vertex:[[0,0],[0,0],[0,0],[0,0]]}}var markerInfo=artoolkit["markerInfo"];markerInfo["area"]=$0;markerInfo["id"]=$1;markerInfo["idPatt"]=$2;markerInfo["idMatrix"]=$3;markerInfo["dir"]=$4;markerInfo["dirPatt"]=$5;markerInfo["dirMatrix"]=$6;markerInfo["cf"]=$7;markerInfo["cfPatt"]=$8;markerInfo["cfMatrix"]=$9;markerInfo["pos"][0]=$10;markerInfo["pos"][1]=$11;markerInfo["line"][0][0]=$a[i++];markerInfo["line"][0][1]=$a[i++];markerInfo["line"][0][2]=$a[i++];markerInfo["line"][1][0]=$a[i++];markerInfo["line"][1][1]=$a[i++];markerInfo["line"][1][2]=$a[i++];markerInfo["line"][2][0]=$a[i++];markerInfo["line"][2][1]=$a[i++];markerInfo["line"][2][2]=$a[i++];markerInfo["line"][3][0]=$a[i++];markerInfo["line"][3][1]=$a[i++];markerInfo["line"][3][2]=$a[i++];markerInfo["vertex"][0][0]=$a[i++];markerInfo["vertex"][0][1]=$a[i++];markerInfo["vertex"][1][0]=$a[i++];markerInfo["vertex"][1][1]=$a[i++];markerInfo["vertex"][2][0]=$a[i++];markerInfo["vertex"][2][1]=$a[i++];markerInfo["vertex"][3][0]=$a[i++];markerInfo["vertex"][3][1]=$a[i++];markerInfo["errorCorrected"]=$a[i++]}}),(function($0,$1,$2,$3,$4){{if(!artoolkit["frameMalloc"]){artoolkit["frameMalloc"]={}}var frameMalloc=artoolkit["frameMalloc"];frameMalloc["framepointer"]=$1;frameMalloc["framesize"]=$2;frameMalloc["camera"]=$3;frameMalloc["transform"]=$4}})];function _emscripten_asm_const_33(code,a0,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13,a14,a15,a16,a17,a18,a19,a20,a21,a22,a23,a24,a25,a26,a27,a28,a29,a30,a31,a32){return ASM_CONSTS[code](a0,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13,a14,a15,a16,a17,a18,a19,a20,a21,a22,a23,a24,a25,a26,a27,a28,a29,a30,a31,a32)}function _emscripten_asm_const_4(code,a0,a1,a2,a3){return ASM_CONSTS[code](a0,a1,a2,a3)}function _emscripten_asm_const_5(code,a0,a1,a2,a3,a4){return ASM_CONSTS[code](a0,a1,a2,a3,a4)}STATIC_BASE=8;STATICTOP=STATIC_BASE+16496;__ATINIT__.push({func:(function(){__GLOBAL__sub_I_ARToolKitJS_cpp()})},{func:(function(){__GLOBAL__sub_I_bind_cpp()})});allocate([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,52,9,0,0,53,42,0,0,0,0,0,0,1,0,0,0,128,1,0,0,0,0,0,0,228,8,0,0,116,42,0,0,52,9,0,0,136,47,0,0,0,0,0,0,1,0,0,0,128,1,0,0,0,0,0,0,52,9,0,0,73,47,0,0,0,0,0,0,1,0,0,0,128,1,0,0,0,0,0,0,228,8,0,0,54,47,0,0,228,8,0,0,23,47,0,0,228,8,0,0,62,46,0,0,228,8,0,0,31,46,0,0,228,8,0,0,0,46,0,0,228,8,0,0,225,45,0,0,228,8,0,0,194,45,0,0,228,8,0,0,93,46,0,0,228,8,0,0,124,46,0,0,228,8,0,0,155,46,0,0,228,8,0,0,186,46,0,0,228,8,0,0,217,46,0,0,228,8,0,0,248,46,0,0,12,9,0,0,199,47,0,0,48,2,0,0,0,0,0,0,228,8,0,0,212,47,0,0,228,8,0,0,225,47,0,0,12,9,0,0,238,47,0,0,56,2,0,0,0,0,0,0,12,9,0,0,15,48,0,0,64,2,0,0,0,0,0,0,12,9,0,0,49,48,0,0,64,2,0,0,0,0,0,0,200,8,0,0,89,48,0,0,200,8,0,0,91,48,0,0,200,8,0,0,93,48,0,0,200,8,0,0,95,48,0,0,200,8,0,0,97,48,0,0,200,8,0,0,99,48,0,0,200,8,0,0,101,48,0,0,200,8,0,0,103,48,0,0,200,8,0,0,105,48,0,0,200,8,0,0,107,48,0,0,200,8,0,0,109,48,0,0,200,8,0,0,111,48,0,0,200,8,0,0,113,48,0,0,12,9,0,0,115,48,0,0,80,2,0,0,0,0,0,0,12,9,0,0,152,48,0,0,80,2,0,0,0,0,0,0,255,15,0,0,6,16,0,0,18,16,0,0,28,16,0,0,255,255,255,255,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,1,0,0,0,2,0,0,0,4,0,0,0,8,0,0,0,3,0,0,0,6,0,0,0,12,0,0,0,11,0,0,0,5,0,0,0,10,0,0,0,7,0,0,0,14,0,0,0,15,0,0,0,13,0,0,0,9,0,0,0,1,0,0,0,2,0,0,0,4,0,0,0,8,0,0,0,16,0,0,0,32,0,0,0,64,0,0,0,3,0,0,0,6,0,0,0,12,0,0,0,24,0,0,0,48,0,0,0,96,0,0,0,67,0,0,0,5,0,0,0,10,0,0,0,20,0,0,0,40,0,0,0,80,0,0,0,35,0,0,0,70,0,0,0,15,0,0,0,30,0,0,0,60,0,0,0,120,0,0,0,115,0,0,0,101,0,0,0,73,0,0,0,17,0,0,0,34,0,0,0,68,0,0,0,11,0,0,0,22,0,0,0,44,0,0,0,88,0,0,0,51,0,0,0,102,0,0,0,79,0,0,0,29,0,0,0,58,0,0,0,116,0,0,0,107,0,0,0,85,0,0,0,41,0,0,0,82,0,0,0,39,0,0,0,78,0,0,0,31,0,0,0,62,0,0,0,124,0,0,0,123,0,0,0,117,0,0,0,105,0,0,0,81,0,0,0,33,0,0,0,66,0,0,0,7,0,0,0,14,0,0,0,28,0,0,0,56,0,0,0,112,0,0,0,99,0,0,0,69,0,0,0,9,0,0,0,18,0,0,0,36,0,0,0,72,0,0,0,19,0,0,0,38,0,0,0,76,0,0,0,27,0,0,0,54,0,0,0,108,0,0,0,91,0,0,0,53,0,0,0,106,0,0,0,87,0,0,0,45,0,0,0,90,0,0,0,55,0,0,0,110,0,0,0,95,0,0,0,61,0,0,0,122,0,0,0,119,0,0,0,109,0,0,0,89,0,0,0,49,0,0,0,98,0,0,0,71,0,0,0,13,0,0,0,26,0,0,0,52,0,0,0,104,0,0,0,83,0,0,0,37,0,0,0,74,0,0,0,23,0,0,0,46,0,0,0,92,0,0,0,59,0,0,0,118,0,0,0,111,0,0,0,93,0,0,0,57,0,0,0,114,0,0,0,103,0,0,0,77,0,0,0,25,0,0,0,50,0,0,0,100,0,0,0,75,0,0,0,21,0,0,0,42,0,0,0,84,0,0,0,43,0,0,0,86,0,0,0,47,0,0,0,94,0,0,0,63,0,0,0,126,0,0,0,127,0,0,0,125,0,0,0,121,0,0,0,113,0,0,0,97,0,0,0,65,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,4,0,0,0,2,0,0,0,8,0,0,0,5,0,0,0,10,0,0,0,3,0,0,0,14,0,0,0,9,0,0,0,7,0,0,0,6,0,0,0,13,0,0,0,11,0,0,0,12,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,7,0,0,0,2,0,0,0,14,0,0,0,8,0,0,0,56,0,0,0,3,0,0,0,63,0,0,0,15,0,0,0,31,0,0,0,9,0,0,0,90,0,0,0,57,0,0,0,21,0,0,0,4,0,0,0,28,0,0,0,64,0,0,0,67,0,0,0,16,0,0,0,112,0,0,0,32,0,0,0,97,0,0,0,10,0,0,0,108,0,0,0,91,0,0,0,70,0,0,0,58,0,0,0,38,0,0,0,22,0,0,0,47,0,0,0,5,0,0,0,54,0,0,0,29,0,0,0,19,0,0,0,65,0,0,0,95,0,0,0,68,0,0,0,45,0,0,0,17,0,0,0,43,0,0,0,113,0,0,0,115,0,0,0,33,0,0,0,77,0,0,0,98,0,0,0,117,0,0,0,11,0,0,0,87,0,0,0,109,0,0,0,35,0,0,0,92,0,0,0,74,0,0,0,71,0,0,0,79,0,0,0,59,0,0,0,104,0,0,0,39,0,0,0,100,0,0,0,23,0,0,0,82,0,0,0,48,0,0,0,119,0,0,0,6,0,0,0,126,0,0,0,55,0,0,0,13,0,0,0,30,0,0,0,62,0,0,0,20,0,0,0,89,0,0,0,66,0,0,0,27,0,0,0,96,0,0,0,111,0,0,0,69,0,0,0,107,0,0,0,46,0,0,0,37,0,0,0,18,0,0,0,53,0,0,0,44,0,0,0,94,0,0,0,114,0,0,0,42,0,0,0,116,0,0,0,76,0,0,0,34,0,0,0,86,0,0,0,78,0,0,0,73,0,0,0,99,0,0,0,103,0,0,0,118,0,0,0,81,0,0,0,12,0,0,0,125,0,0,0,88,0,0,0,61,0,0,0,110,0,0,0,26,0,0,0,36,0,0,0,106,0,0,0,93,0,0,0,52,0,0,0,75,0,0,0,41,0,0,0,72,0,0,0,85,0,0,0,80,0,0,0,102,0,0,0,60,0,0,0,124,0,0,0,105,0,0,0,25,0,0,0,40,0,0,0,51,0,0,0,101,0,0,0,84,0,0,0,24,0,0,0,123,0,0,0,83,0,0,0,50,0,0,0,49,0,0,0,122,0,0,0,120,0,0,0,121,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,136,0,0,0,5,0,0,0,144,0,0,0,6,0,0,0,152,0,0,0,9,0,0,0,176,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,253,255,255,255,254,255,255,255,0,0,0,0,112,2,0,0,168,2,0,0,200,2,0,0,112,2,0,0,168,2,0,0,168,2,0,0,208,2,0,0,168,2,0,0,112,2,0,0,168,2,0,0,208,2,0,0,168,2,0,0,112,2,0,0,168,2,0,0,168,2,0,0,104,1,0,0,168,2,0,0,168,2,0,0,168,2,0,0,168,2,0,0,168,2,0,0,104,1,0,0,168,2,0,0,168,2,0,0,168,2,0,0,168,2,0,0,168,2,0,0,168,2,0,0,0,0,0,0,32,2,0,0,1,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,96,2,0,0,3,0,0,0,4,0,0,0,5,0,0,0,6,0,0,0,1,0,0,0,0,0,0,0,80,2,0,0,3,0,0,0,7,0,0,0,5,0,0,0,6,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,216,2,0,0,3,0,0,0,8,0,0,0,5,0,0,0,6,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,232,2,0,0,3,0,0,0,9,0,0,0,5,0,0,0,6,0,0,0,2,0,0,0,3,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,192,3,0,0,192,4,0,0,192,5,0,0,192,6,0,0,192,7,0,0,192,8,0,0,192,9,0,0,192,10,0,0,192,11,0,0,192,12,0,0,192,13,0,0,192,14,0,0,192,15,0,0,192,16,0,0,192,17,0,0,192,18,0,0,192,19,0,0,192,20,0,0,192,21,0,0,192,22,0,0,192,23,0,0,192,24,0,0,192,25,0,0,192,26,0,0,192,27,0,0,192,28,0,0,192,29,0,0,192,30,0,0,192,31,0,0,192,0,0,0,179,1,0,0,195,2,0,0,195,3,0,0,195,4,0,0,195,5,0,0,195,6,0,0,195,7,0,0,195,8,0,0,195,9,0,0,195,10,0,0,195,11,0,0,195,12,0,0,195,13,0,0,211,14,0,0,195,15,0,0,195,0,0,12,187,1,0,12,195,2,0,12,195,3,0,12,195,4,0,12,211,240,10,0,0,96,11,0,0,0,0,0,0,10,0,0,0,100,0,0,0,232,3,0,0,16,39,0,0,160,134,1,0,64,66,15,0,128,150,152,0,0,225,245,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,5,0,0,0,81,62,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,5,0,0,0,73,58,0,0,0,4,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,3,0,0,0,5,0,0,0,7,0,0,0,11,0,0,0,13,0,0,0,17,0,0,0,19,0,0,0,23,0,0,0,29,0,0,0,31,0,0,0,37,0,0,0,41,0,0,0,43,0,0,0,47,0,0,0,53,0,0,0,59,0,0,0,61,0,0,0,67,0,0,0,71,0,0,0,73,0,0,0,79,0,0,0,83,0,0,0,89,0,0,0,97,0,0,0,101,0,0,0,103,0,0,0,107,0,0,0,109,0,0,0,113,0,0,0,127,0,0,0,131,0,0,0,137,0,0,0,139,0,0,0,149,0,0,0,151,0,0,0,157,0,0,0,163,0,0,0,167,0,0,0,173,0,0,0,179,0,0,0,181,0,0,0,191,0,0,0,193,0,0,0,197,0,0,0,199,0,0,0,211,0,0,0,1,0,0,0,11,0,0,0,13,0,0,0,17,0,0,0,19,0,0,0,23,0,0,0,29,0,0,0,31,0,0,0,37,0,0,0,41,0,0,0,43,0,0,0,47,0,0,0,53,0,0,0,59,0,0,0,61,0,0,0,67,0,0,0,71,0,0,0,73,0,0,0,79,0,0,0,83,0,0,0,89,0,0,0,97,0,0,0,101,0,0,0,103,0,0,0,107,0,0,0,109,0,0,0,113,0,0,0,121,0,0,0,127,0,0,0,131,0,0,0,137,0,0,0,139,0,0,0,143,0,0,0,149,0,0,0,151,0,0,0,157,0,0,0,163,0,0,0,167,0,0,0,169,0,0,0,173,0,0,0,179,0,0,0,181,0,0,0,187,0,0,0,191,0,0,0,193,0,0,0,197,0,0,0,199,0,0,0,209,0,0,0,69,114,114,111,114,58,32,108,97,98,101,108,105,110,103,32,119,111,114,107,32,111,118,101,114,102,108,111,119,46,10,0,69,114,114,111,114,58,32,85,110,115,117,112,112,111,114,116,101,100,32,112,105,120,101,108,32,102,111,114,109,97,116,32,40,37,100,41,32,114,101,113,117,101,115,116,101,100,46,10,0,85,110,107,110,111,119,110,32,111,114,32,117,110,115,117,112,112,111,114,116,101,100,32,108,97,98,101,108,105,110,103,32,116,104,114,101,115,104,111,108,100,32,109,111,100,101,32,114,101,113,117,101,115,116,101,100,46,32,83,101,116,32,116,111,32,109,97,110,117,97,108,46,10,0,76,97,98,101,108,105,110,103,32,116,104,114,101,115,104,111,108,100,32,109,111,100,101,32,115,101,116,32,116,111,32,37,115,46,10,0,77,65,78,85,65,76,0,65,85,84,79,95,77,69,68,73,65,78,0,65,85,84,79,95,79,84,83,85,0,65,85,84,79,95,65,68,65,80,84,73,86,69,65,85,84,79,95,66,82,65,67,75,69,84,73,78,71,0,65,117,116,111,32,116,104,114,101,115,104,111,108,100,32,40,98,114,97,99,107,101,116,41,32,109,97,114,107,101,114,32,99,111,117,110,116,115,32,45,91,37,51,100,58,32,37,51,100,93,32,91,37,51,100,58,32,37,51,100,93,32,91,37,51,100,58,32,37,51,100,93,43,46,10,0,65,117,116,111,32,116,104,114,101,115,104,111,108,100,32,40,98,114,97,99,107,101,116,41,32,97,100,106,117,115,116,101,100,32,116,104,114,101,115,104,111,108,100,32,116,111,32,37,100,46,10,0,109,101,100,105,97,110,0,79,116,115,117,0,65,117,116,111,32,116,104,114,101,115,104,111,108,100,32,40,37,115,41,32,97,100,106,117,115,116,101,100,32,116,104,114,101,115,104,111,108,100,32,116,111,32,37,100,46,10,0,63,63,63,32,49,10,0,63,63,63,32,50,10,0,63,63,63,32,51,10,0,69,114,114,111,114,58,32,85,110,115,117,112,112,111,114,116,101,100,32,112,105,120,101,108,32,102,111,114,109,97,116,32,112,97,115,115,101,100,32,116,111,32,97,114,73,109,97,103,101,80,114,111,99,72,105,115,116,40,41,46,10,0,0,0,0,1,0,1,1,1,0,2,4,255,255,5,3,1,0,2,255,6,7,255,3,1,2,2,3,2,3,2,3,3,0,255,4,6,7,5,255,1,4,5,4,4,5,5,4,5,7,6,6,6,7,7,7,6,255,2,4,6,7,5,3,255,0,1,1,1,1,1,1,0,1,1,1,0,0,1,1,1,1,1,0,1,1,0,1,1,1,0,1,1,1,1,0,1,1,0,1,1,1,1,0,1,1,1,0,1,1,0,1,1,1,1,1,0,0,1,1,1,0,1,1,1,1,1,1,0,0,255,255,3,255,5,6,255,255,9,10,255,12,255,255,15,255,17,18,255,20,255,255,23,24,255,255,27,255,29,30,255,255,1,2,255,4,255,255,7,8,255,255,11,255,13,14,255,16,255,255,19,255,21,22,255,255,25,26,255,28,255,255,31,69,114,114,111,114,58,32,117,110,115,117,112,112,111,114,116,101,100,32,112,105,120,101,108,32,102,111,114,109,97,116,46,10,0,69,114,114,111,114,58,32,78,85,76,76,32,112,97,116,116,72,97,110,100,108,101,46,10,0,69,114,114,111,114,58,32,99,97,110,39,116,32,108,111,97,100,32,112,97,116,116,101,114,110,32,102,114,111,109,32,78,85,76,76,32,98,117,102,102,101,114,46,10,0,69,114,114,111,114,58,32,111,117,116,32,111,102,32,109,101,109,111,114,121,46,10,0,32,9,10,13,0,80,97,116,116,101,114,110,32,68,97,116,97,32,114,101,97,100,32,101,114,114,111,114,33,33,10,0,69,114,114,111,114,32,111,112,101,110,105,110,103,32,112,97,116,116,101,114,110,32,102,105,108,101,32,39,37,115,39,32,102,111,114,32,114,101,97,100,105,110,103,46,10,0,69,114,114,111,114,32,114,101,97,100,105,110,103,32,112,97,116,116,101,114,110,32,102,105,108,101,32,39,37,115,39,46,10,0,114,98,0,69,114,114,111,114,32,40,37,100,41,58,32,117,110,97,98,108,101,32,116,111,32,111,112,101,110,32,99,97,109,101,114,97,32,112,97,114,97,109,101,116,101,114,115,32,102,105,108,101,32,34,37,115,34,32,102,111,114,32,114,101,97,100,105,110,103,46,10,0,69,114,114,111,114,32,40,37,100,41,58,32,117,110,97,98,108,101,32,116,111,32,100,101,116,101,114,109,105,110,101,32,102,105,108,101,32,108,101,110,103,116,104,46,0,69,114,114,111,114,58,32,115,117,112,112,108,105,101,100,32,102,105,108,101,32,100,111,101,115,32,110,111,116,32,97,112,112,101,97,114,32,116,111,32,98,101,32,97,110,32,65,82,84,111,111,108,75,105,116,32,99,97,109,101,114,97,32,112,97,114,97,109,101,116,101,114,32,102,105,108,101,46,10,0,69,114,114,111,114,32,40,37,100,41,58,32,117,110,97,98,108,101,32,116,111,32,114,101,97,100,32,102,114,111,109,32,102,105,108,101,46,0,69,114,114,111,114,58,32,105,99,112,71,101,116,74,95,85,95,88,99,0,69,114,114,111,114,58,32,109,97,108,108,111,99,10,0,69,114,114,111,114,32,49,58,32,105,99,112,71,101,116,73,110,105,116,88,119,50,88,99,10,0,69,114,114,111,114,32,50,58,32,105,99,112,71,101,116,73,110,105,116,88,119,50,88,99,10,0,69,114,114,111,114,32,51,58,32,105,99,112,71,101,116,73,110,105,116,88,119,50,88,99,10,0,69,114,114,111,114,32,52,58,32,105,99,112,71,101,116,73,110,105,116,88,119,50,88,99,10,0,69,114,114,111,114,32,53,58,32,105,99,112,71,101,116,73,110,105,116,88,119,50,88,99,10,0,69,114,114,111,114,32,54,58,32,105,99,112,71,101,116,73,110,105,116,88,119,50,88,99,10,0,69,114,114,111,114,32,55,58,32,105,99,112,71,101,116,73,110,105,116,88,119,50,88,99,10,0,114,0,69,114,114,111,114,58,32,117,110,97,98,108,101,32,116,111,32,111,112,101,110,32,109,117,108,116,105,109,97,114,107,101,114,32,99,111,110,102,105,103,32,102,105,108,101,32,39,37,115,39,46,10,0,37,115,37,115,10,0,0,37,100,0,69,114,114,111,114,32,112,114,111,99,101,115,115,105,110,103,32,109,117,108,116,105,109,97,114,107,101,114,32,99,111,110,102,105,103,32,102,105,108,101,32,39,37,115,39,58,32,70,105,114,115,116,32,108,105,110,101,32,109,117,115,116,32,98,101,32,110,117,109,98,101,114,32,111,102,32,109,97,114,107,101,114,32,99,111,110,102,105,103,115,32,116,111,32,114,101,97,100,46,10,0,79,117,116,32,111,102,32,109,101,109,111,114,121,33,33,10,0,37,108,108,117,37,99,0,69,114,114,111,114,32,112,114,111,99,101,115,115,105,110,103,32,109,117,108,116,105,109,97,114,107,101,114,32,99,111,110,102,105,103,32,102,105,108,101,32,39,37,115,39,58,32,112,97,116,116,101,114,110,32,39,37,115,39,32,115,112,101,99,105,102,105,101,100,32,105,110,32,109,117,108,116,105,109,97,114,107,101,114,32,99,111,110,102,105,103,117,114,97,116,105,111,110,32,119,104,105,108,101,32,105,110,32,98,97,114,99,111,100,101,45,111,110,108,121,32,109,111,100,101,46,10,0,69,114,114,111,114,32,112,114,111,99,101,115,115,105,110,103,32,109,117,108,116,105,109,97,114,107,101,114,32,99,111,110,102,105,103,32,102,105,108,101,32,39,37,115,39,58,32,85,110,97,98,108,101,32,116,111,32,100,101,116,101,114,109,105,110,101,32,100,105,114,101,99,116,111,114,121,32,110,97,109,101,46,10,0,69,114,114,111,114,32,112,114,111,99,101,115,115,105,110,103,32,109,117,108,116,105,109,97,114,107,101,114,32,99,111,110,102,105,103,32,102,105,108,101,32,39,37,115,39,58,32,85,110,97,98,108,101,32,116,111,32,108,111,97,100,32,112,97,116,116,101,114,110,32,39,37,115,39,46,10,0,37,108,102,0,69,114,114,111,114,32,112,114,111,99,101,115,115,105,110,103,32,109,117,108,116,105,109,97,114,107,101,114,32,99,111,110,102,105,103,32,102,105,108,101,32,39,37,115,39,44,32,109,97,114,107,101,114,32,100,101,102,105,110,105,116,105,111,110,32,37,51,100,58,32,70,105,114,115,116,32,108,105,110,101,32,109,117,115,116,32,98,101,32,112,97,116,116,101,114,110,32,119,105,100,116,104,46,10,0,37,108,102,32,37,108,102,32,37,108,102,32,37,108,102,0,37,102,32,37,102,0,69,114,114,111,114,32,112,114,111,99,101,115,115,105,110,103,32,109,117,108,116,105,109,97,114,107,101,114,32,99,111,110,102,105,103,32,102,105,108,101,32,39,37,115,39,44,32,109,97,114,107,101,114,32,100,101,102,105,110,105,116,105,111,110,32,37,51,100,58,32,76,105,110,101,115,32,50,32,45,32,52,32,109,117,115,116,32,98,101,32,109,97,114,107,101,114,32,116,114,97,110,115,102,111,114,109,46,10,0,97,114,103,108,67,97,109,101,114,97,70,114,117,115,116,117,109,40,41,58,32,97,114,80,97,114,97,109,68,101,99,111,109,112,77,97,116,40,41,32,105,110,100,105,99,97,116,101,100,32,112,97,114,97,109,101,116,101,114,32,101,114,114,111,114,46,10,0,108,111,97,100,67,97,109,101,114,97,40,41,58,32,69,114,114,111,114,32,108,111,97,100,105,110,103,32,112,97,114,97,109,101,116,101,114,32,102,105,108,101,32,37,115,32,102,111,114,32,99,97,109,101,114,97,46,10,0,42,42,42,32,67,97,109,101,114,97,32,80,97,114,97,109,101,116,101,114,32,114,101,115,105,122,101,100,32,102,114,111,109,32,37,100,44,32,37,100,46,32,42,42,42,10,0,115,101,116,67,97,109,101,114,97,40,41,58,32,69,114,114,111,114,58,32,97,114,80,97,114,97,109,76,84,67,114,101,97,116,101,46,10,0,115,101,116,67,97,109,101,114,97,40,41,58,32,69,114,114,111,114,58,32,97,114,67,114,101,97,116,101,72,97,110,100,108,101,46,10,0,115,101,116,67,97,109,101,114,97,40,41,58,32,69,114,114,111,114,32,99,114,101,97,116,105,110,103,32,51,68,32,104,97,110,100,108,101,0,108,111,97,100,77,97,114,107,101,114,40,41,58,32,69,114,114,111,114,32,108,111,97,100,105,110,103,32,112,97,116,116,101,114,110,32,102,105,108,101,32,37,115,46,10,0,65,82,84,111,111,108,75,105,116,74,83,40,41,58,32,85,110,97,98,108,101,32,116,111,32,115,101,116,32,117,112,32,65,82,32,109,97,114,107,101,114,46,10,0,99,111,110,102,105,103,32,100,97,116,97,32,108,111,97,100,32,101,114,114,111,114,32,33,33,10,0,65,82,84,111,111,108,75,105,116,74,83,40,41,58,32,85,110,97,98,108,101,32,116,111,32,115,101,116,32,117,112,32,65,82,32,109,117,108,116,105,109,97,114,107,101,114,46,10,0,80,97,116,116,101,114,110,32,100,101,116,101,99,116,105,111,110,32,109,111,100,101,32,115,101,116,32,116,111,32,37,100,46,10,0,80,97,116,116,101,114,110,32,114,97,116,105,111,32,115,105,122,101,32,115,101,116,32,116,111,32,37,102,46,10,0,76,97,98,101,108,105,110,103,32,109,111,100,101,32,115,101,116,32,116,111,32,37,100,10,0,84,104,114,101,115,104,111,108,100,32,115,101,116,32,116,111,32,37,100,10,0,84,104,114,101,115,104,111,108,100,32,109,111,100,101,32,115,101,116,32,116,111,32,37,100,10,0,111,110,46,0,111,102,102,46,0,68,101,98,117,103,32,109,111,100,101,32,115,101,116,32,116,111,32,37,115,10,0,73,109,97,103,101,32,112,114,111,99,46,32,109,111,100,101,32,115,101,116,32,116,111,32,37,100,46,10,0,123,32,105,102,32,40,33,97,114,116,111,111,108,107,105,116,91,34,109,117,108,116,105,69,97,99,104,77,97,114,107,101,114,73,110,102,111,34,93,41,32,123,32,97,114,116,111,111,108,107,105,116,91,34,109,117,108,116,105,69,97,99,104,77,97,114,107,101,114,73,110,102,111,34,93,32,61,32,40,123,125,41,59,32,125,32,118,97,114,32,109,117,108,116,105,69,97,99,104,77,97,114,107,101,114,32,61,32,97,114,116,111,111,108,107,105,116,91,34,109,117,108,116,105,69,97,99,104,77,97,114,107,101,114,73,110,102,111,34,93,59,32,109,117,108,116,105,69,97,99,104,77,97,114,107,101,114,91,39,118,105,115,105,98,108,101,39,93,32,61,32,36,48,59,32,109,117,108,116,105,69,97,99,104,77,97,114,107,101,114,91,39,112,97,116,116,73,100,39,93,32,61,32,36,49,59,32,109,117,108,116,105,69,97,99,104,77,97,114,107,101,114,91,39,112,97,116,116,84,121,112,101,39,93,32,61,32,36,50,59,32,109,117,108,116,105,69,97,99,104,77,97,114,107,101,114,91,39,119,105,100,116,104,39,93,32,61,32,36,51,59,32,125,0,123,32,118,97,114,32,36,97,32,61,32,97,114,103,117,109,101,110,116,115,59,32,118,97,114,32,105,32,61,32,49,50,59,32,105,102,32,40,33,97,114,116,111,111,108,107,105,116,91,34,109,97,114,107,101,114,73,110,102,111,34,93,41,32,123,32,97,114,116,111,111,108,107,105,116,91,34,109,97,114,107,101,114,73,110,102,111,34,93,32,61,32,40,123,32,112,111,115,58,32,91,48,44,48,93,44,32,108,105,110,101,58,32,91,91,48,44,48,44,48,93,44,32,91,48,44,48,44,48,93,44,32,91,48,44,48,44,48,93,44,32,91,48,44,48,44,48,93,93,44,32,118,101,114,116,101,120,58,32,91,91,48,44,48,93,44,32,91,48,44,48,93,44,32,91,48,44,48,93,44,32,91,48,44,48,93,93,32,125,41,59,32,125,32,118,97,114,32,109,97,114,107,101,114,73,110,102,111,32,61,32,97,114,116,111,111,108,107,105,116,91,34,109,97,114,107,101,114,73,110,102,111,34,93,59,32,109,97,114,107,101,114,73,110,102,111,91,34,97,114,101,97,34,93,32,61,32,36,48,59,32,109,97,114,107,101,114,73,110,102,111,91,34,105,100,34,93,32,61,32,36,49,59,32,109,97,114,107,101,114,73,110,102,111,91,34,105,100,80,97,116,116,34,93,32,61,32,36,50,59,32,109,97,114,107,101,114,73,110,102,111,91,34,105,100,77,97,116,114,105,120,34,93,32,61,32,36,51,59,32,109,97,114,107,101,114,73,110,102,111,91,34,100,105,114,34,93,32,61,32,36,52,59,32,109,97,114,107,101,114,73,110,102,111,91,34,100,105,114,80,97,116,116,34,93,32,61,32,36,53,59,32,109,97,114,107,101,114,73,110,102,111,91,34,100,105,114,77,97,116,114,105,120,34,93,32,61,32,36,54,59,32,109,97,114,107,101,114,73,110,102,111,91,34,99,102,34,93,32,61,32,36,55,59,32,109,97,114,107,101,114,73,110,102,111,91,34,99,102,80,97,116,116,34,93,32,61,32,36,56,59,32,109,97,114,107,101,114,73,110,102,111,91,34,99,102,77,97,116,114,105,120,34,93,32,61,32,36,57,59,32,109,97,114,107,101,114,73,110,102,111,91,34,112,111,115,34,93,91,48,93,32,61,32,36,49,48,59,32,109,97,114,107,101,114,73,110,102,111,91,34,112,111,115,34,93,91,49,93,32,61,32,36,49,49,59,32,109,97,114,107,101,114,73,110,102,111,91,34,108,105,110,101,34,93,91,48,93,91,48,93,32,61,32,36,97,91,105,43,43,93,59,32,109,97,114,107,101,114,73,110,102,111,91,34,108,105,110,101,34,93,91,48,93,91,49,93,32,61,32,36,97,91,105,43,43,93,59,32,109,97,114,107,101,114,73,110,102,111,91,34,108,105,110,101,34,93,91,48,93,91,50,93,32,61,32,36,97,91,105,43,43,93,59,32,109,97,114,107,101,114,73,110,102,111,91,34,108,105,110,101,34,93,91,49,93,91,48,93,32,61,32,36,97,91,105,43,43,93,59,32,109,97,114,107,101,114,73,110,102,111,91,34,108,105,110,101,34,93,91,49,93,91,49,93,32,61,32,36,97,91,105,43,43,93,59,32,109,97,114,107,101,114,73,110,102,111,91,34,108,105,110,101,34,93,91,49,93,91,50,93,32,61,32,36,97,91,105,43,43,93,59,32,109,97,114,107,101,114,73,110,102,111,91,34,108,105,110,101,34,93,91,50,93,91,48,93,32,61,32,36,97,91,105,43,43,93,59,32,109,97,114,107,101,114,73,110,102,111,91,34,108,105,110,101,34,93,91,50,93,91,49,93,32,61,32,36,97,91,105,43,43,93,59,32,109,97,114,107,101,114,73,110,102,111,91,34,108,105,110,101,34,93,91,50,93,91,50,93,32,61,32,36,97,91,105,43,43,93,59,32,109,97,114,107,101,114,73,110,102,111,91,34,108,105,110,101,34,93,91,51,93,91,48,93,32,61,32,36,97,91,105,43,43,93,59,32,109,97,114,107,101,114,73,110,102,111,91,34,108,105,110,101,34,93,91,51,93,91,49,93,32,61,32,36,97,91,105,43,43,93,59,32,109,97,114,107,101,114,73,110,102,111,91,34,108,105,110,101,34,93,91,51,93,91,50,93,32,61,32,36,97,91,105,43,43,93,59,32,109,97,114,107,101,114,73,110,102,111,91,34,118,101,114,116,101,120,34,93,91,48,93,91,48,93,32,61,32,36,97,91,105,43,43,93,59,32,109,97,114,107,101,114,73,110,102,111,91,34,118,101,114,116,101,120,34,93,91,48,93,91,49,93,32,61,32,36,97,91,105,43,43,93,59,32,109,97,114,107,101,114,73,110,102,111,91,34,118,101,114,116,101,120,34,93,91,49,93,91,48,93,32,61,32,36,97,91,105,43,43,93,59,32,109,97,114,107,101,114,73,110,102,111,91,34,118,101,114,116,101,120,34,93,91,49,93,91,49,93,32,61,32,36,97,91,105,43,43,93,59,32,109,97,114,107,101,114,73,110,102,111,91,34,118,101,114,116,101,120,34,93,91,50,93,91,48,93,32,61,32,36,97,91,105,43,43,93,59,32,109,97,114,107,101,114,73,110,102,111,91,34,118,101,114,116,101,120,34,93,91,50,93,91,49,93,32,61,32,36,97,91,105,43,43,93,59,32,109,97,114,107,101,114,73,110,102,111,91,34,118,101,114,116,101,120,34,93,91,51,93,91,48,93,32,61,32,36,97,91,105,43,43,93,59,32,109,97,114,107,101,114,73,110,102,111,91,34,118,101,114,116,101,120,34,93,91,51,93,91,49,93,32,61,32,36,97,91,105,43,43,93,59,32,109,97,114,107,101,114,73,110,102,111,91,34,101,114,114,111,114,67,111,114,114,101,99,116,101,100,34,93,32,61,32,36,97,91,105,43,43,93,59,32,125,0,115,101,116,117,112,40,41,58,32,69,114,114,111,114,58,32,97,114,80,97,116,116,67,114,101,97,116,101,72,97,110,100,108,101,46,10,0,65,108,108,111,99,97,116,101,100,32,118,105,100,101,111,70,114,97,109,101,83,105,122,101,32,37,100,10,0,123,32,105,102,32,40,33,97,114,116,111,111,108,107,105,116,91,34,102,114,97,109,101,77,97,108,108,111,99,34,93,41,32,123,32,97,114,116,111,111,108,107,105,116,91,34,102,114,97,109,101,77,97,108,108,111,99,34,93,32,61,32,40,123,125,41,59,32,125,32,118,97,114,32,102,114,97,109,101,77,97,108,108,111,99,32,61,32,97,114,116,111,111,108,107,105,116,91,34,102,114,97,109,101,77,97,108,108,111,99,34,93,59,32,102,114,97,109,101,77,97,108,108,111,99,91,34,102,114,97,109,101,112,111,105,110,116,101,114,34,93,32,61,32,36,49,59,32,102,114,97,109,101,77,97,108,108,111,99,91,34,102,114,97,109,101,115,105,122,101,34,93,32,61,32,36,50,59,32,102,114,97,109,101,77,97,108,108,111,99,91,34,99,97,109,101,114,97,34,93,32,61,32,36,51,59,32,102,114,97,109,101,77,97,108,108,111,99,91,34,116,114,97,110,115,102,111,114,109,34,93,32,61,32,36,52,59,32,125,0,115,101,116,117,112,0,116,101,97,114,100,111,119,110,0,95,97,100,100,77,97,114,107,101,114,0,95,97,100,100,77,117,108,116,105,77,97,114,107,101,114,0,103,101,116,77,117,108,116,105,77,97,114,107,101,114,78,117,109,0,103,101,116,77,117,108,116,105,77,97,114,107,101,114,67,111,117,110,116,0,95,108,111,97,100,67,97,109,101,114,97,0,115,101,116,77,97,114,107,101,114,73,110,102,111,68,105,114,0,115,101,116,77,97,114,107,101,114,73,110,102,111,86,101,114,116,101,120,0,103,101,116,84,114,97,110,115,77,97,116,83,113,117,97,114,101,0,103,101,116,84,114,97,110,115,77,97,116,83,113,117,97,114,101,67,111,110,116,0,103,101,116,84,114,97,110,115,77,97,116,77,117,108,116,105,83,113,117,97,114,101,0,103,101,116,84,114,97,110,115,77,97,116,77,117,108,116,105,83,113,117,97,114,101,82,111,98,117,115,116,0,100,101,116,101,99,116,77,97,114,107,101,114,0,103,101,116,77,97,114,107,101,114,78,117,109,0,103,101,116,77,117,108,116,105,69,97,99,104,77,97,114,107,101,114,0,103,101,116,77,97,114,107,101,114,0,115,101,116,68,101,98,117,103,77,111,100,101,0,103,101,116,68,101,98,117,103,77,111,100,101,0,103,101,116,80,114,111,99,101,115,115,105,110,103,73,109,97,103,101,0,115,101,116,76,111,103,76,101,118,101,108,0,103,101,116,76,111,103,76,101,118,101,108,0,115,101,116,80,114,111,106,101,99,116,105,111,110,78,101,97,114,80,108,97,110,101,0,103,101,116,80,114,111,106,101,99,116,105,111,110,78,101,97,114,80,108,97,110,101,0,115,101,116,80,114,111,106,101,99,116,105,111,110,70,97,114,80,108,97,110,101,0,103,101,116,80,114,111,106,101,99,116,105,111,110,70,97,114,80,108,97,110,101,0,115,101,116,84,104,114,101,115,104,111,108,100,77,111,100,101,0,103,101,116,84,104,114,101,115,104,111,108,100,77,111,100,101,0,115,101,116,84,104,114,101,115,104,111,108,100,0,103,101,116,84,104,114,101,115,104,111,108,100,0,115,101,116,80,97,116,116,101,114,110,68,101,116,101,99,116,105,111,110,77,111,100,101,0,103,101,116,80,97,116,116,101,114,110,68,101,116,101,99,116,105,111,110,77,111,100,101,0,115,101,116,80,97,116,116,82,97,116,105,111,0,103,101,116,80,97,116,116,82,97,116,105,111,0,115,101,116,77,97,116,114,105,120,67,111,100,101,84,121,112,101,0,103,101,116,77,97,116,114,105,120,67,111,100,101,84,121,112,101,0,115,101,116,76,97,98,101,108,105,110,103,77,111,100,101,0,103,101,116,76,97,98,101,108,105,110,103,77,111,100,101,0,115,101,116,73,109,97,103,101,80,114,111,99,77,111,100,101,0,103,101,116,73,109,97,103,101,80,114,111,99,77,111,100,101,0,69,82,82,79,82,95,65,82,67,79,78,84,82,79,76,76,69,82,95,78,79,84,95,70,79,85,78,68,0,69,82,82,79,82,95,77,85,76,84,73,77,65,82,75,69,82,95,78,79,84,95,70,79,85,78,68,0,69,82,82,79,82,95,77,65,82,75,69,82,95,73,78,68,69,88,95,79,85,84,95,79,70,95,66,79,85,78,68,83,0,65,82,95,68,69,66,85,71,95,68,73,83,65,66,76,69,0,65,82,95,68,69,66,85,71,95,69,78,65,66,76,69,0,65,82,95,68,69,70,65,85,76,84,95,68,69,66,85,71,95,77,79,68,69,0,65,82,95,76,65,66,69,76,73,78,71,95,87,72,73,84,69,95,82,69,71,73,79,78,0,65,82,95,76,65,66,69,76,73,78,71,95,66,76,65,67,75,95,82,69,71,73,79,78,0,65,82,95,68,69,70,65,85,76,84,95,76,65,66,69,76,73,78,71,95,77,79,68,69,0,65,82,95,68,69,70,65,85,76,84,95,76,65,66,69,76,73,78,71,95,84,72,82,69,83,72,0,65,82,95,73,77,65,71,69,95,80,82,79,67,95,70,82,65,77,69,95,73,77,65,71,69,0,65,82,95,73,77,65,71,69,95,80,82,79,67,95,70,73,69,76,68,95,73,77,65,71,69,0,65,82,95,68,69,70,65,85,76,84,95,73,77,65,71,69,95,80,82,79,67,95,77,79,68,69,0,65,82,95,84,69,77,80,76,65,84,69,95,77,65,84,67,72,73,78,71,95,67,79,76,79,82,0,65,82,95,84,69,77,80,76,65,84,69,95,77,65,84,67,72,73,78,71,95,77,79,78,79,0,65,82,95,77,65,84,82,73,88,95,67,79,68,69,95,68,69,84,69,67,84,73,79,78,0,65,82,95,84,69,77,80,76,65,84,69,95,77,65,84,67,72,73,78,71,95,67,79,76,79,82,95,65,78,68,95,77,65,84,82,73,88,0,65,82,95,84,69,77,80,76,65,84,69,95,77,65,84,67,72,73,78,71,95,77,79,78,79,95,65,78,68,95,77,65,84,82,73,88,0,65,82,95,68,69,70,65,85,76,84,95,80,65,84,84,69,82,78,95,68,69,84,69,67,84,73,79,78,95,77,79,68,69,0,65,82,95,85,83,69,95,84,82,65,67,75,73,78,71,95,72,73,83,84,79,82,89,0,65,82,95,78,79,85,83,69,95,84,82,65,67,75,73,78,71,95,72,73,83,84,79,82,89,0,65,82,95,85,83,69,95,84,82,65,67,75,73,78,71,95,72,73,83,84,79,82,89,95,86,50,0,65,82,95,68,69,70,65,85,76,84,95,77,65,82,75,69,82,95,69,88,84,82,65,67,84,73,79,78,95,77,79,68,69,0,65,82,95,77,65,88,95,76,79,79,80,95,67,79,85,78,84,0,65,82,95,76,79,79,80,95,66,82,69,65,75,95,84,72,82,69,83,72,0,65,82,95,76,79,71,95,76,69,86,69,76,95,68,69,66,85,71,0,65,82,95,76,79,71,95,76,69,86,69,76,95,73,78,70,79,0,65,82,95,76,79,71,95,76,69,86,69,76,95,87,65,82,78,0,65,82,95,76,79,71,95,76,69,86,69,76,95,69,82,82,79,82,0,65,82,95,76,79,71,95,76,69,86,69,76,95,82,69,76,95,73,78,70,79,0,65,82,95,77,65,84,82,73,88,95,67,79,68,69,95,51,120,51,0,65,82,95,77,65,84,82,73,88,95,67,79,68,69,95,51,120,51,95,72,65,77,77,73,78,71,54,51,0,65,82,95,77,65,84,82,73,88,95,67,79,68,69,95,51,120,51,95,80,65,82,73,84,89,54,53,0,65,82,95,77,65,84,82,73,88,95,67,79,68,69,95,52,120,52,0,65,82,95,77,65,84,82,73,88,95,67,79,68,69,95,52,120,52,95,66,67,72,95,49,51,95,57,95,51,0,65,82,95,77,65,84,82,73,88,95,67,79,68,69,95,52,120,52,95,66,67,72,95,49,51,95,53,95,53,0,65,82,95,76,65,66,69,76,73,78,71,95,84,72,82,69,83,72,95,77,79,68,69,95,77,65,78,85,65,76,0,65,82,95,76,65,66,69,76,73,78,71,95,84,72,82,69,83,72,95,77,79,68,69,95,65,85,84,79,95,77,69,68,73,65,78,0,65,82,95,76,65],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE);allocate([66,69,76,73,78,71,95,84,72,82,69,83,72,95,77,79,68,69,95,65,85,84,79,95,79,84,83,85,0,65,82,95,76,65,66,69,76,73,78,71,95,84,72,82,69,83,72,95,77,79,68,69,95,65,85,84,79,95,65,68,65,80,84,73,86,69,0,65,82,95,77,65,82,75,69,82,95,73,78,70,79,95,67,85,84,79,70,70,95,80,72,65,83,69,95,78,79,78,69,0,65,82,95,77,65,82,75,69,82,95,73,78,70,79,95,67,85,84,79,70,70,95,80,72,65,83,69,95,80,65,84,84,69,82,78,95,69,88,84,82,65,67,84,73,79,78,0,65,82,95,77,65,82,75,69,82,95,73,78,70,79,95,67,85,84,79,70,70,95,80,72,65,83,69,95,77,65,84,67,72,95,71,69,78,69,82,73,67,0,65,82,95,77,65,82,75,69,82,95,73,78,70,79,95,67,85,84,79,70,70,95,80,72,65,83,69,95,77,65,84,67,72,95,67,79,78,84,82,65,83,84,0,65,82,95,77,65,82,75,69,82,95,73,78,70,79,95,67,85,84,79,70,70,95,80,72,65,83,69,95,77,65,84,67,72,95,66,65,82,67,79,68,69,95,78,79,84,95,70,79,85,78,68,0,65,82,95,77,65,82,75,69,82,95,73,78,70,79,95,67,85,84,79,70,70,95,80,72,65,83,69,95,77,65,84,67,72,95,66,65,82,67,79,68,69,95,69,68,67,95,70,65,73,76,0,65,82,95,77,65,82,75,69,82,95,73,78,70,79,95,67,85,84,79,70,70,95,80,72,65,83,69,95,77,65,84,67,72,95,67,79,78,70,73,68,69,78,67,69,0,65,82,95,77,65,82,75,69,82,95,73,78,70,79,95,67,85,84,79,70,70,95,80,72,65,83,69,95,80,79,83,69,95,69,82,82,79,82,0,65,82,95,77,65,82,75,69,82,95,73,78,70,79,95,67,85,84,79,70,70,95,80,72,65,83,69,95,80,79,83,69,95,69,82,82,79,82,95,77,85,76,84,73,0,65,82,95,77,65,82,75,69,82,95,73,78,70,79,95,67,85,84,79,70,70,95,80,72,65,83,69,95,72,69,85,82,73,83,84,73,67,95,84,82,79,85,66,76,69,83,79,77,69,95,77,65,84,82,73,88,95,67,79,68,69,83,0,118,105,105,102,0,118,105,105,105,0,100,105,105,0,118,105,105,100,0,105,105,0,118,105,105,0,105,105,105,0,78,83,116,51,95,95,49,49,50,98,97,115,105,99,95,115,116,114,105,110,103,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,99,69,69,69,69,0,78,83,116,51,95,95,49,50,49,95,95,98,97,115,105,99,95,115,116,114,105,110,103,95,99,111,109,109,111,110,73,76,98,49,69,69,69,0,105,105,105,105,0,105,105,105,105,105,0,118,111,105,100,0,98,111,111,108,0,99,104,97,114,0,115,105,103,110,101,100,32,99,104,97,114,0,117,110,115,105,103,110,101,100,32,99,104,97,114,0,115,104,111,114,116,0,117,110,115,105,103,110,101,100,32,115,104,111,114,116,0,105,110,116,0,117,110,115,105,103,110,101,100,32,105,110,116,0,108,111,110,103,0,117,110,115,105,103,110,101,100,32,108,111,110,103,0,102,108,111,97,116,0,100,111,117,98,108,101,0,115,116,100,58,58,115,116,114,105,110,103,0,115,116,100,58,58,98,97,115,105,99,95,115,116,114,105,110,103,60,117,110,115,105,103,110,101,100,32,99,104,97,114,62,0,115,116,100,58,58,119,115,116,114,105,110,103,0,101,109,115,99,114,105,112,116,101,110,58,58,118,97,108,0,101,109,115,99,114,105,112,116,101,110,58,58,109,101,109,111,114,121,95,118,105,101,119,60,99,104,97,114,62,0,101,109,115,99,114,105,112,116,101,110,58,58,109,101,109,111,114,121,95,118,105,101,119,60,115,105,103,110,101,100,32,99,104,97,114,62,0,101,109,115,99,114,105,112,116,101,110,58,58,109,101,109,111,114,121,95,118,105,101,119,60,117,110,115,105,103,110,101,100,32,99,104,97,114,62,0,101,109,115,99,114,105,112,116,101,110,58,58,109,101,109,111,114,121,95,118,105,101,119,60,115,104,111,114,116,62,0,101,109,115,99,114,105,112,116,101,110,58,58,109,101,109,111,114,121,95,118,105,101,119,60,117,110,115,105,103,110,101,100,32,115,104,111,114,116,62,0,101,109,115,99,114,105,112,116,101,110,58,58,109,101,109,111,114,121,95,118,105,101,119,60,105,110,116,62,0,101,109,115,99,114,105,112,116,101,110,58,58,109,101,109,111,114,121,95,118,105,101,119,60,117,110,115,105,103,110,101,100,32,105,110,116,62,0,101,109,115,99,114,105,112,116,101,110,58,58,109,101,109,111,114,121,95,118,105,101,119,60,108,111,110,103,62,0,101,109,115,99,114,105,112,116,101,110,58,58,109,101,109,111,114,121,95,118,105,101,119,60,117,110,115,105,103,110,101,100,32,108,111,110,103,62,0,101,109,115,99,114,105,112,116,101,110,58,58,109,101,109,111,114,121,95,118,105,101,119,60,105,110,116,56,95,116,62,0,101,109,115,99,114,105,112,116,101,110,58,58,109,101,109,111,114,121,95,118,105,101,119,60,117,105,110,116,56,95,116,62,0,101,109,115,99,114,105,112,116,101,110,58,58,109,101,109,111,114,121,95,118,105,101,119,60,105,110,116,49,54,95,116,62,0,101,109,115,99,114,105,112,116,101,110,58,58,109,101,109,111,114,121,95,118,105,101,119,60,117,105,110,116,49,54,95,116,62,0,101,109,115,99,114,105,112,116,101,110,58,58,109,101,109,111,114,121,95,118,105,101,119,60,105,110,116,51,50,95,116,62,0,101,109,115,99,114,105,112,116,101,110,58,58,109,101,109,111,114,121,95,118,105,101,119,60,117,105,110,116,51,50,95,116,62,0,101,109,115,99,114,105,112,116,101,110,58,58,109,101,109,111,114,121,95,118,105,101,119,60,102,108,111,97,116,62,0,101,109,115,99,114,105,112,116,101,110,58,58,109,101,109,111,114,121,95,118,105,101,119,60,100,111,117,98,108,101,62,0,101,109,115,99,114,105,112,116,101,110,58,58,109,101,109,111,114,121,95,118,105,101,119,60,108,111,110,103,32,100,111,117,98,108,101,62,0,78,49,48,101,109,115,99,114,105,112,116,101,110,49,49,109,101,109,111,114,121,95,118,105,101,119,73,101,69,69,0,78,49,48,101,109,115,99,114,105,112,116,101,110,49,49,109,101,109,111,114,121,95,118,105,101,119,73,100,69,69,0,78,49,48,101,109,115,99,114,105,112,116,101,110,49,49,109,101,109,111,114,121,95,118,105,101,119,73,102,69,69,0,78,49,48,101,109,115,99,114,105,112,116,101,110,49,49,109,101,109,111,114,121,95,118,105,101,119,73,109,69,69,0,78,49,48,101,109,115,99,114,105,112,116,101,110,49,49,109,101,109,111,114,121,95,118,105,101,119,73,108,69,69,0,78,49,48,101,109,115,99,114,105,112,116,101,110,49,49,109,101,109,111,114,121,95,118,105,101,119,73,106,69,69,0,78,49,48,101,109,115,99,114,105,112,116,101,110,49,49,109,101,109,111,114,121,95,118,105,101,119,73,105,69,69,0,78,49,48,101,109,115,99,114,105,112,116,101,110,49,49,109,101,109,111,114,121,95,118,105,101,119,73,116,69,69,0,78,49,48,101,109,115,99,114,105,112,116,101,110,49,49,109,101,109,111,114,121,95,118,105,101,119,73,115,69,69,0,78,49,48,101,109,115,99,114,105,112,116,101,110,49,49,109,101,109,111,114,121,95,118,105,101,119,73,104,69,69,0,78,49,48,101,109,115,99,114,105,112,116,101,110,49,49,109,101,109,111,114,121,95,118,105,101,119,73,97,69,69,0,78,49,48,101,109,115,99,114,105,112,116,101,110,49,49,109,101,109,111,114,121,95,118,105,101,119,73,99,69,69,0,78,49,48,101,109,115,99,114,105,112,116,101,110,51,118,97,108,69,0,78,83,116,51,95,95,49,49,50,98,97,115,105,99,95,115,116,114,105,110,103,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,119,69,69,69,69,0,78,83,116,51,95,95,49,49,50,98,97,115,105,99,95,115,116,114,105,110,103,73,104,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,104,69,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,104,69,69,69,69,0,83,116,57,98,97,100,95,97,108,108,111,99,0,83,116,57,101,120,99,101,112,116,105,111,110,0,83,116,57,116,121,112,101,95,105,110,102,111,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,115,104,105,109,95,116,121,112,101,95,105,110,102,111,69,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,51,95,95,102,117,110,100,97,109,101,110,116,97,108,95,116,121,112,101,95,105,110,102,111,69,0,118,0,98,0,99,0,104,0,97,0,115,0,116,0,105,0,106,0,108,0,109,0,102,0,100,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,115,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,49,95,95,118,109,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,33,34,118,101,99,116,111,114,32,108,101,110,103,116,104,95,101,114,114,111,114,34,0,47,85,115,101,114,115,47,106,101,114,111,109,101,101,116,105,101,110,110,101,47,119,111,114,107,47,101,109,115,100,107,95,112,111,114,116,97,98,108,101,47,101,109,115,99,114,105,112,116,101,110,47,49,46,51,53,46,48,47,115,121,115,116,101,109,47,105,110,99,108,117,100,101,47,108,105,98,99,120,120,47,118,101,99,116,111,114,0,95,95,116,104,114,111,119,95,108,101,110,103,116,104,95,101,114,114,111,114,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,33,34,98,97,115,105,99,95,115,116,114,105,110,103,32,108,101,110,103,116,104,95,101,114,114,111,114,34,0,47,85,115,101,114,115,47,106,101,114,111,109,101,101,116,105,101,110,110,101,47,119,111,114,107,47,101,109,115,100,107,95,112,111,114,116,97,98,108,101,47,101,109,115,99,114,105,112,116,101,110,47,49,46,51,53,46,48,47,115,121,115,116,101,109,47,105,110,99,108,117,100,101,47,108,105,98,99,120,120,47,115,116,114,105,110,103,0,84,33,34,25,13,1,2,3,17,75,28,12,16,4,11,29,18,30,39,104,110,111,112,113,98,32,5,6,15,19,20,21,26,8,22,7,40,36,23,24,9,10,14,27,31,37,35,131,130,125,38,42,43,60,61,62,63,67,71,74,77,88,89,90,91,92,93,94,95,96,97,99,100,101,102,103,105,106,107,108,114,115,116,121,122,123,124,0,73,108,108,101,103,97,108,32,98,121,116,101,32,115,101,113,117,101,110,99,101,0,68,111,109,97,105,110,32,101,114,114,111,114,0,82,101,115,117,108,116,32,110,111,116,32,114,101,112,114,101,115,101,110,116,97,98,108,101,0,78,111,116,32,97,32,116,116,121,0,80,101,114,109,105,115,115,105,111,110,32,100,101,110,105,101,100,0,79,112,101,114,97,116,105,111,110,32,110,111,116,32,112,101,114,109,105,116,116,101,100,0,78,111,32,115,117,99,104,32,102,105,108,101,32,111,114,32,100,105,114,101,99,116,111,114,121,0,78,111,32,115,117,99,104,32,112,114,111,99,101,115,115,0,70,105,108,101,32,101,120,105,115,116,115,0,86,97,108,117,101,32,116,111,111,32,108,97,114,103,101,32,102,111,114,32,100,97,116,97,32,116,121,112,101,0,78,111,32,115,112,97,99,101,32,108,101,102,116,32,111,110,32,100,101,118,105,99,101,0,79,117,116,32,111,102,32,109,101,109,111,114,121,0,82,101,115,111,117,114,99,101,32,98,117,115,121,0,73,110,116,101,114,114,117,112,116,101,100,32,115,121,115,116,101,109,32,99,97,108,108,0,82,101,115,111,117,114,99,101,32,116,101,109,112,111,114,97,114,105,108,121,32,117,110,97,118,97,105,108,97,98,108,101,0,73,110,118,97,108,105,100,32,115,101,101,107,0,67,114,111,115,115,45,100,101,118,105,99,101,32,108,105,110,107,0,82,101,97,100,45,111,110,108,121,32,102,105,108,101,32,115,121,115,116,101,109,0,68,105,114,101,99,116,111,114,121,32,110,111,116,32,101,109,112,116,121,0,67,111,110,110,101,99,116,105,111,110,32,114,101,115,101,116,32,98,121,32,112,101,101,114,0,79,112,101,114,97,116,105,111,110,32,116,105,109,101,100,32,111,117,116,0,67,111,110,110,101,99,116,105,111,110,32,114,101,102,117,115,101,100,0,72,111,115,116,32,105,115,32,100,111,119,110,0,72,111,115,116,32,105,115,32,117,110,114,101,97,99,104,97,98,108,101,0,65,100,100,114,101,115,115,32,105,110,32,117,115,101,0,66,114,111,107,101,110,32,112,105,112,101,0,73,47,79,32,101,114,114,111,114,0,78,111,32,115,117,99,104,32,100,101,118,105,99,101,32,111,114,32,97,100,100,114,101,115,115,0,66,108,111,99,107,32,100,101,118,105,99,101,32,114,101,113,117,105,114,101,100,0,78,111,32,115,117,99,104,32,100,101,118,105,99,101,0,78,111,116,32,97,32,100,105,114,101,99,116,111,114,121,0,73,115,32,97,32,100,105,114,101,99,116,111,114,121,0,84,101,120,116,32,102,105,108,101,32,98,117,115,121,0,69,120,101,99,32,102,111,114,109,97,116,32,101,114,114,111,114,0,73,110,118,97,108,105,100,32,97,114,103,117,109,101,110,116,0,65,114,103,117,109,101,110,116,32,108,105,115,116,32,116,111,111,32,108,111,110,103,0,83,121,109,98,111,108,105,99,32,108,105,110,107,32,108,111,111,112,0,70,105,108,101,110,97,109,101,32,116,111,111,32,108,111,110,103,0,84,111,111,32,109,97,110,121,32,111,112,101,110,32,102,105,108,101,115,32,105,110,32,115,121,115,116,101,109,0,78,111,32,102,105,108,101,32,100,101,115,99,114,105,112,116,111,114,115,32,97,118,97,105,108,97,98,108,101,0,66,97,100,32,102,105,108,101,32,100,101,115,99,114,105,112,116,111,114,0,78,111,32,99,104,105,108,100,32,112,114,111,99,101,115,115,0,66,97,100,32,97,100,100,114,101,115,115,0,70,105,108,101,32,116,111,111,32,108,97,114,103,101,0,84,111,111,32,109,97,110,121,32,108,105,110,107,115,0,78,111,32,108,111,99,107,115,32,97,118,97,105,108,97,98,108,101,0,82,101,115,111,117,114,99,101,32,100,101,97,100,108,111,99,107,32,119,111,117,108,100,32,111,99,99,117,114,0,83,116,97,116,101,32,110,111,116,32,114,101,99,111,118,101,114,97,98,108,101,0,80,114,101,118,105,111,117,115,32,111,119,110,101,114,32,100,105,101,100,0,79,112,101,114,97,116,105,111,110,32,99,97,110,99,101,108,101,100,0,70,117,110,99,116,105,111,110,32,110,111,116,32,105,109,112,108,101,109,101,110,116,101,100,0,78,111,32,109,101,115,115,97,103,101,32,111,102,32,100,101,115,105,114,101,100,32,116,121,112,101,0,73,100,101,110,116,105,102,105,101,114,32,114,101,109,111,118,101,100,0,68,101,118,105,99,101,32,110,111,116,32,97,32,115,116,114,101,97,109,0,78,111,32,100,97,116,97,32,97,118,97,105,108,97,98,108,101,0,68,101,118,105,99,101,32,116,105,109,101,111,117,116,0,79,117,116,32,111,102,32,115,116,114,101,97,109,115,32,114,101,115,111,117,114,99,101,115,0,76,105,110,107,32,104,97,115,32,98,101,101,110,32,115,101,118,101,114,101,100,0,80,114,111,116,111,99,111,108,32,101,114,114,111,114,0,66,97,100,32,109,101,115,115,97,103,101,0,70,105,108,101,32,100,101,115,99,114,105,112,116,111,114,32,105,110,32,98,97,100,32,115,116,97,116,101,0,78,111,116,32,97,32,115,111,99,107,101,116,0,68,101,115,116,105,110,97,116,105,111,110,32,97,100,100,114,101,115,115,32,114,101,113,117,105,114,101,100,0,77,101,115,115,97,103,101,32,116,111,111,32,108,97,114,103,101,0,80,114,111,116,111,99,111,108,32,119,114,111,110,103,32,116,121,112,101,32,102,111,114,32,115,111,99,107,101,116,0,80,114,111,116,111,99,111,108,32,110,111,116,32,97,118,97,105,108,97,98,108,101,0,80,114,111,116,111,99,111,108,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,83,111,99,107,101,116,32,116,121,112,101,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,78,111,116,32,115,117,112,112,111,114,116,101,100,0,80,114,111,116,111,99,111,108,32,102,97,109,105,108,121,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,65,100,100,114,101,115,115,32,102,97,109,105,108,121,32,110,111,116,32,115,117,112,112,111,114,116,101,100,32,98,121,32,112,114,111,116,111,99,111,108,0,65,100,100,114,101,115,115,32,110,111,116,32,97,118,97,105,108,97,98,108,101,0,78,101,116,119,111,114,107,32,105,115,32,100,111,119,110,0,78,101,116,119,111,114,107,32,117,110,114,101,97,99,104,97,98,108,101,0,67,111,110,110,101,99,116,105,111,110,32,114,101,115,101,116,32,98,121,32,110,101,116,119,111,114,107,0,67,111,110,110,101,99,116,105,111,110,32,97,98,111,114,116,101,100,0,78,111,32,98,117,102,102,101,114,32,115,112,97,99,101,32,97,118,97,105,108,97,98,108,101,0,83,111,99,107,101,116,32,105,115,32,99,111,110,110,101,99,116,101,100,0,83,111,99,107,101,116,32,110,111,116,32,99,111,110,110,101,99,116,101,100,0,67,97,110,110,111,116,32,115,101,110,100,32,97,102,116,101,114,32,115,111,99,107,101,116,32,115,104,117,116,100,111,119,110,0,79,112,101,114,97,116,105,111,110,32,97,108,114,101,97,100,121,32,105,110,32,112,114,111,103,114,101,115,115,0,79,112,101,114,97,116,105,111,110,32,105,110,32,112,114,111,103,114,101,115,115,0,83,116,97,108,101,32,102,105,108,101,32,104,97,110,100,108,101,0,82,101,109,111,116,101,32,73,47,79,32,101,114,114,111,114,0,81,117,111,116,97,32,101,120,99,101,101,100,101,100,0,78,111,32,109,101,100,105,117,109,32,102,111,117,110,100,0,87,114,111,110,103,32,109,101,100,105,117,109,32,116,121,112,101,0,78,111,32,101,114,114,111,114,32,105,110,102,111,114,109,97,116,105,111,110,0,0,105,110,102,105,110,105,116,121,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,0,1,2,3,4,5,6,7,8,9,255,255,255,255,255,255,255,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,255,255,255,255,255,255,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,0,1,2,4,7,3,6,5,0,114,119,97],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE+10240);allocate([17,0,10,0,17,17,17,0,0,0,0,5,0,0,0,0,0,0,9,0,0,0,0,11,0,0,0,0,0,0,0,0,17,0,15,10,17,17,17,3,10,7,0,1,19,9,11,11,0,0,9,6,11,0,0,11,0,6,17,0,0,0,17,17,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,0,17,0,10,10,17,17,17,0,10,0,0,2,0,9,11,0,0,0,9,0,11,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,12,0,0,0,0,9,12,0,0,0,0,0,12,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,13,0,0,0,4,13,0,0,0,0,9,14,0,0,0,0,0,14,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,15,0,0,0,0,15,0,0,0,0,9,16,0,0,0,0,0,16,0,0,16,0,0,18,0,0,0,18,18,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,18,0,0,0,18,18,18,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,0,10,0,0,0,0,9,11,0,0,0,0,0,11,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,12,0,0,0,0,9,12,0,0,0,0,0,12,0,0,12,0,0,48,49,50,51,52,53,54,55,56,57,65,66,67,68,69,70,45,43,32,32,32,48,88,48,120,0,40,110,117,108,108,41,0,45,48,88,43,48,88,32,48,88,45,48,120,43,48,120,32,48,120,0,105,110,102,0,73,78,70,0,110,97,110,0,78,65,78,0,46,0],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE+15945);var tempDoublePtr=Runtime.alignMemory(allocate(12,"i8",ALLOC_STATIC),8);assert(tempDoublePtr%8==0);function copyTempFloat(ptr){HEAP8[tempDoublePtr]=HEAP8[ptr];HEAP8[tempDoublePtr+1]=HEAP8[ptr+1];HEAP8[tempDoublePtr+2]=HEAP8[ptr+2];HEAP8[tempDoublePtr+3]=HEAP8[ptr+3]}function copyTempDouble(ptr){HEAP8[tempDoublePtr]=HEAP8[ptr];HEAP8[tempDoublePtr+1]=HEAP8[ptr+1];HEAP8[tempDoublePtr+2]=HEAP8[ptr+2];HEAP8[tempDoublePtr+3]=HEAP8[ptr+3];HEAP8[tempDoublePtr+4]=HEAP8[ptr+4];HEAP8[tempDoublePtr+5]=HEAP8[ptr+5];HEAP8[tempDoublePtr+6]=HEAP8[ptr+6];HEAP8[tempDoublePtr+7]=HEAP8[ptr+7]}function _atexit(func,arg){__ATEXIT__.unshift({func:func,arg:arg})}function ___cxa_atexit(){return _atexit.apply(null,arguments)}Module["_i64Subtract"]=_i64Subtract;function ___assert_fail(condition,filename,line,func){ABORT=true;throw"Assertion failed: "+Pointer_stringify(condition)+", at: "+[filename?Pointer_stringify(filename):"unknown filename",line,func?Pointer_stringify(func):"unknown function"]+" at "+stackTrace()}function embind_init_charCodes(){var codes=new Array(256);for(var i=0;i<256;++i){codes[i]=String.fromCharCode(i)}embind_charCodes=codes}var embind_charCodes=undefined;function readLatin1String(ptr){var ret="";var c=ptr;while(HEAPU8[c]){ret+=embind_charCodes[HEAPU8[c++]]}return ret}var awaitingDependencies={};var registeredTypes={};var typeDependencies={};var char_0=48;var char_9=57;function makeLegalFunctionName(name){if(undefined===name){return"_unknown"}name=name.replace(/[^a-zA-Z0-9_]/g,"$");var f=name.charCodeAt(0);if(f>=char_0&&f<=char_9){return"_"+name}else{return name}}function createNamedFunction(name,body){name=makeLegalFunctionName(name);return(new Function("body","return function "+name+"() {\n"+'    "use strict";'+"    return body.apply(this, arguments);\n"+"};\n"))(body)}function extendError(baseErrorType,errorName){var errorClass=createNamedFunction(errorName,(function(message){this.name=errorName;this.message=message;var stack=(new Error(message)).stack;if(stack!==undefined){this.stack=this.toString()+"\n"+stack.replace(/^Error(:[^\n]*)?\n/,"")}}));errorClass.prototype=Object.create(baseErrorType.prototype);errorClass.prototype.constructor=errorClass;errorClass.prototype.toString=(function(){if(this.message===undefined){return this.name}else{return this.name+": "+this.message}});return errorClass}var BindingError=undefined;function throwBindingError(message){throw new BindingError(message)}var InternalError=undefined;function throwInternalError(message){throw new InternalError(message)}function whenDependentTypesAreResolved(myTypes,dependentTypes,getTypeConverters){myTypes.forEach((function(type){typeDependencies[type]=dependentTypes}));function onComplete(typeConverters){var myTypeConverters=getTypeConverters(typeConverters);if(myTypeConverters.length!==myTypes.length){throwInternalError("Mismatched type converter count")}for(var i=0;i<myTypes.length;++i){registerType(myTypes[i],myTypeConverters[i])}}var typeConverters=new Array(dependentTypes.length);var unregisteredTypes=[];var registered=0;dependentTypes.forEach((function(dt,i){if(registeredTypes.hasOwnProperty(dt)){typeConverters[i]=registeredTypes[dt]}else{unregisteredTypes.push(dt);if(!awaitingDependencies.hasOwnProperty(dt)){awaitingDependencies[dt]=[]}awaitingDependencies[dt].push((function(){typeConverters[i]=registeredTypes[dt];++registered;if(registered===unregisteredTypes.length){onComplete(typeConverters)}}))}}));if(0===unregisteredTypes.length){onComplete(typeConverters)}}function registerType(rawType,registeredInstance,options){options=options||{};if(!("argPackAdvance"in registeredInstance)){throw new TypeError("registerType registeredInstance requires argPackAdvance")}var name=registeredInstance.name;if(!rawType){throwBindingError('type "'+name+'" must have a positive integer typeid pointer')}if(registeredTypes.hasOwnProperty(rawType)){if(options.ignoreDuplicateRegistrations){return}else{throwBindingError("Cannot register type '"+name+"' twice")}}registeredTypes[rawType]=registeredInstance;delete typeDependencies[rawType];if(awaitingDependencies.hasOwnProperty(rawType)){var callbacks=awaitingDependencies[rawType];delete awaitingDependencies[rawType];callbacks.forEach((function(cb){cb()}))}}function __embind_register_void(rawType,name){name=readLatin1String(name);registerType(rawType,{isVoid:true,name:name,"argPackAdvance":0,"fromWireType":(function(){return undefined}),"toWireType":(function(destructors,o){return undefined})})}function __ZSt18uncaught_exceptionv(){return!!__ZSt18uncaught_exceptionv.uncaught_exception}var EXCEPTIONS={last:0,caught:[],infos:{},deAdjust:(function(adjusted){if(!adjusted||EXCEPTIONS.infos[adjusted])return adjusted;for(var ptr in EXCEPTIONS.infos){var info=EXCEPTIONS.infos[ptr];if(info.adjusted===adjusted){return ptr}}return adjusted}),addRef:(function(ptr){if(!ptr)return;var info=EXCEPTIONS.infos[ptr];info.refcount++}),decRef:(function(ptr){if(!ptr)return;var info=EXCEPTIONS.infos[ptr];assert(info.refcount>0);info.refcount--;if(info.refcount===0){if(info.destructor){Runtime.dynCall("vi",info.destructor,[ptr])}delete EXCEPTIONS.infos[ptr];___cxa_free_exception(ptr)}}),clearRef:(function(ptr){if(!ptr)return;var info=EXCEPTIONS.infos[ptr];info.refcount=0})};function ___resumeException(ptr){if(!EXCEPTIONS.last){EXCEPTIONS.last=ptr}EXCEPTIONS.clearRef(EXCEPTIONS.deAdjust(ptr));throw ptr+" - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch."}function ___cxa_find_matching_catch(){var thrown=EXCEPTIONS.last;if(!thrown){return(asm["setTempRet0"](0),0)|0}var info=EXCEPTIONS.infos[thrown];var throwntype=info.type;if(!throwntype){return(asm["setTempRet0"](0),thrown)|0}var typeArray=Array.prototype.slice.call(arguments);var pointer=Module["___cxa_is_pointer_type"](throwntype);if(!___cxa_find_matching_catch.buffer)___cxa_find_matching_catch.buffer=_malloc(4);HEAP32[___cxa_find_matching_catch.buffer>>2]=thrown;thrown=___cxa_find_matching_catch.buffer;for(var i=0;i<typeArray.length;i++){if(typeArray[i]&&Module["___cxa_can_catch"](typeArray[i],throwntype,thrown)){thrown=HEAP32[thrown>>2];info.adjusted=thrown;return(asm["setTempRet0"](typeArray[i]),thrown)|0}}thrown=HEAP32[thrown>>2];return(asm["setTempRet0"](throwntype),thrown)|0}function ___cxa_throw(ptr,type,destructor){EXCEPTIONS.infos[ptr]={ptr:ptr,adjusted:ptr,type:type,destructor:destructor,refcount:0};EXCEPTIONS.last=ptr;if(!("uncaught_exception"in __ZSt18uncaught_exceptionv)){__ZSt18uncaught_exceptionv.uncaught_exception=1}else{__ZSt18uncaught_exceptionv.uncaught_exception++}throw ptr+" - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch."}Module["_memset"]=_memset;var _BDtoILow=true;function getShiftFromSize(size){switch(size){case 1:return 0;case 2:return 1;case 4:return 2;case 8:return 3;default:throw new TypeError("Unknown type size: "+size)}}function __embind_register_bool(rawType,name,size,trueValue,falseValue){var shift=getShiftFromSize(size);name=readLatin1String(name);registerType(rawType,{name:name,"fromWireType":(function(wt){return!!wt}),"toWireType":(function(destructors,o){return o?trueValue:falseValue}),"argPackAdvance":8,"readValueFromPointer":(function(pointer){var heap;if(size===1){heap=HEAP8}else if(size===2){heap=HEAP16}else if(size===4){heap=HEAP32}else{throw new TypeError("Unknown boolean type size: "+name)}return this["fromWireType"](heap[pointer>>shift])}),destructorFunction:null})}Module["_bitshift64Shl"]=_bitshift64Shl;function _abort(){Module["abort"]()}function _free(){}Module["_free"]=_free;function _malloc(bytes){var ptr=Runtime.dynamicAlloc(bytes+8);return ptr+8&4294967288}Module["_malloc"]=_malloc;function simpleReadValueFromPointer(pointer){return this["fromWireType"](HEAPU32[pointer>>2])}function __embind_register_std_string(rawType,name){name=readLatin1String(name);registerType(rawType,{name:name,"fromWireType":(function(value){var length=HEAPU32[value>>2];var a=new Array(length);for(var i=0;i<length;++i){a[i]=String.fromCharCode(HEAPU8[value+4+i])}_free(value);return a.join("")}),"toWireType":(function(destructors,value){if(value instanceof ArrayBuffer){value=new Uint8Array(value)}function getTAElement(ta,index){return ta[index]}function getStringElement(string,index){return string.charCodeAt(index)}var getElement;if(value instanceof Uint8Array){getElement=getTAElement}else if(value instanceof Int8Array){getElement=getTAElement}else if(typeof value==="string"){getElement=getStringElement}else{throwBindingError("Cannot pass non-string to std::string")}var length=value.length;var ptr=_malloc(4+length);HEAPU32[ptr>>2]=length;for(var i=0;i<length;++i){var charCode=getElement(value,i);if(charCode>255){_free(ptr);throwBindingError("String has UTF-16 code units that do not fit in 8 bits")}HEAPU8[ptr+4+i]=charCode}if(destructors!==null){destructors.push(_free,ptr)}return ptr}),"argPackAdvance":8,"readValueFromPointer":simpleReadValueFromPointer,destructorFunction:(function(ptr){_free(ptr)})})}function __embind_register_std_wstring(rawType,charSize,name){name=readLatin1String(name);var getHeap,shift;if(charSize===2){getHeap=(function(){return HEAPU16});shift=1}else if(charSize===4){getHeap=(function(){return HEAPU32});shift=2}registerType(rawType,{name:name,"fromWireType":(function(value){var HEAP=getHeap();var length=HEAPU32[value>>2];var a=new Array(length);var start=value+4>>shift;for(var i=0;i<length;++i){a[i]=String.fromCharCode(HEAP[start+i])}_free(value);return a.join("")}),"toWireType":(function(destructors,value){var HEAP=getHeap();var length=value.length;var ptr=_malloc(4+length*charSize);HEAPU32[ptr>>2]=length;var start=ptr+4>>shift;for(var i=0;i<length;++i){HEAP[start+i]=value.charCodeAt(i)}if(destructors!==null){destructors.push(_free,ptr)}return ptr}),"argPackAdvance":8,"readValueFromPointer":simpleReadValueFromPointer,destructorFunction:(function(ptr){_free(ptr)})})}function ___lock(){}function ___unlock(){}var _emscripten_asm_const_int=true;Module["_i64Add"]=_i64Add;var _fabs=Math_abs;var _sqrt=Math_sqrt;function _embind_repr(v){if(v===null){return"null"}var t=typeof v;if(t==="object"||t==="array"||t==="function"){return v.toString()}else{return""+v}}function integerReadValueFromPointer(name,shift,signed){switch(shift){case 0:return signed?function readS8FromPointer(pointer){return HEAP8[pointer]}:function readU8FromPointer(pointer){return HEAPU8[pointer]};case 1:return signed?function readS16FromPointer(pointer){return HEAP16[pointer>>1]}:function readU16FromPointer(pointer){return HEAPU16[pointer>>1]};case 2:return signed?function readS32FromPointer(pointer){return HEAP32[pointer>>2]}:function readU32FromPointer(pointer){return HEAPU32[pointer>>2]};default:throw new TypeError("Unknown integer type: "+name)}}function __embind_register_integer(primitiveType,name,size,minRange,maxRange){name=readLatin1String(name);if(maxRange===-1){maxRange=4294967295}var shift=getShiftFromSize(size);var fromWireType=(function(value){return value});if(minRange===0){var bitshift=32-8*size;fromWireType=(function(value){return value<<bitshift>>>bitshift})}registerType(primitiveType,{name:name,"fromWireType":fromWireType,"toWireType":(function(destructors,value){if(typeof value!=="number"&&typeof value!=="boolean"){throw new TypeError('Cannot convert "'+_embind_repr(value)+'" to '+this.name)}if(value<minRange||value>maxRange){throw new TypeError('Passing a number "'+_embind_repr(value)+'" from JS side to C/C++ side to an argument of type "'+name+'", which is outside the valid range ['+minRange+", "+maxRange+"]!")}return value|0}),"argPackAdvance":8,"readValueFromPointer":integerReadValueFromPointer(name,shift,minRange!==0),destructorFunction:null})}var emval_free_list=[];var emval_handle_array=[{},{value:undefined},{value:null},{value:true},{value:false}];function __emval_decref(handle){if(handle>4&&0===--emval_handle_array[handle].refcount){emval_handle_array[handle]=undefined;emval_free_list.push(handle)}}function count_emval_handles(){var count=0;for(var i=5;i<emval_handle_array.length;++i){if(emval_handle_array[i]!==undefined){++count}}return count}function get_first_emval(){for(var i=5;i<emval_handle_array.length;++i){if(emval_handle_array[i]!==undefined){return emval_handle_array[i]}}return null}function init_emval(){Module["count_emval_handles"]=count_emval_handles;Module["get_first_emval"]=get_first_emval}function __emval_register(value){switch(value){case undefined:{return 1};case null:{return 2};case true:{return 3};case false:{return 4};default:{var handle=emval_free_list.length?emval_free_list.pop():emval_handle_array.length;emval_handle_array[handle]={refcount:1,value:value};return handle}}}function __embind_register_emval(rawType,name){name=readLatin1String(name);registerType(rawType,{name:name,"fromWireType":(function(handle){var rv=emval_handle_array[handle].value;__emval_decref(handle);return rv}),"toWireType":(function(destructors,value){return __emval_register(value)}),"argPackAdvance":8,"readValueFromPointer":simpleReadValueFromPointer,destructorFunction:null})}function ___cxa_allocate_exception(size){return _malloc(size)}var _sin=Math_sin;function ___setErrNo(value){if(Module["___errno_location"])HEAP32[Module["___errno_location"]()>>2]=value;return value}var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};function _sysconf(name){switch(name){case 30:return PAGE_SIZE;case 85:return totalMemory/PAGE_SIZE;case 132:case 133:case 12:case 137:case 138:case 15:case 235:case 16:case 17:case 18:case 19:case 20:case 149:case 13:case 10:case 236:case 153:case 9:case 21:case 22:case 159:case 154:case 14:case 77:case 78:case 139:case 80:case 81:case 82:case 68:case 67:case 164:case 11:case 29:case 47:case 48:case 95:case 52:case 51:case 46:return 200809;case 79:return 0;case 27:case 246:case 127:case 128:case 23:case 24:case 160:case 161:case 181:case 182:case 242:case 183:case 184:case 243:case 244:case 245:case 165:case 178:case 179:case 49:case 50:case 168:case 169:case 175:case 170:case 171:case 172:case 97:case 76:case 32:case 173:case 35:return-1;case 176:case 177:case 7:case 155:case 8:case 157:case 125:case 126:case 92:case 93:case 129:case 130:case 131:case 94:case 91:return 1;case 74:case 60:case 69:case 70:case 4:return 1024;case 31:case 42:case 72:return 32;case 87:case 26:case 33:return 2147483647;case 34:case 1:return 47839;case 38:case 36:return 99;case 43:case 37:return 2048;case 0:return 2097152;case 3:return 65536;case 28:return 32768;case 44:return 32767;case 75:return 16384;case 39:return 1e3;case 89:return 700;case 71:return 256;case 40:return 255;case 2:return 100;case 180:return 64;case 25:return 20;case 5:return 16;case 6:return 6;case 73:return 4;case 84:{if(typeof navigator==="object")return navigator["hardwareConcurrency"]||1;return 1}}___setErrNo(ERRNO_CODES.EINVAL);return-1}Module["_bitshift64Lshr"]=_bitshift64Lshr;function __exit(status){Module["exit"](status)}function _exit(status){__exit(status)}var _llvm_ctlz_i32=true;function floatReadValueFromPointer(name,shift){switch(shift){case 2:return(function(pointer){return this["fromWireType"](HEAPF32[pointer>>2])});case 3:return(function(pointer){return this["fromWireType"](HEAPF64[pointer>>3])});default:throw new TypeError("Unknown float type: "+name)}}function __embind_register_float(rawType,name,size){var shift=getShiftFromSize(size);name=readLatin1String(name);registerType(rawType,{name:name,"fromWireType":(function(value){return value}),"toWireType":(function(destructors,value){if(typeof value!=="number"&&typeof value!=="boolean"){throw new TypeError('Cannot convert "'+_embind_repr(value)+'" to '+this.name)}return value}),"argPackAdvance":8,"readValueFromPointer":floatReadValueFromPointer(name,shift),destructorFunction:null})}var _BDtoIHigh=true;function _pthread_cleanup_push(routine,arg){__ATEXIT__.push((function(){Runtime.dynCall("vi",routine,[arg])}));_pthread_cleanup_push.level=__ATEXIT__.length}function new_(constructor,argumentList){if(!(constructor instanceof Function)){throw new TypeError("new_ called with constructor type "+typeof constructor+" which is not a function")}var dummy=createNamedFunction(constructor.name||"unknownFunctionName",(function(){}));dummy.prototype=constructor.prototype;var obj=new dummy;var r=constructor.apply(obj,argumentList);return r instanceof Object?r:obj}function runDestructors(destructors){while(destructors.length){var ptr=destructors.pop();var del=destructors.pop();del(ptr)}}function craftInvokerFunction(humanName,argTypes,classType,cppInvokerFunc,cppTargetFunc){var argCount=argTypes.length;if(argCount<2){throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!")}var isClassMethodFunc=argTypes[1]!==null&&classType!==null;var argsList="";var argsListWired="";for(var i=0;i<argCount-2;++i){argsList+=(i!==0?", ":"")+"arg"+i;argsListWired+=(i!==0?", ":"")+"arg"+i+"Wired"}var invokerFnBody="return function "+makeLegalFunctionName(humanName)+"("+argsList+") {\n"+"if (arguments.length !== "+(argCount-2)+") {\n"+"throwBindingError('function "+humanName+" called with ' + arguments.length + ' arguments, expected "+(argCount-2)+" args!');\n"+"}\n";var needsDestructorStack=false;for(var i=1;i<argTypes.length;++i){if(argTypes[i]!==null&&argTypes[i].destructorFunction===undefined){needsDestructorStack=true;break}}if(needsDestructorStack){invokerFnBody+="var destructors = [];\n"}var dtorStack=needsDestructorStack?"destructors":"null";var args1=["throwBindingError","invoker","fn","runDestructors","retType","classParam"];var args2=[throwBindingError,cppInvokerFunc,cppTargetFunc,runDestructors,argTypes[0],argTypes[1]];if(isClassMethodFunc){invokerFnBody+="var thisWired = classParam.toWireType("+dtorStack+", this);\n"}for(var i=0;i<argCount-2;++i){invokerFnBody+="var arg"+i+"Wired = argType"+i+".toWireType("+dtorStack+", arg"+i+"); // "+argTypes[i+2].name+"\n";args1.push("argType"+i);args2.push(argTypes[i+2])}if(isClassMethodFunc){argsListWired="thisWired"+(argsListWired.length>0?", ":"")+argsListWired}var returns=argTypes[0].name!=="void";invokerFnBody+=(returns?"var rv = ":"")+"invoker(fn"+(argsListWired.length>0?", ":"")+argsListWired+");\n";if(needsDestructorStack){invokerFnBody+="runDestructors(destructors);\n"}else{for(var i=isClassMethodFunc?1:2;i<argTypes.length;++i){var paramName=i===1?"thisWired":"arg"+(i-2)+"Wired";if(argTypes[i].destructorFunction!==null){invokerFnBody+=paramName+"_dtor("+paramName+"); // "+argTypes[i].name+"\n";args1.push(paramName+"_dtor");args2.push(argTypes[i].destructorFunction)}}}if(returns){invokerFnBody+="var ret = retType.fromWireType(rv);\n"+"return ret;\n"}else{}invokerFnBody+="}\n";args1.push(invokerFnBody);var invokerFunction=new_(Function,args1).apply(null,args2);return invokerFunction}function ensureOverloadTable(proto,methodName,humanName){if(undefined===proto[methodName].overloadTable){var prevFunc=proto[methodName];proto[methodName]=(function(){if(!proto[methodName].overloadTable.hasOwnProperty(arguments.length)){throwBindingError("Function '"+humanName+"' called with an invalid number of arguments ("+arguments.length+") - expects one of ("+proto[methodName].overloadTable+")!")}return proto[methodName].overloadTable[arguments.length].apply(this,arguments)});proto[methodName].overloadTable=[];proto[methodName].overloadTable[prevFunc.argCount]=prevFunc}}function exposePublicSymbol(name,value,numArguments){if(Module.hasOwnProperty(name)){if(undefined===numArguments||undefined!==Module[name].overloadTable&&undefined!==Module[name].overloadTable[numArguments]){throwBindingError("Cannot register public name '"+name+"' twice")}ensureOverloadTable(Module,name,name);if(Module.hasOwnProperty(numArguments)){throwBindingError("Cannot register multiple overloads of a function with the same number of arguments ("+numArguments+")!")}Module[name].overloadTable[numArguments]=value}else{Module[name]=value;if(undefined!==numArguments){Module[name].numArguments=numArguments}}}function heap32VectorToArray(count,firstElement){var array=[];for(var i=0;i<count;i++){array.push(HEAP32[(firstElement>>2)+i])}return array}function replacePublicSymbol(name,value,numArguments){if(!Module.hasOwnProperty(name)){throwInternalError("Replacing nonexistant public symbol")}if(undefined!==Module[name].overloadTable&&undefined!==numArguments){Module[name].overloadTable[numArguments]=value}else{Module[name]=value}}function requireFunction(signature,rawFunction){signature=readLatin1String(signature);function makeDynCaller(dynCall){var args=[];for(var i=1;i<signature.length;++i){args.push("a"+i)}var name="dynCall_"+signature+"_"+rawFunction;var body="return function "+name+"("+args.join(", ")+") {\n";body+="    return dynCall(rawFunction"+(args.length?", ":"")+args.join(", ")+");\n";body+="};\n";return(new Function("dynCall","rawFunction",body))(dynCall,rawFunction)}var fp;if(Module["FUNCTION_TABLE_"+signature]!==undefined){fp=Module["FUNCTION_TABLE_"+signature][rawFunction]}else if(typeof FUNCTION_TABLE!=="undefined"){fp=FUNCTION_TABLE[rawFunction]}else{var dc=asm["dynCall_"+signature];if(dc===undefined){dc=asm["dynCall_"+signature.replace(/f/g,"d")];if(dc===undefined){throwBindingError("No dynCall invoker for signature: "+signature)}}fp=makeDynCaller(dc)}if(typeof fp!=="function"){throwBindingError("unknown function pointer with signature "+signature+": "+rawFunction)}return fp}var UnboundTypeError=undefined;function getTypeName(type){var ptr=___getTypeName(type);var rv=readLatin1String(ptr);_free(ptr);return rv}function throwUnboundTypeError(message,types){var unboundTypes=[];var seen={};function visit(type){if(seen[type]){return}if(registeredTypes[type]){return}if(typeDependencies[type]){typeDependencies[type].forEach(visit);return}unboundTypes.push(type);seen[type]=true}types.forEach(visit);throw new UnboundTypeError(message+": "+unboundTypes.map(getTypeName).join([", "]))}function __embind_register_function(name,argCount,rawArgTypesAddr,signature,rawInvoker,fn){var argTypes=heap32VectorToArray(argCount,rawArgTypesAddr);name=readLatin1String(name);rawInvoker=requireFunction(signature,rawInvoker);exposePublicSymbol(name,(function(){throwUnboundTypeError("Cannot call "+name+" due to unbound types",argTypes)}),argCount-1);whenDependentTypesAreResolved([],argTypes,(function(argTypes){var invokerArgsArray=[argTypes[0],null].concat(argTypes.slice(1));replacePublicSymbol(name,craftInvokerFunction(name,invokerArgsArray,null,rawInvoker,fn),argCount-1);return[]}))}function __embind_register_constant(name,type,value){name=readLatin1String(name);whenDependentTypesAreResolved([],[type],(function(type){type=type[0];Module[name]=type["fromWireType"](value);return[]}))}function _pthread_cleanup_pop(){assert(_pthread_cleanup_push.level==__ATEXIT__.length,"cannot pop if something else added meanwhile!");__ATEXIT__.pop();_pthread_cleanup_push.level=__ATEXIT__.length}var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};var PATH={splitPath:(function(filename){var splitPathRe=/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;return splitPathRe.exec(filename).slice(1)}),normalizeArray:(function(parts,allowAboveRoot){var up=0;for(var i=parts.length-1;i>=0;i--){var last=parts[i];if(last==="."){parts.splice(i,1)}else if(last===".."){parts.splice(i,1);up++}else if(up){parts.splice(i,1);up--}}if(allowAboveRoot){for(;up--;up){parts.unshift("..")}}return parts}),normalize:(function(path){var isAbsolute=path.charAt(0)==="/",trailingSlash=path.substr(-1)==="/";path=PATH.normalizeArray(path.split("/").filter((function(p){return!!p})),!isAbsolute).join("/");if(!path&&!isAbsolute){path="."}if(path&&trailingSlash){path+="/"}return(isAbsolute?"/":"")+path}),dirname:(function(path){var result=PATH.splitPath(path),root=result[0],dir=result[1];if(!root&&!dir){return"."}if(dir){dir=dir.substr(0,dir.length-1)}return root+dir}),basename:(function(path){if(path==="/")return"/";var lastSlash=path.lastIndexOf("/");if(lastSlash===-1)return path;return path.substr(lastSlash+1)}),extname:(function(path){return PATH.splitPath(path)[3]}),join:(function(){var paths=Array.prototype.slice.call(arguments,0);return PATH.normalize(paths.join("/"))}),join2:(function(l,r){return PATH.normalize(l+"/"+r)}),resolve:(function(){var resolvedPath="",resolvedAbsolute=false;for(var i=arguments.length-1;i>=-1&&!resolvedAbsolute;i--){var path=i>=0?arguments[i]:FS.cwd();if(typeof path!=="string"){throw new TypeError("Arguments to path.resolve must be strings")}else if(!path){return""}resolvedPath=path+"/"+resolvedPath;resolvedAbsolute=path.charAt(0)==="/"}resolvedPath=PATH.normalizeArray(resolvedPath.split("/").filter((function(p){return!!p})),!resolvedAbsolute).join("/");return(resolvedAbsolute?"/":"")+resolvedPath||"."}),relative:(function(from,to){from=PATH.resolve(from).substr(1);to=PATH.resolve(to).substr(1);function trim(arr){var start=0;for(;start<arr.length;start++){if(arr[start]!=="")break}var end=arr.length-1;for(;end>=0;end--){if(arr[end]!=="")break}if(start>end)return[];return arr.slice(start,end-start+1)}var fromParts=trim(from.split("/"));var toParts=trim(to.split("/"));var length=Math.min(fromParts.length,toParts.length);var samePartsLength=length;for(var i=0;i<length;i++){if(fromParts[i]!==toParts[i]){samePartsLength=i;break}}var outputParts=[];for(var i=samePartsLength;i<fromParts.length;i++){outputParts.push("..")}outputParts=outputParts.concat(toParts.slice(samePartsLength));return outputParts.join("/")})};var TTY={ttys:[],init:(function(){}),shutdown:(function(){}),register:(function(dev,ops){TTY.ttys[dev]={input:[],output:[],ops:ops};FS.registerDevice(dev,TTY.stream_ops)}),stream_ops:{open:(function(stream){var tty=TTY.ttys[stream.node.rdev];if(!tty){throw new FS.ErrnoError(ERRNO_CODES.ENODEV)}stream.tty=tty;stream.seekable=false}),close:(function(stream){stream.tty.ops.flush(stream.tty)}),flush:(function(stream){stream.tty.ops.flush(stream.tty)}),read:(function(stream,buffer,offset,length,pos){if(!stream.tty||!stream.tty.ops.get_char){throw new FS.ErrnoError(ERRNO_CODES.ENXIO)}var bytesRead=0;for(var i=0;i<length;i++){var result;try{result=stream.tty.ops.get_char(stream.tty)}catch(e){throw new FS.ErrnoError(ERRNO_CODES.EIO)}if(result===undefined&&bytesRead===0){throw new FS.ErrnoError(ERRNO_CODES.EAGAIN)}if(result===null||result===undefined)break;bytesRead++;buffer[offset+i]=result}if(bytesRead){stream.node.timestamp=Date.now()}return bytesRead}),write:(function(stream,buffer,offset,length,pos){if(!stream.tty||!stream.tty.ops.put_char){throw new FS.ErrnoError(ERRNO_CODES.ENXIO)}for(var i=0;i<length;i++){try{stream.tty.ops.put_char(stream.tty,buffer[offset+i])}catch(e){throw new FS.ErrnoError(ERRNO_CODES.EIO)}}if(length){stream.node.timestamp=Date.now()}return i})},default_tty_ops:{get_char:(function(tty){if(!tty.input.length){var result=null;if(ENVIRONMENT_IS_NODE){var BUFSIZE=256;var buf=new Buffer(BUFSIZE);var bytesRead=0;var fd=process.stdin.fd;var usingDevice=false;try{fd=fs.openSync("/dev/stdin","r");usingDevice=true}catch(e){}bytesRead=fs.readSync(fd,buf,0,BUFSIZE,null);if(usingDevice){fs.closeSync(fd)}if(bytesRead>0){result=buf.slice(0,bytesRead).toString("utf-8")}else{result=null}}else if(typeof window!="undefined"&&typeof window.prompt=="function"){result=window.prompt("Input: ");if(result!==null){result+="\n"}}else if(typeof readline=="function"){result=readline();if(result!==null){result+="\n"}}if(!result){return null}tty.input=intArrayFromString(result,true)}return tty.input.shift()}),put_char:(function(tty,val){if(val===null||val===10){Module["print"](UTF8ArrayToString(tty.output,0));tty.output=[]}else{if(val!=0)tty.output.push(val)}}),flush:(function(tty){if(tty.output&&tty.output.length>0){Module["print"](UTF8ArrayToString(tty.output,0));tty.output=[]}})},default_tty1_ops:{put_char:(function(tty,val){if(val===null||val===10){Module["printErr"](UTF8ArrayToString(tty.output,0));tty.output=[]}else{if(val!=0)tty.output.push(val)}}),flush:(function(tty){if(tty.output&&tty.output.length>0){Module["printErr"](UTF8ArrayToString(tty.output,0));tty.output=[]}})}};var MEMFS={ops_table:null,mount:(function(mount){return MEMFS.createNode(null,"/",16384|511,0)}),createNode:(function(parent,name,mode,dev){if(FS.isBlkdev(mode)||FS.isFIFO(mode)){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}if(!MEMFS.ops_table){MEMFS.ops_table={dir:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr,lookup:MEMFS.node_ops.lookup,mknod:MEMFS.node_ops.mknod,rename:MEMFS.node_ops.rename,unlink:MEMFS.node_ops.unlink,rmdir:MEMFS.node_ops.rmdir,readdir:MEMFS.node_ops.readdir,symlink:MEMFS.node_ops.symlink},stream:{llseek:MEMFS.stream_ops.llseek}},file:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr},stream:{llseek:MEMFS.stream_ops.llseek,read:MEMFS.stream_ops.read,write:MEMFS.stream_ops.write,allocate:MEMFS.stream_ops.allocate,mmap:MEMFS.stream_ops.mmap,msync:MEMFS.stream_ops.msync}},link:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr,readlink:MEMFS.node_ops.readlink},stream:{}},chrdev:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr},stream:FS.chrdev_stream_ops}}}var node=FS.createNode(parent,name,mode,dev);if(FS.isDir(node.mode)){node.node_ops=MEMFS.ops_table.dir.node;node.stream_ops=MEMFS.ops_table.dir.stream;node.contents={}}else if(FS.isFile(node.mode)){node.node_ops=MEMFS.ops_table.file.node;node.stream_ops=MEMFS.ops_table.file.stream;node.usedBytes=0;node.contents=null}else if(FS.isLink(node.mode)){node.node_ops=MEMFS.ops_table.link.node;node.stream_ops=MEMFS.ops_table.link.stream}else if(FS.isChrdev(node.mode)){node.node_ops=MEMFS.ops_table.chrdev.node;node.stream_ops=MEMFS.ops_table.chrdev.stream}node.timestamp=Date.now();if(parent){parent.contents[name]=node}return node}),getFileDataAsRegularArray:(function(node){if(node.contents&&node.contents.subarray){var arr=[];for(var i=0;i<node.usedBytes;++i)arr.push(node.contents[i]);return arr}return node.contents}),getFileDataAsTypedArray:(function(node){if(!node.contents)return new Uint8Array;if(node.contents.subarray)return node.contents.subarray(0,node.usedBytes);return new Uint8Array(node.contents)}),expandFileStorage:(function(node,newCapacity){if(node.contents&&node.contents.subarray&&newCapacity>node.contents.length){node.contents=MEMFS.getFileDataAsRegularArray(node);node.usedBytes=node.contents.length}if(!node.contents||node.contents.subarray){var prevCapacity=node.contents?node.contents.buffer.byteLength:0;if(prevCapacity>=newCapacity)return;var CAPACITY_DOUBLING_MAX=1024*1024;newCapacity=Math.max(newCapacity,prevCapacity*(prevCapacity<CAPACITY_DOUBLING_MAX?2:1.125)|0);if(prevCapacity!=0)newCapacity=Math.max(newCapacity,256);var oldContents=node.contents;node.contents=new Uint8Array(newCapacity);if(node.usedBytes>0)node.contents.set(oldContents.subarray(0,node.usedBytes),0);return}if(!node.contents&&newCapacity>0)node.contents=[];while(node.contents.length<newCapacity)node.contents.push(0)}),resizeFileStorage:(function(node,newSize){if(node.usedBytes==newSize)return;if(newSize==0){node.contents=null;node.usedBytes=0;return}if(!node.contents||node.contents.subarray){var oldContents=node.contents;node.contents=new Uint8Array(new ArrayBuffer(newSize));if(oldContents){node.contents.set(oldContents.subarray(0,Math.min(newSize,node.usedBytes)))}node.usedBytes=newSize;return}if(!node.contents)node.contents=[];if(node.contents.length>newSize)node.contents.length=newSize;else while(node.contents.length<newSize)node.contents.push(0);node.usedBytes=newSize}),node_ops:{getattr:(function(node){var attr={};attr.dev=FS.isChrdev(node.mode)?node.id:1;attr.ino=node.id;attr.mode=node.mode;attr.nlink=1;attr.uid=0;attr.gid=0;attr.rdev=node.rdev;if(FS.isDir(node.mode)){attr.size=4096}else if(FS.isFile(node.mode)){attr.size=node.usedBytes}else if(FS.isLink(node.mode)){attr.size=node.link.length}else{attr.size=0}attr.atime=new Date(node.timestamp);attr.mtime=new Date(node.timestamp);attr.ctime=new Date(node.timestamp);attr.blksize=4096;attr.blocks=Math.ceil(attr.size/attr.blksize);return attr}),setattr:(function(node,attr){if(attr.mode!==undefined){node.mode=attr.mode}if(attr.timestamp!==undefined){node.timestamp=attr.timestamp}if(attr.size!==undefined){MEMFS.resizeFileStorage(node,attr.size)}}),lookup:(function(parent,name){throw FS.genericErrors[ERRNO_CODES.ENOENT]}),mknod:(function(parent,name,mode,dev){return MEMFS.createNode(parent,name,mode,dev)}),rename:(function(old_node,new_dir,new_name){if(FS.isDir(old_node.mode)){var new_node;try{new_node=FS.lookupNode(new_dir,new_name)}catch(e){}if(new_node){for(var i in new_node.contents){throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY)}}}delete old_node.parent.contents[old_node.name];old_node.name=new_name;new_dir.contents[new_name]=old_node;old_node.parent=new_dir}),unlink:(function(parent,name){delete parent.contents[name]}),rmdir:(function(parent,name){var node=FS.lookupNode(parent,name);for(var i in node.contents){throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY)}delete parent.contents[name]}),readdir:(function(node){var entries=[".",".."];for(var key in node.contents){if(!node.contents.hasOwnProperty(key)){continue}entries.push(key)}return entries}),symlink:(function(parent,newname,oldpath){var node=MEMFS.createNode(parent,newname,511|40960,0);node.link=oldpath;return node}),readlink:(function(node){if(!FS.isLink(node.mode)){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}return node.link})},stream_ops:{read:(function(stream,buffer,offset,length,position){var contents=stream.node.contents;if(position>=stream.node.usedBytes)return 0;var size=Math.min(stream.node.usedBytes-position,length);assert(size>=0);if(size>8&&contents.subarray){buffer.set(contents.subarray(position,position+size),offset)}else{for(var i=0;i<size;i++)buffer[offset+i]=contents[position+i]}return size}),write:(function(stream,buffer,offset,length,position,canOwn){if(!length)return 0;var node=stream.node;node.timestamp=Date.now();if(buffer.subarray&&(!node.contents||node.contents.subarray)){if(canOwn){node.contents=buffer.subarray(offset,offset+length);node.usedBytes=length;return length}else if(node.usedBytes===0&&position===0){node.contents=new Uint8Array(buffer.subarray(offset,offset+length));node.usedBytes=length;return length}else if(position+length<=node.usedBytes){node.contents.set(buffer.subarray(offset,offset+length),position);return length}}MEMFS.expandFileStorage(node,position+length);if(node.contents.subarray&&buffer.subarray)node.contents.set(buffer.subarray(offset,offset+length),position);else{for(var i=0;i<length;i++){node.contents[position+i]=buffer[offset+i]}}node.usedBytes=Math.max(node.usedBytes,position+length);return length}),llseek:(function(stream,offset,whence){var position=offset;if(whence===1){position+=stream.position}else if(whence===2){if(FS.isFile(stream.node.mode)){position+=stream.node.usedBytes}}if(position<0){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}return position}),allocate:(function(stream,offset,length){MEMFS.expandFileStorage(stream.node,offset+length);stream.node.usedBytes=Math.max(stream.node.usedBytes,offset+length)}),mmap:(function(stream,buffer,offset,length,position,prot,flags){if(!FS.isFile(stream.node.mode)){throw new FS.ErrnoError(ERRNO_CODES.ENODEV)}var ptr;var allocated;var contents=stream.node.contents;if(!(flags&2)&&(contents.buffer===buffer||contents.buffer===buffer.buffer)){allocated=false;ptr=contents.byteOffset}else{if(position>0||position+length<stream.node.usedBytes){if(contents.subarray){contents=contents.subarray(position,position+length)}else{contents=Array.prototype.slice.call(contents,position,position+length)}}allocated=true;ptr=_malloc(length);if(!ptr){throw new FS.ErrnoError(ERRNO_CODES.ENOMEM)}buffer.set(contents,ptr)}return{ptr:ptr,allocated:allocated}}),msync:(function(stream,buffer,offset,length,mmapFlags){if(!FS.isFile(stream.node.mode)){throw new FS.ErrnoError(ERRNO_CODES.ENODEV)}if(mmapFlags&2){return 0}var bytesWritten=MEMFS.stream_ops.write(stream,buffer,0,length,offset,false);return 0})}};var IDBFS={dbs:{},indexedDB:(function(){if(typeof indexedDB!=="undefined")return indexedDB;var ret=null;if(typeof window==="object")ret=window.indexedDB||window.mozIndexedDB||window.webkitIndexedDB||window.msIndexedDB;assert(ret,"IDBFS used, but indexedDB not supported");return ret}),DB_VERSION:21,DB_STORE_NAME:"FILE_DATA",mount:(function(mount){return MEMFS.mount.apply(null,arguments)}),syncfs:(function(mount,populate,callback){IDBFS.getLocalSet(mount,(function(err,local){if(err)return callback(err);IDBFS.getRemoteSet(mount,(function(err,remote){if(err)return callback(err);var src=populate?remote:local;var dst=populate?local:remote;IDBFS.reconcile(src,dst,callback)}))}))}),getDB:(function(name,callback){var db=IDBFS.dbs[name];if(db){return callback(null,db)}var req;try{req=IDBFS.indexedDB().open(name,IDBFS.DB_VERSION)}catch(e){return callback(e)}req.onupgradeneeded=(function(e){var db=e.target.result;var transaction=e.target.transaction;var fileStore;if(db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)){fileStore=transaction.objectStore(IDBFS.DB_STORE_NAME)}else{fileStore=db.createObjectStore(IDBFS.DB_STORE_NAME)}if(!fileStore.indexNames.contains("timestamp")){fileStore.createIndex("timestamp","timestamp",{unique:false})}});req.onsuccess=(function(){db=req.result;IDBFS.dbs[name]=db;callback(null,db)});req.onerror=(function(e){callback(this.error);e.preventDefault()})}),getLocalSet:(function(mount,callback){var entries={};function isRealDir(p){return p!=="."&&p!==".."}function toAbsolute(root){return(function(p){return PATH.join2(root,p)})}var check=FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));while(check.length){var path=check.pop();var stat;try{stat=FS.stat(path)}catch(e){return callback(e)}if(FS.isDir(stat.mode)){check.push.apply(check,FS.readdir(path).filter(isRealDir).map(toAbsolute(path)))}entries[path]={timestamp:stat.mtime}}return callback(null,{type:"local",entries:entries})}),getRemoteSet:(function(mount,callback){var entries={};IDBFS.getDB(mount.mountpoint,(function(err,db){if(err)return callback(err);var transaction=db.transaction([IDBFS.DB_STORE_NAME],"readonly");transaction.onerror=(function(e){callback(this.error);e.preventDefault()});var store=transaction.objectStore(IDBFS.DB_STORE_NAME);var index=store.index("timestamp");index.openKeyCursor().onsuccess=(function(event){var cursor=event.target.result;if(!cursor){return callback(null,{type:"remote",db:db,entries:entries})}entries[cursor.primaryKey]={timestamp:cursor.key};cursor.continue()})}))}),loadLocalEntry:(function(path,callback){var stat,node;try{var lookup=FS.lookupPath(path);node=lookup.node;stat=FS.stat(path)}catch(e){return callback(e)}if(FS.isDir(stat.mode)){return callback(null,{timestamp:stat.mtime,mode:stat.mode})}else if(FS.isFile(stat.mode)){node.contents=MEMFS.getFileDataAsTypedArray(node);return callback(null,{timestamp:stat.mtime,mode:stat.mode,contents:node.contents})}else{return callback(new Error("node type not supported"))}}),storeLocalEntry:(function(path,entry,callback){try{if(FS.isDir(entry.mode)){FS.mkdir(path,entry.mode)}else if(FS.isFile(entry.mode)){FS.writeFile(path,entry.contents,{encoding:"binary",canOwn:true})}else{return callback(new Error("node type not supported"))}FS.chmod(path,entry.mode);FS.utime(path,entry.timestamp,entry.timestamp)}catch(e){return callback(e)}callback(null)}),removeLocalEntry:(function(path,callback){try{var lookup=FS.lookupPath(path);var stat=FS.stat(path);if(FS.isDir(stat.mode)){FS.rmdir(path)}else if(FS.isFile(stat.mode)){FS.unlink(path)}}catch(e){return callback(e)}callback(null)}),loadRemoteEntry:(function(store,path,callback){var req=store.get(path);req.onsuccess=(function(event){callback(null,event.target.result)});req.onerror=(function(e){callback(this.error);e.preventDefault()})}),storeRemoteEntry:(function(store,path,entry,callback){var req=store.put(entry,path);req.onsuccess=(function(){callback(null)});req.onerror=(function(e){callback(this.error);e.preventDefault()})}),removeRemoteEntry:(function(store,path,callback){var req=store.delete(path);req.onsuccess=(function(){callback(null)});req.onerror=(function(e){callback(this.error);e.preventDefault()})}),reconcile:(function(src,dst,callback){var total=0;var create=[];Object.keys(src.entries).forEach((function(key){var e=src.entries[key];var e2=dst.entries[key];if(!e2||e.timestamp>e2.timestamp){create.push(key);total++}}));var remove=[];Object.keys(dst.entries).forEach((function(key){var e=dst.entries[key];var e2=src.entries[key];if(!e2){remove.push(key);total++}}));if(!total){return callback(null)}var errored=false;var completed=0;var db=src.type==="remote"?src.db:dst.db;var transaction=db.transaction([IDBFS.DB_STORE_NAME],"readwrite");var store=transaction.objectStore(IDBFS.DB_STORE_NAME);function done(err){if(err){if(!done.errored){done.errored=true;return callback(err)}return}if(++completed>=total){return callback(null)}}transaction.onerror=(function(e){done(this.error);e.preventDefault()});create.sort().forEach((function(path){if(dst.type==="local"){IDBFS.loadRemoteEntry(store,path,(function(err,entry){if(err)return done(err);IDBFS.storeLocalEntry(path,entry,done)}))}else{IDBFS.loadLocalEntry(path,(function(err,entry){if(err)return done(err);IDBFS.storeRemoteEntry(store,path,entry,done)}))}}));remove.sort().reverse().forEach((function(path){if(dst.type==="local"){IDBFS.removeLocalEntry(path,done)}else{IDBFS.removeRemoteEntry(store,path,done)}}))})};var NODEFS={isWindows:false,staticInit:(function(){NODEFS.isWindows=!!process.platform.match(/^win/)}),mount:(function(mount){assert(ENVIRONMENT_IS_NODE);return NODEFS.createNode(null,"/",NODEFS.getMode(mount.opts.root),0)}),createNode:(function(parent,name,mode,dev){if(!FS.isDir(mode)&&!FS.isFile(mode)&&!FS.isLink(mode)){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}var node=FS.createNode(parent,name,mode);node.node_ops=NODEFS.node_ops;node.stream_ops=NODEFS.stream_ops;return node}),getMode:(function(path){var stat;try{stat=fs.lstatSync(path);if(NODEFS.isWindows){stat.mode=stat.mode|(stat.mode&146)>>1}}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}return stat.mode}),realPath:(function(node){var parts=[];while(node.parent!==node){parts.push(node.name);node=node.parent}parts.push(node.mount.opts.root);parts.reverse();return PATH.join.apply(null,parts)}),flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:(function(flags){flags&=~32768;if(flags in NODEFS.flagsToPermissionStringMap){return NODEFS.flagsToPermissionStringMap[flags]}else{throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}}),node_ops:{getattr:(function(node){var path=NODEFS.realPath(node);var stat;try{stat=fs.lstatSync(path)}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}if(NODEFS.isWindows&&!stat.blksize){stat.blksize=4096}if(NODEFS.isWindows&&!stat.blocks){stat.blocks=(stat.size+stat.blksize-1)/stat.blksize|0}return{dev:stat.dev,ino:stat.ino,mode:stat.mode,nlink:stat.nlink,uid:stat.uid,gid:stat.gid,rdev:stat.rdev,size:stat.size,atime:stat.atime,mtime:stat.mtime,ctime:stat.ctime,blksize:stat.blksize,blocks:stat.blocks}}),setattr:(function(node,attr){var path=NODEFS.realPath(node);try{if(attr.mode!==undefined){fs.chmodSync(path,attr.mode);node.mode=attr.mode}if(attr.timestamp!==undefined){var date=new Date(attr.timestamp);fs.utimesSync(path,date,date)}if(attr.size!==undefined){fs.truncateSync(path,attr.size)}}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}}),lookup:(function(parent,name){var path=PATH.join2(NODEFS.realPath(parent),name);var mode=NODEFS.getMode(path);return NODEFS.createNode(parent,name,mode)}),mknod:(function(parent,name,mode,dev){var node=NODEFS.createNode(parent,name,mode,dev);var path=NODEFS.realPath(node);try{if(FS.isDir(node.mode)){fs.mkdirSync(path,node.mode)}else{fs.writeFileSync(path,"",{mode:node.mode})}}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}return node}),rename:(function(oldNode,newDir,newName){var oldPath=NODEFS.realPath(oldNode);var newPath=PATH.join2(NODEFS.realPath(newDir),newName);try{fs.renameSync(oldPath,newPath)}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}}),unlink:(function(parent,name){var path=PATH.join2(NODEFS.realPath(parent),name);try{fs.unlinkSync(path)}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}}),rmdir:(function(parent,name){var path=PATH.join2(NODEFS.realPath(parent),name);try{fs.rmdirSync(path)}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}}),readdir:(function(node){var path=NODEFS.realPath(node);try{return fs.readdirSync(path)}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}}),symlink:(function(parent,newName,oldPath){var newPath=PATH.join2(NODEFS.realPath(parent),newName);try{fs.symlinkSync(oldPath,newPath)}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}}),readlink:(function(node){var path=NODEFS.realPath(node);try{path=fs.readlinkSync(path);path=NODEJS_PATH.relative(NODEJS_PATH.resolve(node.mount.opts.root),path);return path}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}})},stream_ops:{open:(function(stream){var path=NODEFS.realPath(stream.node);try{if(FS.isFile(stream.node.mode)){stream.nfd=fs.openSync(path,NODEFS.flagsToPermissionString(stream.flags))}}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}}),close:(function(stream){try{if(FS.isFile(stream.node.mode)&&stream.nfd){fs.closeSync(stream.nfd)}}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}}),read:(function(stream,buffer,offset,length,position){if(length===0)return 0;var nbuffer=new Buffer(length);var res;try{res=fs.readSync(stream.nfd,nbuffer,0,length,position)}catch(e){throw new FS.ErrnoError(ERRNO_CODES[e.code])}if(res>0){for(var i=0;i<res;i++){buffer[offset+i]=nbuffer[i]}}return res}),write:(function(stream,buffer,offset,length,position){var nbuffer=new Buffer(buffer.subarray(offset,offset+length));var res;try{res=fs.writeSync(stream.nfd,nbuffer,0,length,position)}catch(e){throw new FS.ErrnoError(ERRNO_CODES[e.code])}return res}),llseek:(function(stream,offset,whence){var position=offset;if(whence===1){position+=stream.position}else if(whence===2){if(FS.isFile(stream.node.mode)){try{var stat=fs.fstatSync(stream.nfd);position+=stat.size}catch(e){throw new FS.ErrnoError(ERRNO_CODES[e.code])}}}if(position<0){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}return position})}};var WORKERFS={DIR_MODE:16895,FILE_MODE:33279,reader:null,mount:(function(mount){assert(ENVIRONMENT_IS_WORKER);if(!WORKERFS.reader)WORKERFS.reader=new FileReaderSync;var root=WORKERFS.createNode(null,"/",WORKERFS.DIR_MODE,0);var createdParents={};function ensureParent(path){var parts=path.split("/");var parent=root;for(var i=0;i<parts.length-1;i++){var curr=parts.slice(0,i+1).join("/");if(!createdParents[curr]){createdParents[curr]=WORKERFS.createNode(parent,curr,WORKERFS.DIR_MODE,0)}parent=createdParents[curr]}return parent}function base(path){var parts=path.split("/");return parts[parts.length-1]}Array.prototype.forEach.call(mount.opts["files"]||[],(function(file){WORKERFS.createNode(ensureParent(file.name),base(file.name),WORKERFS.FILE_MODE,0,file,file.lastModifiedDate)}));(mount.opts["blobs"]||[]).forEach((function(obj){WORKERFS.createNode(ensureParent(obj["name"]),base(obj["name"]),WORKERFS.FILE_MODE,0,obj["data"])}));(mount.opts["packages"]||[]).forEach((function(pack){pack["metadata"].files.forEach((function(file){var name=file.filename.substr(1);WORKERFS.createNode(ensureParent(name),base(name),WORKERFS.FILE_MODE,0,pack["blob"].slice(file.start,file.end))}))}));return root}),createNode:(function(parent,name,mode,dev,contents,mtime){var node=FS.createNode(parent,name,mode);node.mode=mode;node.node_ops=WORKERFS.node_ops;node.stream_ops=WORKERFS.stream_ops;node.timestamp=(mtime||new Date).getTime();assert(WORKERFS.FILE_MODE!==WORKERFS.DIR_MODE);if(mode===WORKERFS.FILE_MODE){node.size=contents.size;node.contents=contents}else{node.size=4096;node.contents={}}if(parent){parent.contents[name]=node}return node}),node_ops:{getattr:(function(node){return{dev:1,ino:undefined,mode:node.mode,nlink:1,uid:0,gid:0,rdev:undefined,size:node.size,atime:new Date(node.timestamp),mtime:new Date(node.timestamp),ctime:new Date(node.timestamp),blksize:4096,blocks:Math.ceil(node.size/4096)}}),setattr:(function(node,attr){if(attr.mode!==undefined){node.mode=attr.mode}if(attr.timestamp!==undefined){node.timestamp=attr.timestamp}}),lookup:(function(parent,name){throw new FS.ErrnoError(ERRNO_CODES.ENOENT)}),mknod:(function(parent,name,mode,dev){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}),rename:(function(oldNode,newDir,newName){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}),unlink:(function(parent,name){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}),rmdir:(function(parent,name){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}),readdir:(function(node){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}),symlink:(function(parent,newName,oldPath){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}),readlink:(function(node){throw new FS.ErrnoError(ERRNO_CODES.EPERM)})},stream_ops:{read:(function(stream,buffer,offset,length,position){if(position>=stream.node.size)return 0;var chunk=stream.node.contents.slice(position,position+length);var ab=WORKERFS.reader.readAsArrayBuffer(chunk);buffer.set(new Uint8Array(ab),offset);return chunk.size}),write:(function(stream,buffer,offset,length,position){throw new FS.ErrnoError(ERRNO_CODES.EIO)}),llseek:(function(stream,offset,whence){var position=offset;if(whence===1){position+=stream.position}else if(whence===2){if(FS.isFile(stream.node.mode)){position+=stream.node.size}}if(position<0){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}return position})}};var _stdin=allocate(1,"i32*",ALLOC_STATIC);var _stdout=allocate(1,"i32*",ALLOC_STATIC);var _stderr=allocate(1,"i32*",ALLOC_STATIC);var FS={root:null,mounts:[],devices:[null],streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,trackingDelegate:{},tracking:{openFlags:{READ:1,WRITE:2}},ErrnoError:null,genericErrors:{},filesystems:null,handleFSError:(function(e){if(!(e instanceof FS.ErrnoError))throw e+" : "+stackTrace();return ___setErrNo(e.errno)}),lookupPath:(function(path,opts){path=PATH.resolve(FS.cwd(),path);opts=opts||{};if(!path)return{path:"",node:null};var defaults={follow_mount:true,recurse_count:0};for(var key in defaults){if(opts[key]===undefined){opts[key]=defaults[key]}}if(opts.recurse_count>8){throw new FS.ErrnoError(ERRNO_CODES.ELOOP)}var parts=PATH.normalizeArray(path.split("/").filter((function(p){return!!p})),false);var current=FS.root;var current_path="/";for(var i=0;i<parts.length;i++){var islast=i===parts.length-1;if(islast&&opts.parent){break}current=FS.lookupNode(current,parts[i]);current_path=PATH.join2(current_path,parts[i]);if(FS.isMountpoint(current)){if(!islast||islast&&opts.follow_mount){current=current.mounted.root}}if(!islast||opts.follow){var count=0;while(FS.isLink(current.mode)){var link=FS.readlink(current_path);current_path=PATH.resolve(PATH.dirname(current_path),link);var lookup=FS.lookupPath(current_path,{recurse_count:opts.recurse_count});current=lookup.node;if(count++>40){throw new FS.ErrnoError(ERRNO_CODES.ELOOP)}}}}return{path:current_path,node:current}}),getPath:(function(node){var path;while(true){if(FS.isRoot(node)){var mount=node.mount.mountpoint;if(!path)return mount;return mount[mount.length-1]!=="/"?mount+"/"+path:mount+path}path=path?node.name+"/"+path:node.name;node=node.parent}}),hashName:(function(parentid,name){var hash=0;for(var i=0;i<name.length;i++){hash=(hash<<5)-hash+name.charCodeAt(i)|0}return(parentid+hash>>>0)%FS.nameTable.length}),hashAddNode:(function(node){var hash=FS.hashName(node.parent.id,node.name);node.name_next=FS.nameTable[hash];FS.nameTable[hash]=node}),hashRemoveNode:(function(node){var hash=FS.hashName(node.parent.id,node.name);if(FS.nameTable[hash]===node){FS.nameTable[hash]=node.name_next}else{var current=FS.nameTable[hash];while(current){if(current.name_next===node){current.name_next=node.name_next;break}current=current.name_next}}}),lookupNode:(function(parent,name){var err=FS.mayLookup(parent);if(err){throw new FS.ErrnoError(err,parent)}var hash=FS.hashName(parent.id,name);for(var node=FS.nameTable[hash];node;node=node.name_next){var nodeName=node.name;if(node.parent.id===parent.id&&nodeName===name){return node}}return FS.lookup(parent,name)}),createNode:(function(parent,name,mode,rdev){if(!FS.FSNode){FS.FSNode=(function(parent,name,mode,rdev){if(!parent){parent=this}this.parent=parent;this.mount=parent.mount;this.mounted=null;this.id=FS.nextInode++;this.name=name;this.mode=mode;this.node_ops={};this.stream_ops={};this.rdev=rdev});FS.FSNode.prototype={};var readMode=292|73;var writeMode=146;Object.defineProperties(FS.FSNode.prototype,{read:{get:(function(){return(this.mode&readMode)===readMode}),set:(function(val){val?this.mode|=readMode:this.mode&=~readMode})},write:{get:(function(){return(this.mode&writeMode)===writeMode}),set:(function(val){val?this.mode|=writeMode:this.mode&=~writeMode})},isFolder:{get:(function(){return FS.isDir(this.mode)})},isDevice:{get:(function(){return FS.isChrdev(this.mode)})}})}var node=new FS.FSNode(parent,name,mode,rdev);FS.hashAddNode(node);return node}),destroyNode:(function(node){FS.hashRemoveNode(node)}),isRoot:(function(node){return node===node.parent}),isMountpoint:(function(node){return!!node.mounted}),isFile:(function(mode){return(mode&61440)===32768}),isDir:(function(mode){return(mode&61440)===16384}),isLink:(function(mode){return(mode&61440)===40960}),isChrdev:(function(mode){return(mode&61440)===8192}),isBlkdev:(function(mode){return(mode&61440)===24576}),isFIFO:(function(mode){return(mode&61440)===4096}),isSocket:(function(mode){return(mode&49152)===49152}),flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:(function(str){var flags=FS.flagModes[str];if(typeof flags==="undefined"){throw new Error("Unknown file open mode: "+str)}return flags}),flagsToPermissionString:(function(flag){var perms=["r","w","rw"][flag&3];if(flag&512){perms+="w"}return perms}),nodePermissions:(function(node,perms){if(FS.ignorePermissions){return 0}if(perms.indexOf("r")!==-1&&!(node.mode&292)){return ERRNO_CODES.EACCES}else if(perms.indexOf("w")!==-1&&!(node.mode&146)){return ERRNO_CODES.EACCES}else if(perms.indexOf("x")!==-1&&!(node.mode&73)){return ERRNO_CODES.EACCES}return 0}),mayLookup:(function(dir){var err=FS.nodePermissions(dir,"x");if(err)return err;if(!dir.node_ops.lookup)return ERRNO_CODES.EACCES;return 0}),mayCreate:(function(dir,name){try{var node=FS.lookupNode(dir,name);return ERRNO_CODES.EEXIST}catch(e){}return FS.nodePermissions(dir,"wx")}),mayDelete:(function(dir,name,isdir){var node;try{node=FS.lookupNode(dir,name)}catch(e){return e.errno}var err=FS.nodePermissions(dir,"wx");if(err){return err}if(isdir){if(!FS.isDir(node.mode)){return ERRNO_CODES.ENOTDIR}if(FS.isRoot(node)||FS.getPath(node)===FS.cwd()){return ERRNO_CODES.EBUSY}}else{if(FS.isDir(node.mode)){return ERRNO_CODES.EISDIR}}return 0}),mayOpen:(function(node,flags){if(!node){return ERRNO_CODES.ENOENT}if(FS.isLink(node.mode)){return ERRNO_CODES.ELOOP}else if(FS.isDir(node.mode)){if((flags&2097155)!==0||flags&512){return ERRNO_CODES.EISDIR}}return FS.nodePermissions(node,FS.flagsToPermissionString(flags))}),MAX_OPEN_FDS:4096,nextfd:(function(fd_start,fd_end){fd_start=fd_start||0;fd_end=fd_end||FS.MAX_OPEN_FDS;for(var fd=fd_start;fd<=fd_end;fd++){if(!FS.streams[fd]){return fd}}throw new FS.ErrnoError(ERRNO_CODES.EMFILE)}),getStream:(function(fd){return FS.streams[fd]}),createStream:(function(stream,fd_start,fd_end){if(!FS.FSStream){FS.FSStream=(function(){});FS.FSStream.prototype={};Object.defineProperties(FS.FSStream.prototype,{object:{get:(function(){return this.node}),set:(function(val){this.node=val})},isRead:{get:(function(){return(this.flags&2097155)!==1})},isWrite:{get:(function(){return(this.flags&2097155)!==0})},isAppend:{get:(function(){return this.flags&1024})}})}var newStream=new FS.FSStream;for(var p in stream){newStream[p]=stream[p]}stream=newStream;var fd=FS.nextfd(fd_start,fd_end);stream.fd=fd;FS.streams[fd]=stream;return stream}),closeStream:(function(fd){FS.streams[fd]=null}),chrdev_stream_ops:{open:(function(stream){var device=FS.getDevice(stream.node.rdev);stream.stream_ops=device.stream_ops;if(stream.stream_ops.open){stream.stream_ops.open(stream)}}),llseek:(function(){throw new FS.ErrnoError(ERRNO_CODES.ESPIPE)})},major:(function(dev){return dev>>8}),minor:(function(dev){return dev&255}),makedev:(function(ma,mi){return ma<<8|mi}),registerDevice:(function(dev,ops){FS.devices[dev]={stream_ops:ops}}),getDevice:(function(dev){return FS.devices[dev]}),getMounts:(function(mount){var mounts=[];var check=[mount];while(check.length){var m=check.pop();mounts.push(m);check.push.apply(check,m.mounts)}return mounts}),syncfs:(function(populate,callback){if(typeof populate==="function"){callback=populate;populate=false}var mounts=FS.getMounts(FS.root.mount);var completed=0;function done(err){if(err){if(!done.errored){done.errored=true;return callback(err)}return}if(++completed>=mounts.length){callback(null)}}mounts.forEach((function(mount){if(!mount.type.syncfs){return done(null)}mount.type.syncfs(mount,populate,done)}))}),mount:(function(type,opts,mountpoint){var root=mountpoint==="/";var pseudo=!mountpoint;var node;if(root&&FS.root){throw new FS.ErrnoError(ERRNO_CODES.EBUSY)}else if(!root&&!pseudo){var lookup=FS.lookupPath(mountpoint,{follow_mount:false});mountpoint=lookup.path;node=lookup.node;if(FS.isMountpoint(node)){throw new FS.ErrnoError(ERRNO_CODES.EBUSY)}if(!FS.isDir(node.mode)){throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR)}}var mount={type:type,opts:opts,mountpoint:mountpoint,mounts:[]};var mountRoot=type.mount(mount);mountRoot.mount=mount;mount.root=mountRoot;if(root){FS.root=mountRoot}else if(node){node.mounted=mount;if(node.mount){node.mount.mounts.push(mount)}}return mountRoot}),unmount:(function(mountpoint){var lookup=FS.lookupPath(mountpoint,{follow_mount:false});if(!FS.isMountpoint(lookup.node)){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}var node=lookup.node;var mount=node.mounted;var mounts=FS.getMounts(mount);Object.keys(FS.nameTable).forEach((function(hash){var current=FS.nameTable[hash];while(current){var next=current.name_next;if(mounts.indexOf(current.mount)!==-1){FS.destroyNode(current)}current=next}}));node.mounted=null;var idx=node.mount.mounts.indexOf(mount);assert(idx!==-1);node.mount.mounts.splice(idx,1)}),lookup:(function(parent,name){return parent.node_ops.lookup(parent,name)}),mknod:(function(path,mode,dev){var lookup=FS.lookupPath(path,{parent:true});var parent=lookup.node;var name=PATH.basename(path);if(!name||name==="."||name===".."){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}var err=FS.mayCreate(parent,name);if(err){throw new FS.ErrnoError(err)}if(!parent.node_ops.mknod){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}return parent.node_ops.mknod(parent,name,mode,dev)}),create:(function(path,mode){mode=mode!==undefined?mode:438;mode&=4095;mode|=32768;return FS.mknod(path,mode,0)}),mkdir:(function(path,mode){mode=mode!==undefined?mode:511;mode&=511|512;mode|=16384;return FS.mknod(path,mode,0)}),mkdev:(function(path,mode,dev){if(typeof dev==="undefined"){dev=mode;mode=438}mode|=8192;return FS.mknod(path,mode,dev)}),symlink:(function(oldpath,newpath){if(!PATH.resolve(oldpath)){throw new FS.ErrnoError(ERRNO_CODES.ENOENT)}var lookup=FS.lookupPath(newpath,{parent:true});var parent=lookup.node;if(!parent){throw new FS.ErrnoError(ERRNO_CODES.ENOENT)}var newname=PATH.basename(newpath);var err=FS.mayCreate(parent,newname);if(err){throw new FS.ErrnoError(err)}if(!parent.node_ops.symlink){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}return parent.node_ops.symlink(parent,newname,oldpath)}),rename:(function(old_path,new_path){var old_dirname=PATH.dirname(old_path);var new_dirname=PATH.dirname(new_path);var old_name=PATH.basename(old_path);var new_name=PATH.basename(new_path);var lookup,old_dir,new_dir;try{lookup=FS.lookupPath(old_path,{parent:true});old_dir=lookup.node;lookup=FS.lookupPath(new_path,{parent:true});new_dir=lookup.node}catch(e){throw new FS.ErrnoError(ERRNO_CODES.EBUSY)}if(!old_dir||!new_dir)throw new FS.ErrnoError(ERRNO_CODES.ENOENT);if(old_dir.mount!==new_dir.mount){throw new FS.ErrnoError(ERRNO_CODES.EXDEV)}var old_node=FS.lookupNode(old_dir,old_name);var relative=PATH.relative(old_path,new_dirname);if(relative.charAt(0)!=="."){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}relative=PATH.relative(new_path,old_dirname);if(relative.charAt(0)!=="."){throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY)}var new_node;try{new_node=FS.lookupNode(new_dir,new_name)}catch(e){}if(old_node===new_node){return}var isdir=FS.isDir(old_node.mode);var err=FS.mayDelete(old_dir,old_name,isdir);if(err){throw new FS.ErrnoError(err)}err=new_node?FS.mayDelete(new_dir,new_name,isdir):FS.mayCreate(new_dir,new_name);if(err){throw new FS.ErrnoError(err)}if(!old_dir.node_ops.rename){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}if(FS.isMountpoint(old_node)||new_node&&FS.isMountpoint(new_node)){throw new FS.ErrnoError(ERRNO_CODES.EBUSY)}if(new_dir!==old_dir){err=FS.nodePermissions(old_dir,"w");if(err){throw new FS.ErrnoError(err)}}try{if(FS.trackingDelegate["willMovePath"]){FS.trackingDelegate["willMovePath"](old_path,new_path)}}catch(e){console.log("FS.trackingDelegate['willMovePath']('"+old_path+"', '"+new_path+"') threw an exception: "+e.message)}FS.hashRemoveNode(old_node);try{old_dir.node_ops.rename(old_node,new_dir,new_name)}catch(e){throw e}finally{FS.hashAddNode(old_node)}try{if(FS.trackingDelegate["onMovePath"])FS.trackingDelegate["onMovePath"](old_path,new_path)}catch(e){console.log("FS.trackingDelegate['onMovePath']('"+old_path+"', '"+new_path+"') threw an exception: "+e.message)}}),rmdir:(function(path){var lookup=FS.lookupPath(path,{parent:true});var parent=lookup.node;var name=PATH.basename(path);var node=FS.lookupNode(parent,name);var err=FS.mayDelete(parent,name,true);if(err){throw new FS.ErrnoError(err)}if(!parent.node_ops.rmdir){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}if(FS.isMountpoint(node)){throw new FS.ErrnoError(ERRNO_CODES.EBUSY)}try{if(FS.trackingDelegate["willDeletePath"]){FS.trackingDelegate["willDeletePath"](path)}}catch(e){console.log("FS.trackingDelegate['willDeletePath']('"+path+"') threw an exception: "+e.message)}parent.node_ops.rmdir(parent,name);FS.destroyNode(node);try{if(FS.trackingDelegate["onDeletePath"])FS.trackingDelegate["onDeletePath"](path)}catch(e){console.log("FS.trackingDelegate['onDeletePath']('"+path+"') threw an exception: "+e.message)}}),readdir:(function(path){var lookup=FS.lookupPath(path,{follow:true});var node=lookup.node;if(!node.node_ops.readdir){throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR)}return node.node_ops.readdir(node)}),unlink:(function(path){var lookup=FS.lookupPath(path,{parent:true});var parent=lookup.node;var name=PATH.basename(path);var node=FS.lookupNode(parent,name);var err=FS.mayDelete(parent,name,false);if(err){if(err===ERRNO_CODES.EISDIR)err=ERRNO_CODES.EPERM;throw new FS.ErrnoError(err)}if(!parent.node_ops.unlink){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}if(FS.isMountpoint(node)){throw new FS.ErrnoError(ERRNO_CODES.EBUSY)}try{if(FS.trackingDelegate["willDeletePath"]){FS.trackingDelegate["willDeletePath"](path)}}catch(e){console.log("FS.trackingDelegate['willDeletePath']('"+path+"') threw an exception: "+e.message)}parent.node_ops.unlink(parent,name);FS.destroyNode(node);try{if(FS.trackingDelegate["onDeletePath"])FS.trackingDelegate["onDeletePath"](path)}catch(e){console.log("FS.trackingDelegate['onDeletePath']('"+path+"') threw an exception: "+e.message)}}),readlink:(function(path){var lookup=FS.lookupPath(path);var link=lookup.node;if(!link){throw new FS.ErrnoError(ERRNO_CODES.ENOENT)}if(!link.node_ops.readlink){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}return PATH.resolve(FS.getPath(link.parent),link.node_ops.readlink(link))}),stat:(function(path,dontFollow){var lookup=FS.lookupPath(path,{follow:!dontFollow});var node=lookup.node;if(!node){throw new FS.ErrnoError(ERRNO_CODES.ENOENT)}if(!node.node_ops.getattr){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}return node.node_ops.getattr(node)}),lstat:(function(path){return FS.stat(path,true)}),chmod:(function(path,mode,dontFollow){var node;if(typeof path==="string"){var lookup=FS.lookupPath(path,{follow:!dontFollow});node=lookup.node}else{node=path}if(!node.node_ops.setattr){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}node.node_ops.setattr(node,{mode:mode&4095|node.mode&~4095,timestamp:Date.now()})}),lchmod:(function(path,mode){FS.chmod(path,mode,true)}),fchmod:(function(fd,mode){var stream=FS.getStream(fd);if(!stream){throw new FS.ErrnoError(ERRNO_CODES.EBADF)}FS.chmod(stream.node,mode)}),chown:(function(path,uid,gid,dontFollow){var node;if(typeof path==="string"){var lookup=FS.lookupPath(path,{follow:!dontFollow});node=lookup.node}else{node=path}if(!node.node_ops.setattr){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}node.node_ops.setattr(node,{timestamp:Date.now()})}),lchown:(function(path,uid,gid){FS.chown(path,uid,gid,true)}),fchown:(function(fd,uid,gid){var stream=FS.getStream(fd);if(!stream){throw new FS.ErrnoError(ERRNO_CODES.EBADF)}FS.chown(stream.node,uid,gid)}),truncate:(function(path,len){if(len<0){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}var node;if(typeof path==="string"){var lookup=FS.lookupPath(path,{follow:true});node=lookup.node}else{node=path}if(!node.node_ops.setattr){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}if(FS.isDir(node.mode)){throw new FS.ErrnoError(ERRNO_CODES.EISDIR)}if(!FS.isFile(node.mode)){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}var err=FS.nodePermissions(node,"w");if(err){throw new FS.ErrnoError(err)}node.node_ops.setattr(node,{size:len,timestamp:Date.now()})}),ftruncate:(function(fd,len){var stream=FS.getStream(fd);if(!stream){throw new FS.ErrnoError(ERRNO_CODES.EBADF)}if((stream.flags&2097155)===0){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}FS.truncate(stream.node,len)}),utime:(function(path,atime,mtime){var lookup=FS.lookupPath(path,{follow:true});var node=lookup.node;node.node_ops.setattr(node,{timestamp:Math.max(atime,mtime)})}),open:(function(path,flags,mode,fd_start,fd_end){if(path===""){throw new FS.ErrnoError(ERRNO_CODES.ENOENT)}flags=typeof flags==="string"?FS.modeStringToFlags(flags):flags;mode=typeof mode==="undefined"?438:mode;if(flags&64){mode=mode&4095|32768}else{mode=0}var node;if(typeof path==="object"){node=path}else{path=PATH.normalize(path);try{var lookup=FS.lookupPath(path,{follow:!(flags&131072)});node=lookup.node}catch(e){}}var created=false;if(flags&64){if(node){if(flags&128){throw new FS.ErrnoError(ERRNO_CODES.EEXIST)}}else{node=FS.mknod(path,mode,0);created=true}}if(!node){throw new FS.ErrnoError(ERRNO_CODES.ENOENT)}if(FS.isChrdev(node.mode)){flags&=~512}if(flags&65536&&!FS.isDir(node.mode)){throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR)}if(!created){var err=FS.mayOpen(node,flags);if(err){throw new FS.ErrnoError(err)}}if(flags&512){FS.truncate(node,0)}flags&=~(128|512);var stream=FS.createStream({node:node,path:FS.getPath(node),flags:flags,seekable:true,position:0,stream_ops:node.stream_ops,ungotten:[],error:false},fd_start,fd_end);if(stream.stream_ops.open){stream.stream_ops.open(stream)}if(Module["logReadFiles"]&&!(flags&1)){if(!FS.readFiles)FS.readFiles={};if(!(path in FS.readFiles)){FS.readFiles[path]=1;Module["printErr"]("read file: "+path)}}try{if(FS.trackingDelegate["onOpenFile"]){var trackingFlags=0;if((flags&2097155)!==1){trackingFlags|=FS.tracking.openFlags.READ}if((flags&2097155)!==0){trackingFlags|=FS.tracking.openFlags.WRITE}FS.trackingDelegate["onOpenFile"](path,trackingFlags)}}catch(e){console.log("FS.trackingDelegate['onOpenFile']('"+path+"', flags) threw an exception: "+e.message)}return stream}),close:(function(stream){if(stream.getdents)stream.getdents=null;try{if(stream.stream_ops.close){stream.stream_ops.close(stream)}}catch(e){throw e}finally{FS.closeStream(stream.fd)}}),llseek:(function(stream,offset,whence){if(!stream.seekable||!stream.stream_ops.llseek){throw new FS.ErrnoError(ERRNO_CODES.ESPIPE)}stream.position=stream.stream_ops.llseek(stream,offset,whence);stream.ungotten=[];return stream.position}),read:(function(stream,buffer,offset,length,position){if(length<0||position<0){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}if((stream.flags&2097155)===1){throw new FS.ErrnoError(ERRNO_CODES.EBADF)}if(FS.isDir(stream.node.mode)){throw new FS.ErrnoError(ERRNO_CODES.EISDIR)}if(!stream.stream_ops.read){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}var seeking=true;if(typeof position==="undefined"){position=stream.position;seeking=false}else if(!stream.seekable){throw new FS.ErrnoError(ERRNO_CODES.ESPIPE)}var bytesRead=stream.stream_ops.read(stream,buffer,offset,length,position);if(!seeking)stream.position+=bytesRead;return bytesRead}),write:(function(stream,buffer,offset,length,position,canOwn){if(length<0||position<0){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}if((stream.flags&2097155)===0){throw new FS.ErrnoError(ERRNO_CODES.EBADF)}if(FS.isDir(stream.node.mode)){throw new FS.ErrnoError(ERRNO_CODES.EISDIR)}if(!stream.stream_ops.write){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}if(stream.flags&1024){FS.llseek(stream,0,2)}var seeking=true;if(typeof position==="undefined"){position=stream.position;seeking=false}else if(!stream.seekable){throw new FS.ErrnoError(ERRNO_CODES.ESPIPE)}var bytesWritten=stream.stream_ops.write(stream,buffer,offset,length,position,canOwn);if(!seeking)stream.position+=bytesWritten;try{if(stream.path&&FS.trackingDelegate["onWriteToFile"])FS.trackingDelegate["onWriteToFile"](stream.path)}catch(e){console.log("FS.trackingDelegate['onWriteToFile']('"+path+"') threw an exception: "+e.message)}return bytesWritten}),allocate:(function(stream,offset,length){if(offset<0||length<=0){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}if((stream.flags&2097155)===0){throw new FS.ErrnoError(ERRNO_CODES.EBADF)}if(!FS.isFile(stream.node.mode)&&!FS.isDir(node.mode)){throw new FS.ErrnoError(ERRNO_CODES.ENODEV)}if(!stream.stream_ops.allocate){throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP)}stream.stream_ops.allocate(stream,offset,length)}),mmap:(function(stream,buffer,offset,length,position,prot,flags){if((stream.flags&2097155)===1){throw new FS.ErrnoError(ERRNO_CODES.EACCES)}if(!stream.stream_ops.mmap){throw new FS.ErrnoError(ERRNO_CODES.ENODEV)}return stream.stream_ops.mmap(stream,buffer,offset,length,position,prot,flags)}),msync:(function(stream,buffer,offset,length,mmapFlags){if(!stream||!stream.stream_ops.msync){return 0}return stream.stream_ops.msync(stream,buffer,offset,length,mmapFlags)}),munmap:(function(stream){return 0}),ioctl:(function(stream,cmd,arg){if(!stream.stream_ops.ioctl){throw new FS.ErrnoError(ERRNO_CODES.ENOTTY)}return stream.stream_ops.ioctl(stream,cmd,arg)}),readFile:(function(path,opts){opts=opts||{};opts.flags=opts.flags||"r";opts.encoding=opts.encoding||"binary";if(opts.encoding!=="utf8"&&opts.encoding!=="binary"){throw new Error('Invalid encoding type "'+opts.encoding+'"')}var ret;var stream=FS.open(path,opts.flags);var stat=FS.stat(path);var length=stat.size;var buf=new Uint8Array(length);FS.read(stream,buf,0,length,0);if(opts.encoding==="utf8"){ret=UTF8ArrayToString(buf,0)}else if(opts.encoding==="binary"){ret=buf}FS.close(stream);return ret}),writeFile:(function(path,data,opts){opts=opts||{};opts.flags=opts.flags||"w";opts.encoding=opts.encoding||"utf8";if(opts.encoding!=="utf8"&&opts.encoding!=="binary"){throw new Error('Invalid encoding type "'+opts.encoding+'"')}var stream=FS.open(path,opts.flags,opts.mode);if(opts.encoding==="utf8"){var buf=new Uint8Array(lengthBytesUTF8(data)+1);var actualNumBytes=stringToUTF8Array(data,buf,0,buf.length);FS.write(stream,buf,0,actualNumBytes,0,opts.canOwn)}else if(opts.encoding==="binary"){FS.write(stream,data,0,data.length,0,opts.canOwn)}FS.close(stream)}),cwd:(function(){return FS.currentPath}),chdir:(function(path){var lookup=FS.lookupPath(path,{follow:true});if(!FS.isDir(lookup.node.mode)){throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR)}var err=FS.nodePermissions(lookup.node,"x");if(err){throw new FS.ErrnoError(err)}FS.currentPath=lookup.path}),createDefaultDirectories:(function(){FS.mkdir("/tmp");FS.mkdir("/home");FS.mkdir("/home/web_user")}),createDefaultDevices:(function(){FS.mkdir("/dev");FS.registerDevice(FS.makedev(1,3),{read:(function(){return 0}),write:(function(stream,buffer,offset,length,pos){return length})});FS.mkdev("/dev/null",FS.makedev(1,3));TTY.register(FS.makedev(5,0),TTY.default_tty_ops);TTY.register(FS.makedev(6,0),TTY.default_tty1_ops);FS.mkdev("/dev/tty",FS.makedev(5,0));FS.mkdev("/dev/tty1",FS.makedev(6,0));var random_device;if(typeof crypto!=="undefined"){var randomBuffer=new Uint8Array(1);random_device=(function(){crypto.getRandomValues(randomBuffer);return randomBuffer[0]})}else if(ENVIRONMENT_IS_NODE){random_device=(function(){return require("crypto").randomBytes(1)[0]})}else{random_device=(function(){return Math.random()*256|0})}FS.createDevice("/dev","random",random_device);FS.createDevice("/dev","urandom",random_device);FS.mkdir("/dev/shm");FS.mkdir("/dev/shm/tmp")}),createSpecialDirectories:(function(){FS.mkdir("/proc");FS.mkdir("/proc/self");FS.mkdir("/proc/self/fd");FS.mount({mount:(function(){var node=FS.createNode("/proc/self","fd",16384|511,73);node.node_ops={lookup:(function(parent,name){var fd=+name;var stream=FS.getStream(fd);if(!stream)throw new FS.ErrnoError(ERRNO_CODES.EBADF);var ret={parent:null,mount:{mountpoint:"fake"},node_ops:{readlink:(function(){return stream.path})}};ret.parent=ret;return ret})};return node})},{},"/proc/self/fd")}),createStandardStreams:(function(){if(Module["stdin"]){FS.createDevice("/dev","stdin",Module["stdin"])}else{FS.symlink("/dev/tty","/dev/stdin")}if(Module["stdout"]){FS.createDevice("/dev","stdout",null,Module["stdout"])}else{FS.symlink("/dev/tty","/dev/stdout")}if(Module["stderr"]){FS.createDevice("/dev","stderr",null,Module["stderr"])}else{FS.symlink("/dev/tty1","/dev/stderr")}var stdin=FS.open("/dev/stdin","r");assert(stdin.fd===0,"invalid handle for stdin ("+stdin.fd+")");var stdout=FS.open("/dev/stdout","w");assert(stdout.fd===1,"invalid handle for stdout ("+stdout.fd+")");var stderr=FS.open("/dev/stderr","w");assert(stderr.fd===2,"invalid handle for stderr ("+stderr.fd+")")}),ensureErrnoError:(function(){if(FS.ErrnoError)return;FS.ErrnoError=function ErrnoError(errno,node){this.node=node;this.setErrno=(function(errno){this.errno=errno;for(var key in ERRNO_CODES){if(ERRNO_CODES[key]===errno){this.code=key;break}}});this.setErrno(errno);this.message=ERRNO_MESSAGES[errno]};FS.ErrnoError.prototype=new Error;FS.ErrnoError.prototype.constructor=FS.ErrnoError;[ERRNO_CODES.ENOENT].forEach((function(code){FS.genericErrors[code]=new FS.ErrnoError(code);FS.genericErrors[code].stack="<generic error, no stack>"}))}),staticInit:(function(){FS.ensureErrnoError();FS.nameTable=new Array(4096);FS.mount(MEMFS,{},"/");FS.createDefaultDirectories();FS.createDefaultDevices();FS.createSpecialDirectories();FS.filesystems={"MEMFS":MEMFS,"IDBFS":IDBFS,"NODEFS":NODEFS,"WORKERFS":WORKERFS}}),init:(function(input,output,error){assert(!FS.init.initialized,"FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)");FS.init.initialized=true;FS.ensureErrnoError();Module["stdin"]=input||Module["stdin"];Module["stdout"]=output||Module["stdout"];Module["stderr"]=error||Module["stderr"];FS.createStandardStreams()}),quit:(function(){FS.init.initialized=false;var fflush=Module["_fflush"];if(fflush)fflush(0);for(var i=0;i<FS.streams.length;i++){var stream=FS.streams[i];if(!stream){continue}FS.close(stream)}}),getMode:(function(canRead,canWrite){var mode=0;if(canRead)mode|=292|73;if(canWrite)mode|=146;return mode}),joinPath:(function(parts,forceRelative){var path=PATH.join.apply(null,parts);if(forceRelative&&path[0]=="/")path=path.substr(1);return path}),absolutePath:(function(relative,base){return PATH.resolve(base,relative)}),standardizePath:(function(path){return PATH.normalize(path)}),findObject:(function(path,dontResolveLastLink){var ret=FS.analyzePath(path,dontResolveLastLink);if(ret.exists){return ret.object}else{___setErrNo(ret.error);return null}}),analyzePath:(function(path,dontResolveLastLink){try{var lookup=FS.lookupPath(path,{follow:!dontResolveLastLink});path=lookup.path}catch(e){}var ret={isRoot:false,exists:false,error:0,name:null,path:null,object:null,parentExists:false,parentPath:null,parentObject:null};try{var lookup=FS.lookupPath(path,{parent:true});ret.parentExists=true;ret.parentPath=lookup.path;ret.parentObject=lookup.node;ret.name=PATH.basename(path);lookup=FS.lookupPath(path,{follow:!dontResolveLastLink});ret.exists=true;ret.path=lookup.path;ret.object=lookup.node;ret.name=lookup.node.name;ret.isRoot=lookup.path==="/"}catch(e){ret.error=e.errno}return ret}),createFolder:(function(parent,name,canRead,canWrite){var path=PATH.join2(typeof parent==="string"?parent:FS.getPath(parent),name);var mode=FS.getMode(canRead,canWrite);return FS.mkdir(path,mode)}),createPath:(function(parent,path,canRead,canWrite){parent=typeof parent==="string"?parent:FS.getPath(parent);var parts=path.split("/").reverse();while(parts.length){var part=parts.pop();if(!part)continue;var current=PATH.join2(parent,part);try{FS.mkdir(current)}catch(e){}parent=current}return current}),createFile:(function(parent,name,properties,canRead,canWrite){var path=PATH.join2(typeof parent==="string"?parent:FS.getPath(parent),name);var mode=FS.getMode(canRead,canWrite);return FS.create(path,mode)}),createDataFile:(function(parent,name,data,canRead,canWrite,canOwn){var path=name?PATH.join2(typeof parent==="string"?parent:FS.getPath(parent),name):parent;var mode=FS.getMode(canRead,canWrite);var node=FS.create(path,mode);if(data){if(typeof data==="string"){var arr=new Array(data.length);for(var i=0,len=data.length;i<len;++i)arr[i]=data.charCodeAt(i);data=arr}FS.chmod(node,mode|146);var stream=FS.open(node,"w");FS.write(stream,data,0,data.length,0,canOwn);FS.close(stream);FS.chmod(node,mode)}return node}),createDevice:(function(parent,name,input,output){var path=PATH.join2(typeof parent==="string"?parent:FS.getPath(parent),name);var mode=FS.getMode(!!input,!!output);if(!FS.createDevice.major)FS.createDevice.major=64;var dev=FS.makedev(FS.createDevice.major++,0);FS.registerDevice(dev,{open:(function(stream){stream.seekable=false}),close:(function(stream){if(output&&output.buffer&&output.buffer.length){output(10)}}),read:(function(stream,buffer,offset,length,pos){var bytesRead=0;for(var i=0;i<length;i++){var result;try{result=input()}catch(e){throw new FS.ErrnoError(ERRNO_CODES.EIO)}if(result===undefined&&bytesRead===0){throw new FS.ErrnoError(ERRNO_CODES.EAGAIN)}if(result===null||result===undefined)break;bytesRead++;buffer[offset+i]=result}if(bytesRead){stream.node.timestamp=Date.now()}return bytesRead}),write:(function(stream,buffer,offset,length,pos){for(var i=0;i<length;i++){try{output(buffer[offset+i])}catch(e){throw new FS.ErrnoError(ERRNO_CODES.EIO)}}if(length){stream.node.timestamp=Date.now()}return i})});return FS.mkdev(path,mode,dev)}),createLink:(function(parent,name,target,canRead,canWrite){var path=PATH.join2(typeof parent==="string"?parent:FS.getPath(parent),name);return FS.symlink(target,path)}),forceLoadFile:(function(obj){if(obj.isDevice||obj.isFolder||obj.link||obj.contents)return true;var success=true;if(typeof XMLHttpRequest!=="undefined"){throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.")}else if(Module["read"]){try{obj.contents=intArrayFromString(Module["read"](obj.url),true);obj.usedBytes=obj.contents.length}catch(e){success=false}}else{throw new Error("Cannot load without read() or XMLHttpRequest.")}if(!success)___setErrNo(ERRNO_CODES.EIO);return success}),createLazyFile:(function(parent,name,url,canRead,canWrite){function LazyUint8Array(){this.lengthKnown=false;this.chunks=[]}LazyUint8Array.prototype.get=function LazyUint8Array_get(idx){if(idx>this.length-1||idx<0){return undefined}var chunkOffset=idx%this.chunkSize;var chunkNum=idx/this.chunkSize|0;return this.getter(chunkNum)[chunkOffset]};LazyUint8Array.prototype.setDataGetter=function LazyUint8Array_setDataGetter(getter){this.getter=getter};LazyUint8Array.prototype.cacheLength=function LazyUint8Array_cacheLength(){var xhr=new XMLHttpRequest;xhr.open("HEAD",url,false);xhr.send(null);if(!(xhr.status>=200&&xhr.status<300||xhr.status===304))throw new Error("Couldn't load "+url+". Status: "+xhr.status);var datalength=Number(xhr.getResponseHeader("Content-length"));var header;var hasByteServing=(header=xhr.getResponseHeader("Accept-Ranges"))&&header==="bytes";var chunkSize=1024*1024;if(!hasByteServing)chunkSize=datalength;var doXHR=(function(from,to){if(from>to)throw new Error("invalid range ("+from+", "+to+") or no bytes requested!");if(to>datalength-1)throw new Error("only "+datalength+" bytes available! programmer error!");var xhr=new XMLHttpRequest;xhr.open("GET",url,false);if(datalength!==chunkSize)xhr.setRequestHeader("Range","bytes="+from+"-"+to);if(typeof Uint8Array!="undefined")xhr.responseType="arraybuffer";if(xhr.overrideMimeType){xhr.overrideMimeType("text/plain; charset=x-user-defined")}xhr.send(null);if(!(xhr.status>=200&&xhr.status<300||xhr.status===304))throw new Error("Couldn't load "+url+". Status: "+xhr.status);if(xhr.response!==undefined){return new Uint8Array(xhr.response||[])}else{return intArrayFromString(xhr.responseText||"",true)}});var lazyArray=this;lazyArray.setDataGetter((function(chunkNum){var start=chunkNum*chunkSize;var end=(chunkNum+1)*chunkSize-1;end=Math.min(end,datalength-1);if(typeof lazyArray.chunks[chunkNum]==="undefined"){lazyArray.chunks[chunkNum]=doXHR(start,end)}if(typeof lazyArray.chunks[chunkNum]==="undefined")throw new Error("doXHR failed!");return lazyArray.chunks[chunkNum]}));this._length=datalength;this._chunkSize=chunkSize;this.lengthKnown=true};if(typeof XMLHttpRequest!=="undefined"){if(!ENVIRONMENT_IS_WORKER)throw"Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";var lazyArray=new LazyUint8Array;Object.defineProperty(lazyArray,"length",{get:(function(){if(!this.lengthKnown){this.cacheLength()}return this._length})});Object.defineProperty(lazyArray,"chunkSize",{get:(function(){if(!this.lengthKnown){this.cacheLength()}return this._chunkSize})});var properties={isDevice:false,contents:lazyArray}}else{var properties={isDevice:false,url:url}}var node=FS.createFile(parent,name,properties,canRead,canWrite);if(properties.contents){node.contents=properties.contents}else if(properties.url){node.contents=null;node.url=properties.url}Object.defineProperty(node,"usedBytes",{get:(function(){return this.contents.length})});var stream_ops={};var keys=Object.keys(node.stream_ops);keys.forEach((function(key){var fn=node.stream_ops[key];stream_ops[key]=function forceLoadLazyFile(){if(!FS.forceLoadFile(node)){throw new FS.ErrnoError(ERRNO_CODES.EIO)}return fn.apply(null,arguments)}}));stream_ops.read=function stream_ops_read(stream,buffer,offset,length,position){if(!FS.forceLoadFile(node)){throw new FS.ErrnoError(ERRNO_CODES.EIO)}var contents=stream.node.contents;if(position>=contents.length)return 0;var size=Math.min(contents.length-position,length);assert(size>=0);if(contents.slice){for(var i=0;i<size;i++){buffer[offset+i]=contents[position+i]}}else{for(var i=0;i<size;i++){buffer[offset+i]=contents.get(position+i)}}return size};node.stream_ops=stream_ops;return node}),createPreloadedFile:(function(parent,name,url,canRead,canWrite,onload,onerror,dontCreateFile,canOwn,preFinish){Browser.init();var fullname=name?PATH.resolve(PATH.join2(parent,name)):parent;var dep=getUniqueRunDependency("cp "+fullname);function processData(byteArray){function finish(byteArray){if(preFinish)preFinish();if(!dontCreateFile){FS.createDataFile(parent,name,byteArray,canRead,canWrite,canOwn)}if(onload)onload();removeRunDependency(dep)}var handled=false;Module["preloadPlugins"].forEach((function(plugin){if(handled)return;if(plugin["canHandle"](fullname)){plugin["handle"](byteArray,fullname,finish,(function(){if(onerror)onerror();removeRunDependency(dep)}));handled=true}}));if(!handled)finish(byteArray)}addRunDependency(dep);if(typeof url=="string"){Browser.asyncLoad(url,(function(byteArray){processData(byteArray)}),onerror)}else{processData(url)}}),indexedDB:(function(){return window.indexedDB||window.mozIndexedDB||window.webkitIndexedDB||window.msIndexedDB}),DB_NAME:(function(){return"EM_FS_"+window.location.pathname}),DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:(function(paths,onload,onerror){onload=onload||(function(){});onerror=onerror||(function(){});var indexedDB=FS.indexedDB();try{var openRequest=indexedDB.open(FS.DB_NAME(),FS.DB_VERSION)}catch(e){return onerror(e)}openRequest.onupgradeneeded=function openRequest_onupgradeneeded(){console.log("creating db");var db=openRequest.result;db.createObjectStore(FS.DB_STORE_NAME)};openRequest.onsuccess=function openRequest_onsuccess(){var db=openRequest.result;var transaction=db.transaction([FS.DB_STORE_NAME],"readwrite");var files=transaction.objectStore(FS.DB_STORE_NAME);var ok=0,fail=0,total=paths.length;function finish(){if(fail==0)onload();else onerror()}paths.forEach((function(path){var putRequest=files.put(FS.analyzePath(path).object.contents,path);putRequest.onsuccess=function putRequest_onsuccess(){ok++;if(ok+fail==total)finish()};putRequest.onerror=function putRequest_onerror(){fail++;if(ok+fail==total)finish()}}));transaction.onerror=onerror};openRequest.onerror=onerror}),loadFilesFromDB:(function(paths,onload,onerror){onload=onload||(function(){});onerror=onerror||(function(){});var indexedDB=FS.indexedDB();try{var openRequest=indexedDB.open(FS.DB_NAME(),FS.DB_VERSION)}catch(e){return onerror(e)}openRequest.onupgradeneeded=onerror;openRequest.onsuccess=function openRequest_onsuccess(){var db=openRequest.result;try{var transaction=db.transaction([FS.DB_STORE_NAME],"readonly")}catch(e){onerror(e);return}var files=transaction.objectStore(FS.DB_STORE_NAME);var ok=0,fail=0,total=paths.length;function finish(){if(fail==0)onload();else onerror()}paths.forEach((function(path){var getRequest=files.get(path);getRequest.onsuccess=function getRequest_onsuccess(){if(FS.analyzePath(path).exists){FS.unlink(path)}FS.createDataFile(PATH.dirname(path),PATH.basename(path),getRequest.result,true,true,true);ok++;if(ok+fail==total)finish()};getRequest.onerror=function getRequest_onerror(){fail++;if(ok+fail==total)finish()}}));transaction.onerror=onerror};openRequest.onerror=onerror})};var SYSCALLS={DEFAULT_POLLMASK:5,mappings:{},umask:511,calculateAt:(function(dirfd,path){if(path[0]!=="/"){var dir;if(dirfd===-100){dir=FS.cwd()}else{var dirstream=FS.getStream(dirfd);if(!dirstream)throw new FS.ErrnoError(ERRNO_CODES.EBADF);dir=dirstream.path}path=PATH.join2(dir,path)}return path}),doStat:(function(func,path,buf){try{var stat=func(path)}catch(e){if(e&&e.node&&PATH.normalize(path)!==PATH.normalize(FS.getPath(e.node))){return-ERRNO_CODES.ENOTDIR}throw e}HEAP32[buf>>2]=stat.dev;HEAP32[buf+4>>2]=0;HEAP32[buf+8>>2]=stat.ino;HEAP32[buf+12>>2]=stat.mode;HEAP32[buf+16>>2]=stat.nlink;HEAP32[buf+20>>2]=stat.uid;HEAP32[buf+24>>2]=stat.gid;HEAP32[buf+28>>2]=stat.rdev;HEAP32[buf+32>>2]=0;HEAP32[buf+36>>2]=stat.size;HEAP32[buf+40>>2]=4096;HEAP32[buf+44>>2]=stat.blocks;HEAP32[buf+48>>2]=stat.atime.getTime()/1e3|0;HEAP32[buf+52>>2]=0;HEAP32[buf+56>>2]=stat.mtime.getTime()/1e3|0;HEAP32[buf+60>>2]=0;HEAP32[buf+64>>2]=stat.ctime.getTime()/1e3|0;HEAP32[buf+68>>2]=0;HEAP32[buf+72>>2]=stat.ino;return 0}),doMsync:(function(addr,stream,len,flags){var buffer=new Uint8Array(HEAPU8.subarray(addr,addr+len));FS.msync(stream,buffer,0,len,flags)}),doMkdir:(function(path,mode){path=PATH.normalize(path);if(path[path.length-1]==="/")path=path.substr(0,path.length-1);FS.mkdir(path,mode,0);return 0}),doMknod:(function(path,mode,dev){switch(mode&61440){case 32768:case 8192:case 24576:case 4096:case 49152:break;default:return-ERRNO_CODES.EINVAL}FS.mknod(path,mode,dev);return 0}),doReadlink:(function(path,buf,bufsize){if(bufsize<=0)return-ERRNO_CODES.EINVAL;var ret=FS.readlink(path);ret=ret.slice(0,Math.max(0,bufsize));writeStringToMemory(ret,buf,true);return ret.length}),doAccess:(function(path,amode){if(amode&~7){return-ERRNO_CODES.EINVAL}var node;var lookup=FS.lookupPath(path,{follow:true});node=lookup.node;var perms="";if(amode&4)perms+="r";if(amode&2)perms+="w";if(amode&1)perms+="x";if(perms&&FS.nodePermissions(node,perms)){return-ERRNO_CODES.EACCES}return 0}),doDup:(function(path,flags,suggestFD){var suggest=FS.getStream(suggestFD);if(suggest)FS.close(suggest);return FS.open(path,flags,0,suggestFD,suggestFD).fd}),doReadv:(function(stream,iov,iovcnt,offset){var ret=0;for(var i=0;i<iovcnt;i++){var ptr=HEAP32[iov+i*8>>2];var len=HEAP32[iov+(i*8+4)>>2];var curr=FS.read(stream,HEAP8,ptr,len,offset);if(curr<0)return-1;ret+=curr;if(curr<len)break}return ret}),doWritev:(function(stream,iov,iovcnt,offset){var ret=0;for(var i=0;i<iovcnt;i++){var ptr=HEAP32[iov+i*8>>2];var len=HEAP32[iov+(i*8+4)>>2];var curr=FS.write(stream,HEAP8,ptr,len,offset);if(curr<0)return-1;ret+=curr}return ret}),varargs:0,get:(function(varargs){SYSCALLS.varargs+=4;var ret=HEAP32[SYSCALLS.varargs-4>>2];return ret}),getStr:(function(){var ret=Pointer_stringify(SYSCALLS.get());return ret}),getStreamFromFD:(function(){var stream=FS.getStream(SYSCALLS.get());if(!stream)throw new FS.ErrnoError(ERRNO_CODES.EBADF);return stream}),getSocketFromFD:(function(){var socket=SOCKFS.getSocket(SYSCALLS.get());if(!socket)throw new FS.ErrnoError(ERRNO_CODES.EBADF);return socket}),getSocketAddress:(function(allowNull){var addrp=SYSCALLS.get(),addrlen=SYSCALLS.get();if(allowNull&&addrp===0)return null;var info=__read_sockaddr(addrp,addrlen);if(info.errno)throw new FS.ErrnoError(info.errno);info.addr=DNS.lookup_addr(info.addr)||info.addr;return info}),get64:(function(){var low=SYSCALLS.get(),high=SYSCALLS.get();if(low>=0)assert(high===0);else assert(high===-1);return low}),getZero:(function(){assert(SYSCALLS.get()===0)})};function ___syscall5(which,varargs){SYSCALLS.varargs=varargs;try{var pathname=SYSCALLS.getStr(),flags=SYSCALLS.get(),mode=SYSCALLS.get();var stream=FS.open(pathname,flags,mode);return stream.fd}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}function _emscripten_memcpy_big(dest,src,num){HEAPU8.set(HEAPU8.subarray(src,src+num),dest);return dest}Module["_memcpy"]=_memcpy;function ___syscall6(which,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD();FS.close(stream);return 0}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}var _cos=Math_cos;function _sbrk(bytes){var self=_sbrk;if(!self.called){DYNAMICTOP=alignMemoryPage(DYNAMICTOP);self.called=true;assert(Runtime.dynamicAlloc);self.alloc=Runtime.dynamicAlloc;Runtime.dynamicAlloc=(function(){abort("cannot dynamically allocate, sbrk now has control")})}var ret=DYNAMICTOP;if(bytes!=0){var success=self.alloc(bytes);if(!success)return-1>>>0}return ret}var _BItoD=true;function ___syscall54(which,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD(),op=SYSCALLS.get();switch(op){case 21505:{if(!stream.tty)return-ERRNO_CODES.ENOTTY;return 0};case 21506:{if(!stream.tty)return-ERRNO_CODES.ENOTTY;return 0};case 21519:{if(!stream.tty)return-ERRNO_CODES.ENOTTY;var argp=SYSCALLS.get();HEAP32[argp>>2]=0;return 0};case 21520:{if(!stream.tty)return-ERRNO_CODES.ENOTTY;return-ERRNO_CODES.EINVAL};case 21531:{var argp=SYSCALLS.get();return FS.ioctl(stream,op,argp)};default:abort("bad ioctl syscall "+op)}}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}var _ceilf=Math_ceil;function __embind_register_memory_view(rawType,dataTypeIndex,name){var typeMapping=[Int8Array,Uint8Array,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array];var TA=typeMapping[dataTypeIndex];function decodeMemoryView(handle){handle=handle>>2;var heap=HEAPU32;var size=heap[handle];var data=heap[handle+1];return new TA(heap["buffer"],data,size)}name=readLatin1String(name);registerType(rawType,{name:name,"fromWireType":decodeMemoryView,"argPackAdvance":8,"readValueFromPointer":decodeMemoryView},{ignoreDuplicateRegistrations:true})}function _time(ptr){var ret=Date.now()/1e3|0;if(ptr){HEAP32[ptr>>2]=ret}return ret}function _pthread_self(){return 0}function ___syscall140(which,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD(),offset_high=SYSCALLS.get(),offset_low=SYSCALLS.get(),result=SYSCALLS.get(),whence=SYSCALLS.get();var offset=offset_low;assert(offset_high===0);FS.llseek(stream,offset,whence);HEAP32[result>>2]=stream.position;if(stream.getdents&&offset===0&&whence===0)stream.getdents=null;return 0}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}function ___syscall146(which,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD(),iov=SYSCALLS.get(),iovcnt=SYSCALLS.get();return SYSCALLS.doWritev(stream,iov,iovcnt)}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}function ___syscall221(which,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD(),cmd=SYSCALLS.get();switch(cmd){case 0:{var arg=SYSCALLS.get();if(arg<0){return-ERRNO_CODES.EINVAL}var newStream;newStream=FS.open(stream.path,stream.flags,0,arg);return newStream.fd};case 1:case 2:return 0;case 3:return stream.flags;case 4:{var arg=SYSCALLS.get();stream.flags|=arg;return 0};case 12:case 12:{var arg=SYSCALLS.get();var offset=0;HEAP16[arg+offset>>1]=2;return 0};case 13:case 14:case 13:case 14:return 0;case 16:case 8:return-ERRNO_CODES.EINVAL;case 9:___setErrNo(ERRNO_CODES.EINVAL);return-1;default:{return-ERRNO_CODES.EINVAL}}}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}function ___syscall145(which,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD(),iov=SYSCALLS.get(),iovcnt=SYSCALLS.get();return SYSCALLS.doReadv(stream,iov,iovcnt)}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}var ___dso_handle=allocate(1,"i32*",ALLOC_STATIC);embind_init_charCodes();BindingError=Module["BindingError"]=extendError(Error,"BindingError");InternalError=Module["InternalError"]=extendError(Error,"InternalError");init_emval();UnboundTypeError=Module["UnboundTypeError"]=extendError(Error,"UnboundTypeError");FS.staticInit();__ATINIT__.unshift((function(){if(!Module["noFSInit"]&&!FS.init.initialized)FS.init()}));__ATMAIN__.push((function(){FS.ignorePermissions=false}));__ATEXIT__.push((function(){FS.quit()}));Module["FS_createFolder"]=FS.createFolder;Module["FS_createPath"]=FS.createPath;Module["FS_createDataFile"]=FS.createDataFile;Module["FS_createPreloadedFile"]=FS.createPreloadedFile;Module["FS_createLazyFile"]=FS.createLazyFile;Module["FS_createLink"]=FS.createLink;Module["FS_createDevice"]=FS.createDevice;Module["FS_unlink"]=FS.unlink;__ATINIT__.unshift((function(){TTY.init()}));__ATEXIT__.push((function(){TTY.shutdown()}));if(ENVIRONMENT_IS_NODE){var fs=require("fs");var NODEJS_PATH=require("path");NODEFS.staticInit()}STACK_BASE=STACKTOP=Runtime.alignMemory(STATICTOP);staticSealed=true;STACK_MAX=STACK_BASE+TOTAL_STACK;DYNAMIC_BASE=DYNAMICTOP=Runtime.alignMemory(STACK_MAX);assert(DYNAMIC_BASE<TOTAL_MEMORY,"TOTAL_MEMORY not big enough for stack");var cttz_i8=allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0],"i8",ALLOC_DYNAMIC);function invoke_iiii(index,a1,a2,a3){try{return Module["dynCall_iiii"](index,a1,a2,a3)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_viiiii(index,a1,a2,a3,a4,a5){try{Module["dynCall_viiiii"](index,a1,a2,a3,a4,a5)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_dii(index,a1,a2){try{return Module["dynCall_dii"](index,a1,a2)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_vid(index,a1,a2){try{Module["dynCall_vid"](index,a1,a2)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_di(index,a1){try{return Module["dynCall_di"](index,a1)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_i(index){try{return Module["dynCall_i"](index)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_vi(index,a1){try{Module["dynCall_vi"](index,a1)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_vii(index,a1,a2){try{Module["dynCall_vii"](index,a1,a2)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_ii(index,a1){try{return Module["dynCall_ii"](index,a1)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_viii(index,a1,a2,a3){try{Module["dynCall_viii"](index,a1,a2,a3)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_v(index){try{Module["dynCall_v"](index)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_viid(index,a1,a2,a3){try{Module["dynCall_viid"](index,a1,a2,a3)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_iiiii(index,a1,a2,a3,a4){try{return Module["dynCall_iiiii"](index,a1,a2,a3,a4)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_viiiiii(index,a1,a2,a3,a4,a5,a6){try{Module["dynCall_viiiiii"](index,a1,a2,a3,a4,a5,a6)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_iii(index,a1,a2){try{return Module["dynCall_iii"](index,a1,a2)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}function invoke_viiii(index,a1,a2,a3,a4){try{Module["dynCall_viiii"](index,a1,a2,a3,a4)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;asm["setThrew"](1,0)}}Module.asmGlobalArg={"Math":Math,"Int8Array":Int8Array,"Int16Array":Int16Array,"Int32Array":Int32Array,"Uint8Array":Uint8Array,"Uint16Array":Uint16Array,"Uint32Array":Uint32Array,"Float32Array":Float32Array,"Float64Array":Float64Array,"NaN":NaN,"Infinity":Infinity};Module.asmLibraryArg={"abort":abort,"assert":assert,"invoke_iiii":invoke_iiii,"invoke_viiiii":invoke_viiiii,"invoke_dii":invoke_dii,"invoke_vid":invoke_vid,"invoke_di":invoke_di,"invoke_i":invoke_i,"invoke_vi":invoke_vi,"invoke_vii":invoke_vii,"invoke_ii":invoke_ii,"invoke_viii":invoke_viii,"invoke_v":invoke_v,"invoke_viid":invoke_viid,"invoke_iiiii":invoke_iiiii,"invoke_viiiiii":invoke_viiiiii,"invoke_iii":invoke_iii,"invoke_viiii":invoke_viiii,"_fabs":_fabs,"___syscall221":___syscall221,"_sin":_sin,"floatReadValueFromPointer":floatReadValueFromPointer,"simpleReadValueFromPointer":simpleReadValueFromPointer,"integerReadValueFromPointer":integerReadValueFromPointer,"__embind_register_memory_view":__embind_register_memory_view,"throwInternalError":throwInternalError,"get_first_emval":get_first_emval,"_abort":_abort,"count_emval_handles":count_emval_handles,"_pthread_cleanup_push":_pthread_cleanup_push,"__embind_register_integer":__embind_register_integer,"extendError":extendError,"___assert_fail":___assert_fail,"init_emval":init_emval,"__embind_register_void":__embind_register_void,"___cxa_find_matching_catch":___cxa_find_matching_catch,"_ceilf":_ceilf,"getShiftFromSize":getShiftFromSize,"__embind_register_function":__embind_register_function,"embind_init_charCodes":embind_init_charCodes,"_emscripten_asm_const_33":_emscripten_asm_const_33,"throwBindingError":throwBindingError,"___setErrNo":___setErrNo,"__emval_register":__emval_register,"_sbrk":_sbrk,"readLatin1String":readLatin1String,"___cxa_allocate_exception":___cxa_allocate_exception,"_emscripten_memcpy_big":_emscripten_memcpy_big,"__embind_register_bool":__embind_register_bool,"___resumeException":___resumeException,"__ZSt18uncaught_exceptionv":__ZSt18uncaught_exceptionv,"_sysconf":_sysconf,"_embind_repr":_embind_repr,"__embind_register_std_wstring":__embind_register_std_wstring,"createNamedFunction":createNamedFunction,"__embind_register_emval":__embind_register_emval,"_cos":_cos,"throwUnboundTypeError":throwUnboundTypeError,"_pthread_self":_pthread_self,"craftInvokerFunction":craftInvokerFunction,"__emval_decref":__emval_decref,"_sqrt":_sqrt,"__embind_register_float":__embind_register_float,"makeLegalFunctionName":makeLegalFunctionName,"___syscall54":___syscall54,"___unlock":___unlock,"heap32VectorToArray":heap32VectorToArray,"_pthread_cleanup_pop":_pthread_cleanup_pop,"whenDependentTypesAreResolved":whenDependentTypesAreResolved,"_exit":_exit,"__embind_register_std_string":__embind_register_std_string,"new_":new_,"___cxa_atexit":___cxa_atexit,"registerType":registerType,"___cxa_throw":___cxa_throw,"__exit":__exit,"___lock":___lock,"___syscall6":___syscall6,"___syscall5":___syscall5,"ensureOverloadTable":ensureOverloadTable,"__embind_register_constant":__embind_register_constant,"_time":_time,"requireFunction":requireFunction,"runDestructors":runDestructors,"getTypeName":getTypeName,"_atexit":_atexit,"___syscall140":___syscall140,"exposePublicSymbol":exposePublicSymbol,"_emscripten_asm_const_5":_emscripten_asm_const_5,"_emscripten_asm_const_4":_emscripten_asm_const_4,"replacePublicSymbol":replacePublicSymbol,"___syscall145":___syscall145,"___syscall146":___syscall146,"STACKTOP":STACKTOP,"STACK_MAX":STACK_MAX,"tempDoublePtr":tempDoublePtr,"ABORT":ABORT,"cttz_i8":cttz_i8,"___dso_handle":___dso_handle};// EMSCRIPTEN_START_ASM
var asm=(function(global,env,buffer) {
"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env.cttz_i8|0;var n=env.___dso_handle|0;var o=0;var p=0;var q=0;var r=0;var s=global.NaN,t=global.Infinity;var u=0,v=0,w=0,x=0,y=0.0,z=0,A=0,B=0,C=0.0;var D=0;var E=0;var F=0;var G=0;var H=0;var I=0;var J=0;var K=0;var L=0;var M=0;var N=global.Math.floor;var O=global.Math.abs;var P=global.Math.sqrt;var Q=global.Math.pow;var R=global.Math.cos;var S=global.Math.sin;var T=global.Math.tan;var U=global.Math.acos;var V=global.Math.asin;var W=global.Math.atan;var X=global.Math.atan2;var Y=global.Math.exp;var Z=global.Math.log;var _=global.Math.ceil;var $=global.Math.imul;var aa=global.Math.min;var ba=global.Math.clz32;var ca=env.abort;var da=env.assert;var ea=env.invoke_iiii;var fa=env.invoke_viiiii;var ga=env.invoke_dii;var ha=env.invoke_vid;var ia=env.invoke_di;var ja=env.invoke_i;var ka=env.invoke_vi;var la=env.invoke_vii;var ma=env.invoke_ii;var na=env.invoke_viii;var oa=env.invoke_v;var pa=env.invoke_viid;var qa=env.invoke_iiiii;var ra=env.invoke_viiiiii;var sa=env.invoke_iii;var ta=env.invoke_viiii;var ua=env._fabs;var va=env.___syscall221;var wa=env._sin;var xa=env.floatReadValueFromPointer;var ya=env.simpleReadValueFromPointer;var za=env.integerReadValueFromPointer;var Aa=env.__embind_register_memory_view;var Ba=env.throwInternalError;var Ca=env.get_first_emval;var Da=env._abort;var Ea=env.count_emval_handles;var Fa=env._pthread_cleanup_push;var Ga=env.__embind_register_integer;var Ha=env.extendError;var Ia=env.___assert_fail;var Ja=env.init_emval;var Ka=env.__embind_register_void;var La=env.___cxa_find_matching_catch;var Ma=env._ceilf;var Na=env.getShiftFromSize;var Oa=env.__embind_register_function;var Pa=env.embind_init_charCodes;var Qa=env._emscripten_asm_const_33;var Ra=env.throwBindingError;var Sa=env.___setErrNo;var Ta=env.__emval_register;var Ua=env._sbrk;var Va=env.readLatin1String;var Wa=env.___cxa_allocate_exception;var Xa=env._emscripten_memcpy_big;var Ya=env.__embind_register_bool;var Za=env.___resumeException;var _a=env.__ZSt18uncaught_exceptionv;var $a=env._sysconf;var ab=env._embind_repr;var bb=env.__embind_register_std_wstring;var cb=env.createNamedFunction;var db=env.__embind_register_emval;var eb=env._cos;var fb=env.throwUnboundTypeError;var gb=env._pthread_self;var hb=env.craftInvokerFunction;var ib=env.__emval_decref;var jb=env._sqrt;var kb=env.__embind_register_float;var lb=env.makeLegalFunctionName;var mb=env.___syscall54;var nb=env.___unlock;var ob=env.heap32VectorToArray;var pb=env._pthread_cleanup_pop;var qb=env.whenDependentTypesAreResolved;var rb=env._exit;var sb=env.__embind_register_std_string;var tb=env.new_;var ub=env.___cxa_atexit;var vb=env.registerType;var wb=env.___cxa_throw;var xb=env.__exit;var yb=env.___lock;var zb=env.___syscall6;var Ab=env.___syscall5;var Bb=env.ensureOverloadTable;var Cb=env.__embind_register_constant;var Db=env._time;var Eb=env.requireFunction;var Fb=env.runDestructors;var Gb=env.getTypeName;var Hb=env._atexit;var Ib=env.___syscall140;var Jb=env.exposePublicSymbol;var Kb=env._emscripten_asm_const_5;var Lb=env._emscripten_asm_const_4;var Mb=env.replacePublicSymbol;var Nb=env.___syscall145;var Ob=env.___syscall146;var Pb=0.0;
// EMSCRIPTEN_START_FUNCS
function dd(e,f,g,j,k){e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;F=i;i=i+16|0;B=F;D=(f|0)/2|0;E=(g|0)/2|0;o=c[k>>2]|0;A=E+-1|0;if((f|0)>1){l=0;m=o;n=o+(($(A,D)|0)<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(D|0))break;else{m=m+2|0;n=n+2|0}}}z=D+-1|0;if((g|0)>1){l=0;m=o;n=o+(z<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(E|0))break;else{m=m+(D<<1)|0;n=n+(D<<1)|0}}}n=k+1179664|0;m=D+1|0;w=0-D|0;u=1-D|0;v=~D;t=f+4|0;a:do if((A|0)>1){x=(z|0)>1;l=(c[k+4>>2]|0)+m|0;y=1;g=e+((f<<1)+2)|0;e=o+(m<<1)|0;m=0;b:while(1){if(x){s=1;r=g;q=m;while(1){do if((d[r>>0]|0|0)>(j|0)){b[e>>1]=0;a[l>>0]=0;m=q}else{a[l>>0]=-1;m=b[e+(w<<1)>>1]|0;if(m<<16>>16>0){b[e>>1]=m;m=(m<<16>>16)*7|0;p=k+1310736+(m+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=k+1310736+(m+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=k+1310736+(m+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+y;c[k+1310736+(m+-1<<2)>>2]=y;m=q;break}f=b[e+(u<<1)>>1]|0;o=f<<16>>16;m=b[e+(v<<1)>>1]|0;p=m<<16>>16;g=m<<16>>16>0;if(f<<16>>16<=0){if(g){b[e>>1]=m;m=p*7|0;g=k+1310736+(m+-7<<2)|0;c[g>>2]=(c[g>>2]|0)+1;g=k+1310736+(m+-6<<2)|0;c[g>>2]=(c[g>>2]|0)+s;g=k+1310736+(m+-5<<2)|0;c[g>>2]=(c[g>>2]|0)+y;g=k+1310736+(m+-3<<2)|0;if((c[g>>2]|0)<(s|0))c[g>>2]=s;c[k+1310736+(m+-1<<2)>>2]=y;m=q;break}m=b[e+-2>>1]|0;if(m<<16>>16>0){b[e>>1]=m;m=(m<<16>>16)*7|0;p=k+1310736+(m+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=k+1310736+(m+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=k+1310736+(m+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+y;m=k+1310736+(m+-3<<2)|0;if((c[m>>2]|0)>=(s|0)){m=q;break}c[m>>2]=s;m=q;break}else{m=q+1|0;if((q|0)>32767)break b;b[e>>1]=m;c[k+1179664+(q<<2)>>2]=m<<16>>16;q=q*7|0;c[k+1310736+(q<<2)>>2]=1;c[k+1310736+(q+1<<2)>>2]=s;c[k+1310736+(q+2<<2)>>2]=y;c[k+1310736+(q+3<<2)>>2]=s;c[k+1310736+(q+4<<2)>>2]=s;c[k+1310736+(q+5<<2)>>2]=y;c[k+1310736+(q+6<<2)>>2]=y;break}}if(g){m=c[k+1179664+(o+-1<<2)>>2]|0;o=c[k+1179664+(p+-1<<2)>>2]|0;if((m|0)>(o|0)){b[e>>1]=o;if((q|0)>0){g=0;f=n;while(1){if((c[f>>2]|0)==(m|0))c[f>>2]=o;g=g+1|0;if((g|0)>=(q|0)){m=o;break}else f=f+4|0}}else m=o}else{b[e>>1]=m;if((m|0)<(o|0)&(q|0)>0){g=0;f=n;while(1){if((c[f>>2]|0)==(o|0))c[f>>2]=m;g=g+1|0;if((g|0)>=(q|0))break;else f=f+4|0}}}m=(m<<16>>16)*7|0;p=k+1310736+(m+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=k+1310736+(m+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=k+1310736+(m+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+y;c[k+1310736+(m+-1<<2)>>2]=y;m=q;break}g=b[e+-2>>1]|0;if(g<<16>>16<=0){b[e>>1]=f;m=o*7|0;g=k+1310736+(m+-7<<2)|0;c[g>>2]=(c[g>>2]|0)+1;g=k+1310736+(m+-6<<2)|0;c[g>>2]=(c[g>>2]|0)+s;g=k+1310736+(m+-5<<2)|0;c[g>>2]=(c[g>>2]|0)+y;g=k+1310736+(m+-4<<2)|0;if((c[g>>2]|0)>(s|0))c[g>>2]=s;c[k+1310736+(m+-1<<2)>>2]=y;m=q;break}m=c[k+1179664+(o+-1<<2)>>2]|0;o=c[k+1179664+((g<<16>>16)+-1<<2)>>2]|0;if((m|0)>(o|0)){b[e>>1]=o;if((q|0)>0){g=0;f=n;while(1){if((c[f>>2]|0)==(m|0))c[f>>2]=o;g=g+1|0;if((g|0)>=(q|0)){m=o;break}else f=f+4|0}}else m=o}else{b[e>>1]=m;if((m|0)<(o|0)&(q|0)>0){g=0;f=n;while(1){if((c[f>>2]|0)==(o|0))c[f>>2]=m;g=g+1|0;if((g|0)>=(q|0))break;else f=f+4|0}}}m=(m<<16>>16)*7|0;p=k+1310736+(m+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=k+1310736+(m+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;m=k+1310736+(m+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+y;m=q}while(0);s=s+1|0;g=r+2|0;e=e+2|0;l=l+1|0;if((s|0)>=(z|0))break;else{r=g;q=m}}}y=y+1|0;if((y|0)>=(A|0)){o=m;C=52;break a}else{l=l+2|0;g=g+t|0;e=e+4|0}}Me(3,3904,B);l=-1}else{o=0;C=52}while(0);if((C|0)==52){e=k+12|0;if((o|0)<1)m=1;else{g=1;m=1;while(1){l=c[n>>2]|0;if((l|0)==(g|0)){l=m;m=m+1|0}else l=c[k+1179664+(l+-1<<2)>>2]|0;c[n>>2]=l;if((g|0)<(o|0)){g=g+1|0;n=n+4|0}else break}}f=k+8|0;l=m+-1|0;c[f>>2]=l;if(l){ek(e|0,0,l<<2|0)|0;ek(k+655376|0,0,l<<4|0)|0;if((m|0)>1){l=0;do{C=l<<2;c[k+131084+(C<<2)>>2]=D;c[k+131084+((C|1)<<2)>>2]=0;c[k+131084+((C|2)<<2)>>2]=E;c[k+131084+((C|3)<<2)>>2]=0;l=l+1|0}while((l|0)<(c[f>>2]|0))}if((o|0)>0){e=0;do{n=(c[k+1179664+(e<<2)>>2]|0)+-1|0;g=e*7|0;l=k+12+(n<<2)|0;c[l>>2]=(c[l>>2]|0)+(c[k+1310736+(g<<2)>>2]|0);l=n<<1;m=k+655376+(l<<3)|0;h[m>>3]=+h[m>>3]+ +(c[k+1310736+(g+1<<2)>>2]|0);l=k+655376+((l|1)<<3)|0;h[l>>3]=+h[l>>3]+ +(c[k+1310736+(g+2<<2)>>2]|0);n=n<<2;l=k+131084+(n<<2)|0;m=c[k+1310736+(g+3<<2)>>2]|0;if((c[l>>2]|0)>(m|0))c[l>>2]=m;l=k+131084+((n|1)<<2)|0;m=c[k+1310736+(g+4<<2)>>2]|0;if((c[l>>2]|0)<(m|0))c[l>>2]=m;l=k+131084+((n|2)<<2)|0;m=c[k+1310736+(g+5<<2)>>2]|0;if((c[l>>2]|0)>(m|0))c[l>>2]=m;m=k+131084+((n|3)<<2)|0;l=c[k+1310736+(g+6<<2)>>2]|0;if((c[m>>2]|0)<(l|0))c[m>>2]=l;e=e+1|0}while((e|0)<(o|0))}if((c[f>>2]|0)>0){l=0;do{D=k+12+(l<<2)|0;E=l<<1;C=k+655376+(E<<3)|0;h[C>>3]=+h[C>>3]/+(c[D>>2]|0);E=k+655376+((E|1)<<3)|0;h[E>>3]=+h[E>>3]/+(c[D>>2]|0);l=l+1|0}while((l|0)<(c[f>>2]|0));l=0}else l=0}else l=0}i=F;return l|0}function ed(e,f,g,j,k){e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;F=i;i=i+16|0;B=F;D=(f|0)/2|0;E=(g|0)/2|0;o=c[k>>2]|0;A=E+-1|0;if((f|0)>1){l=0;m=o;n=o+(($(A,D)|0)<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(D|0))break;else{m=m+2|0;n=n+2|0}}}z=D+-1|0;if((g|0)>1){l=0;m=o;n=o+(z<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(E|0))break;else{m=m+(D<<1)|0;n=n+(D<<1)|0}}}n=k+1179664|0;m=D+1|0;w=0-D|0;u=1-D|0;v=~D;t=(f<<1)+8|0;a:do if((A|0)>1){x=(z|0)>1;l=(c[k+4>>2]|0)+m|0;y=1;g=e+((f<<2)+4)|0;e=o+(m<<1)|0;m=0;b:while(1){if(x){s=1;r=g;q=m;while(1){do if((d[r+1>>0]|0|0)>(j|0)){b[e>>1]=0;a[l>>0]=0;m=q}else{a[l>>0]=-1;m=b[e+(w<<1)>>1]|0;if(m<<16>>16>0){b[e>>1]=m;m=(m<<16>>16)*7|0;p=k+1310736+(m+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=k+1310736+(m+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=k+1310736+(m+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+y;c[k+1310736+(m+-1<<2)>>2]=y;m=q;break}f=b[e+(u<<1)>>1]|0;o=f<<16>>16;m=b[e+(v<<1)>>1]|0;p=m<<16>>16;g=m<<16>>16>0;if(f<<16>>16<=0){if(g){b[e>>1]=m;m=p*7|0;g=k+1310736+(m+-7<<2)|0;c[g>>2]=(c[g>>2]|0)+1;g=k+1310736+(m+-6<<2)|0;c[g>>2]=(c[g>>2]|0)+s;g=k+1310736+(m+-5<<2)|0;c[g>>2]=(c[g>>2]|0)+y;g=k+1310736+(m+-3<<2)|0;if((c[g>>2]|0)<(s|0))c[g>>2]=s;c[k+1310736+(m+-1<<2)>>2]=y;m=q;break}m=b[e+-2>>1]|0;if(m<<16>>16>0){b[e>>1]=m;m=(m<<16>>16)*7|0;p=k+1310736+(m+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=k+1310736+(m+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=k+1310736+(m+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+y;m=k+1310736+(m+-3<<2)|0;if((c[m>>2]|0)>=(s|0)){m=q;break}c[m>>2]=s;m=q;break}else{m=q+1|0;if((q|0)>32767)break b;b[e>>1]=m;c[k+1179664+(q<<2)>>2]=m<<16>>16;q=q*7|0;c[k+1310736+(q<<2)>>2]=1;c[k+1310736+(q+1<<2)>>2]=s;c[k+1310736+(q+2<<2)>>2]=y;c[k+1310736+(q+3<<2)>>2]=s;c[k+1310736+(q+4<<2)>>2]=s;c[k+1310736+(q+5<<2)>>2]=y;c[k+1310736+(q+6<<2)>>2]=y;break}}if(g){m=c[k+1179664+(o+-1<<2)>>2]|0;o=c[k+1179664+(p+-1<<2)>>2]|0;if((m|0)>(o|0)){b[e>>1]=o;if((q|0)>0){g=0;f=n;while(1){if((c[f>>2]|0)==(m|0))c[f>>2]=o;g=g+1|0;if((g|0)>=(q|0)){m=o;break}else f=f+4|0}}else m=o}else{b[e>>1]=m;if((m|0)<(o|0)&(q|0)>0){g=0;f=n;while(1){if((c[f>>2]|0)==(o|0))c[f>>2]=m;g=g+1|0;if((g|0)>=(q|0))break;else f=f+4|0}}}m=(m<<16>>16)*7|0;p=k+1310736+(m+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=k+1310736+(m+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=k+1310736+(m+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+y;c[k+1310736+(m+-1<<2)>>2]=y;m=q;break}g=b[e+-2>>1]|0;if(g<<16>>16<=0){b[e>>1]=f;m=o*7|0;g=k+1310736+(m+-7<<2)|0;c[g>>2]=(c[g>>2]|0)+1;g=k+1310736+(m+-6<<2)|0;c[g>>2]=(c[g>>2]|0)+s;g=k+1310736+(m+-5<<2)|0;c[g>>2]=(c[g>>2]|0)+y;g=k+1310736+(m+-4<<2)|0;if((c[g>>2]|0)>(s|0))c[g>>2]=s;c[k+1310736+(m+-1<<2)>>2]=y;m=q;break}m=c[k+1179664+(o+-1<<2)>>2]|0;o=c[k+1179664+((g<<16>>16)+-1<<2)>>2]|0;if((m|0)>(o|0)){b[e>>1]=o;if((q|0)>0){g=0;f=n;while(1){if((c[f>>2]|0)==(m|0))c[f>>2]=o;g=g+1|0;if((g|0)>=(q|0)){m=o;break}else f=f+4|0}}else m=o}else{b[e>>1]=m;if((m|0)<(o|0)&(q|0)>0){g=0;f=n;while(1){if((c[f>>2]|0)==(o|0))c[f>>2]=m;g=g+1|0;if((g|0)>=(q|0))break;else f=f+4|0}}}m=(m<<16>>16)*7|0;p=k+1310736+(m+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=k+1310736+(m+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;m=k+1310736+(m+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+y;m=q}while(0);s=s+1|0;g=r+4|0;e=e+2|0;l=l+1|0;if((s|0)>=(z|0))break;else{r=g;q=m}}}y=y+1|0;if((y|0)>=(A|0)){o=m;C=52;break a}else{l=l+2|0;g=g+t|0;e=e+4|0}}Me(3,3904,B);l=-1}else{o=0;C=52}while(0);if((C|0)==52){e=k+12|0;if((o|0)<1)m=1;else{g=1;m=1;while(1){l=c[n>>2]|0;if((l|0)==(g|0)){l=m;m=m+1|0}else l=c[k+1179664+(l+-1<<2)>>2]|0;c[n>>2]=l;if((g|0)<(o|0)){g=g+1|0;n=n+4|0}else break}}f=k+8|0;l=m+-1|0;c[f>>2]=l;if(l){ek(e|0,0,l<<2|0)|0;ek(k+655376|0,0,l<<4|0)|0;if((m|0)>1){l=0;do{C=l<<2;c[k+131084+(C<<2)>>2]=D;c[k+131084+((C|1)<<2)>>2]=0;c[k+131084+((C|2)<<2)>>2]=E;c[k+131084+((C|3)<<2)>>2]=0;l=l+1|0}while((l|0)<(c[f>>2]|0))}if((o|0)>0){e=0;do{n=(c[k+1179664+(e<<2)>>2]|0)+-1|0;g=e*7|0;l=k+12+(n<<2)|0;c[l>>2]=(c[l>>2]|0)+(c[k+1310736+(g<<2)>>2]|0);l=n<<1;m=k+655376+(l<<3)|0;h[m>>3]=+h[m>>3]+ +(c[k+1310736+(g+1<<2)>>2]|0);l=k+655376+((l|1)<<3)|0;h[l>>3]=+h[l>>3]+ +(c[k+1310736+(g+2<<2)>>2]|0);n=n<<2;l=k+131084+(n<<2)|0;m=c[k+1310736+(g+3<<2)>>2]|0;if((c[l>>2]|0)>(m|0))c[l>>2]=m;l=k+131084+((n|1)<<2)|0;m=c[k+1310736+(g+4<<2)>>2]|0;if((c[l>>2]|0)<(m|0))c[l>>2]=m;l=k+131084+((n|2)<<2)|0;m=c[k+1310736+(g+5<<2)>>2]|0;if((c[l>>2]|0)>(m|0))c[l>>2]=m;m=k+131084+((n|3)<<2)|0;l=c[k+1310736+(g+6<<2)>>2]|0;if((c[m>>2]|0)<(l|0))c[m>>2]=l;e=e+1|0}while((e|0)<(o|0))}if((c[f>>2]|0)>0){l=0;do{D=k+12+(l<<2)|0;E=l<<1;C=k+655376+(E<<3)|0;h[C>>3]=+h[C>>3]/+(c[D>>2]|0);E=k+655376+((E|1)<<3)|0;h[E>>3]=+h[E>>3]/+(c[D>>2]|0);l=l+1|0}while((l|0)<(c[f>>2]|0));l=0}else l=0}else l=0}i=F;return l|0}function fd(e,f,g,j,k){e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;F=i;i=i+16|0;B=F;D=(f|0)/2|0;E=(g|0)/2|0;o=c[k>>2]|0;A=E+-1|0;if((f|0)>1){l=0;m=o;n=o+(($(A,D)|0)<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(D|0))break;else{m=m+2|0;n=n+2|0}}}z=D+-1|0;if((g|0)>1){l=0;m=o;n=o+(z<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(E|0))break;else{m=m+(D<<1)|0;n=n+(D<<1)|0}}}n=k+1179664|0;m=D+1|0;w=0-D|0;u=1-D|0;v=~D;t=(f<<1)+8|0;a:do if((A|0)>1){x=(z|0)>1;l=(c[k+4>>2]|0)+m|0;y=1;g=e+((f<<2)+4)|0;e=o+(m<<1)|0;m=0;b:while(1){if(x){s=1;r=g;q=m;while(1){do if((d[r>>0]|0|0)>(j|0)){b[e>>1]=0;a[l>>0]=0;m=q}else{a[l>>0]=-1;m=b[e+(w<<1)>>1]|0;if(m<<16>>16>0){b[e>>1]=m;m=(m<<16>>16)*7|0;p=k+1310736+(m+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=k+1310736+(m+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=k+1310736+(m+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+y;c[k+1310736+(m+-1<<2)>>2]=y;m=q;break}f=b[e+(u<<1)>>1]|0;o=f<<16>>16;m=b[e+(v<<1)>>1]|0;p=m<<16>>16;g=m<<16>>16>0;if(f<<16>>16<=0){if(g){b[e>>1]=m;m=p*7|0;g=k+1310736+(m+-7<<2)|0;c[g>>2]=(c[g>>2]|0)+1;g=k+1310736+(m+-6<<2)|0;c[g>>2]=(c[g>>2]|0)+s;g=k+1310736+(m+-5<<2)|0;c[g>>2]=(c[g>>2]|0)+y;g=k+1310736+(m+-3<<2)|0;if((c[g>>2]|0)<(s|0))c[g>>2]=s;c[k+1310736+(m+-1<<2)>>2]=y;m=q;break}m=b[e+-2>>1]|0;if(m<<16>>16>0){b[e>>1]=m;m=(m<<16>>16)*7|0;p=k+1310736+(m+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=k+1310736+(m+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=k+1310736+(m+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+y;m=k+1310736+(m+-3<<2)|0;if((c[m>>2]|0)>=(s|0)){m=q;break}c[m>>2]=s;m=q;break}else{m=q+1|0;if((q|0)>32767)break b;b[e>>1]=m;c[k+1179664+(q<<2)>>2]=m<<16>>16;q=q*7|0;c[k+1310736+(q<<2)>>2]=1;c[k+1310736+(q+1<<2)>>2]=s;c[k+1310736+(q+2<<2)>>2]=y;c[k+1310736+(q+3<<2)>>2]=s;c[k+1310736+(q+4<<2)>>2]=s;c[k+1310736+(q+5<<2)>>2]=y;c[k+1310736+(q+6<<2)>>2]=y;break}}if(g){m=c[k+1179664+(o+-1<<2)>>2]|0;o=c[k+1179664+(p+-1<<2)>>2]|0;if((m|0)>(o|0)){b[e>>1]=o;if((q|0)>0){g=0;f=n;while(1){if((c[f>>2]|0)==(m|0))c[f>>2]=o;g=g+1|0;if((g|0)>=(q|0)){m=o;break}else f=f+4|0}}else m=o}else{b[e>>1]=m;if((m|0)<(o|0)&(q|0)>0){g=0;f=n;while(1){if((c[f>>2]|0)==(o|0))c[f>>2]=m;g=g+1|0;if((g|0)>=(q|0))break;else f=f+4|0}}}m=(m<<16>>16)*7|0;p=k+1310736+(m+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=k+1310736+(m+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=k+1310736+(m+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+y;c[k+1310736+(m+-1<<2)>>2]=y;m=q;break}g=b[e+-2>>1]|0;if(g<<16>>16<=0){b[e>>1]=f;m=o*7|0;g=k+1310736+(m+-7<<2)|0;c[g>>2]=(c[g>>2]|0)+1;g=k+1310736+(m+-6<<2)|0;c[g>>2]=(c[g>>2]|0)+s;g=k+1310736+(m+-5<<2)|0;c[g>>2]=(c[g>>2]|0)+y;g=k+1310736+(m+-4<<2)|0;if((c[g>>2]|0)>(s|0))c[g>>2]=s;c[k+1310736+(m+-1<<2)>>2]=y;m=q;break}m=c[k+1179664+(o+-1<<2)>>2]|0;o=c[k+1179664+((g<<16>>16)+-1<<2)>>2]|0;if((m|0)>(o|0)){b[e>>1]=o;if((q|0)>0){g=0;f=n;while(1){if((c[f>>2]|0)==(m|0))c[f>>2]=o;g=g+1|0;if((g|0)>=(q|0)){m=o;break}else f=f+4|0}}else m=o}else{b[e>>1]=m;if((m|0)<(o|0)&(q|0)>0){g=0;f=n;while(1){if((c[f>>2]|0)==(o|0))c[f>>2]=m;g=g+1|0;if((g|0)>=(q|0))break;else f=f+4|0}}}m=(m<<16>>16)*7|0;p=k+1310736+(m+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=k+1310736+(m+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;m=k+1310736+(m+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+y;m=q}while(0);s=s+1|0;g=r+4|0;e=e+2|0;l=l+1|0;if((s|0)>=(z|0))break;else{r=g;q=m}}}y=y+1|0;if((y|0)>=(A|0)){o=m;C=52;break a}else{l=l+2|0;g=g+t|0;e=e+4|0}}Me(3,3904,B);l=-1}else{o=0;C=52}while(0);if((C|0)==52){e=k+12|0;if((o|0)<1)m=1;else{g=1;m=1;while(1){l=c[n>>2]|0;if((l|0)==(g|0)){l=m;m=m+1|0}else l=c[k+1179664+(l+-1<<2)>>2]|0;c[n>>2]=l;if((g|0)<(o|0)){g=g+1|0;n=n+4|0}else break}}f=k+8|0;l=m+-1|0;c[f>>2]=l;if(l){ek(e|0,0,l<<2|0)|0;ek(k+655376|0,0,l<<4|0)|0;if((m|0)>1){l=0;do{C=l<<2;c[k+131084+(C<<2)>>2]=D;c[k+131084+((C|1)<<2)>>2]=0;c[k+131084+((C|2)<<2)>>2]=E;c[k+131084+((C|3)<<2)>>2]=0;l=l+1|0}while((l|0)<(c[f>>2]|0))}if((o|0)>0){e=0;do{n=(c[k+1179664+(e<<2)>>2]|0)+-1|0;g=e*7|0;l=k+12+(n<<2)|0;c[l>>2]=(c[l>>2]|0)+(c[k+1310736+(g<<2)>>2]|0);l=n<<1;m=k+655376+(l<<3)|0;h[m>>3]=+h[m>>3]+ +(c[k+1310736+(g+1<<2)>>2]|0);l=k+655376+((l|1)<<3)|0;h[l>>3]=+h[l>>3]+ +(c[k+1310736+(g+2<<2)>>2]|0);n=n<<2;l=k+131084+(n<<2)|0;m=c[k+1310736+(g+3<<2)>>2]|0;if((c[l>>2]|0)>(m|0))c[l>>2]=m;l=k+131084+((n|1)<<2)|0;m=c[k+1310736+(g+4<<2)>>2]|0;if((c[l>>2]|0)<(m|0))c[l>>2]=m;l=k+131084+((n|2)<<2)|0;m=c[k+1310736+(g+5<<2)>>2]|0;if((c[l>>2]|0)>(m|0))c[l>>2]=m;m=k+131084+((n|3)<<2)|0;l=c[k+1310736+(g+6<<2)>>2]|0;if((c[m>>2]|0)<(l|0))c[m>>2]=l;e=e+1|0}while((e|0)<(o|0))}if((c[f>>2]|0)>0){l=0;do{D=k+12+(l<<2)|0;E=l<<1;C=k+655376+(E<<3)|0;h[C>>3]=+h[C>>3]/+(c[D>>2]|0);E=k+655376+((E|1)<<3)|0;h[E>>3]=+h[E>>3]/+(c[D>>2]|0);l=l+1|0}while((l|0)<(c[f>>2]|0));l=0}else l=0}else l=0}i=F;return l|0}function gd(e,f,g,j,k){e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;E=i;i=i+16|0;C=E;p=c[k>>2]|0;B=g+-1|0;if((f|0)>0){l=0;m=p;n=p+(($(B,f)|0)<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(f|0))break;else{m=m+2|0;n=n+2|0}}}A=j*3|0;z=f+-1|0;if((g|0)>0){l=0;j=p;m=p+(z<<1)|0;while(1){b[m>>1]=0;b[j>>1]=0;l=l+1|0;if((l|0)>=(g|0))break;else{j=j+(f<<1)|0;m=m+(f<<1)|0}}}m=k+1179664|0;l=f+1|0;w=0-f|0;u=1-f|0;v=~f;a:do if((B|0)>1){x=(z|0)>1;o=(c[k+4>>2]|0)+l|0;y=1;n=e+(l*3|0)|0;e=p+(l<<1)|0;j=0;b:while(1){if(x){l=o;t=1;s=n;r=j;while(1){do if(((d[s+1>>0]|0)+(d[s>>0]|0)+(d[s+2>>0]|0)|0)>(A|0)){b[e>>1]=0;a[l>>0]=0;j=r}else{a[l>>0]=-1;j=b[e+(w<<1)>>1]|0;if(j<<16>>16>0){b[e>>1]=j;j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;q=k+1310736+(j+-5<<2)|0;c[q>>2]=(c[q>>2]|0)+y;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}o=b[e+(u<<1)>>1]|0;p=o<<16>>16;j=b[e+(v<<1)>>1]|0;q=j<<16>>16;n=j<<16>>16>0;if(o<<16>>16<=0){if(n){b[e>>1]=j;j=q*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+t;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+y;n=k+1310736+(j+-3<<2)|0;if((c[n>>2]|0)<(t|0))c[n>>2]=t;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}j=b[e+-2>>1]|0;if(j<<16>>16>0){b[e>>1]=j;j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;q=k+1310736+(j+-5<<2)|0;c[q>>2]=(c[q>>2]|0)+y;j=k+1310736+(j+-3<<2)|0;if((c[j>>2]|0)>=(t|0)){j=r;break}c[j>>2]=t;j=r;break}else{j=r+1|0;if((r|0)>32767)break b;b[e>>1]=j;c[k+1179664+(r<<2)>>2]=j<<16>>16;r=r*7|0;c[k+1310736+(r<<2)>>2]=1;c[k+1310736+(r+1<<2)>>2]=t;c[k+1310736+(r+2<<2)>>2]=y;c[k+1310736+(r+3<<2)>>2]=t;c[k+1310736+(r+4<<2)>>2]=t;c[k+1310736+(r+5<<2)>>2]=y;c[k+1310736+(r+6<<2)>>2]=y;break}}if(n){j=c[k+1179664+(p+-1<<2)>>2]|0;p=c[k+1179664+(q+-1<<2)>>2]|0;if((j|0)>(p|0)){b[e>>1]=p;if((r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(j|0))c[o>>2]=p;n=n+1|0;if((n|0)>=(r|0)){j=p;break}else o=o+4|0}}else j=p}else{b[e>>1]=j;if((j|0)<(p|0)&(r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(p|0))c[o>>2]=j;n=n+1|0;if((n|0)>=(r|0))break;else o=o+4|0}}}j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;q=k+1310736+(j+-5<<2)|0;c[q>>2]=(c[q>>2]|0)+y;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}n=b[e+-2>>1]|0;if(n<<16>>16<=0){b[e>>1]=o;j=p*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+t;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+y;n=k+1310736+(j+-4<<2)|0;if((c[n>>2]|0)>(t|0))c[n>>2]=t;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}j=c[k+1179664+(p+-1<<2)>>2]|0;p=c[k+1179664+((n<<16>>16)+-1<<2)>>2]|0;if((j|0)>(p|0)){b[e>>1]=p;if((r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(j|0))c[o>>2]=p;n=n+1|0;if((n|0)>=(r|0)){j=p;break}else o=o+4|0}}else j=p}else{b[e>>1]=j;if((j|0)<(p|0)&(r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(p|0))c[o>>2]=j;n=n+1|0;if((n|0)>=(r|0))break;else o=o+4|0}}}j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;j=k+1310736+(j+-5<<2)|0;c[j>>2]=(c[j>>2]|0)+y;j=r}while(0);t=t+1|0;n=s+3|0;e=e+2|0;l=l+1|0;if((t|0)>=(z|0))break;else{s=n;r=j}}}else l=o;y=y+1|0;if((y|0)>=(B|0)){p=j;D=52;break a}else{o=l+2|0;n=n+6|0;e=e+4|0}}Me(3,3904,C);l=-1}else{p=0;D=52}while(0);if((D|0)==52){e=k+12|0;if((p|0)<1)j=1;else{n=1;j=1;while(1){l=c[m>>2]|0;if((l|0)==(n|0)){l=j;j=j+1|0}else l=c[k+1179664+(l+-1<<2)>>2]|0;c[m>>2]=l;if((n|0)<(p|0)){n=n+1|0;m=m+4|0}else break}}o=k+8|0;l=j+-1|0;c[o>>2]=l;if(l){ek(e|0,0,l<<2|0)|0;ek(k+655376|0,0,l<<4|0)|0;if((j|0)>1){l=0;do{D=l<<2;c[k+131084+(D<<2)>>2]=f;c[k+131084+((D|1)<<2)>>2]=0;c[k+131084+((D|2)<<2)>>2]=g;c[k+131084+((D|3)<<2)>>2]=0;l=l+1|0}while((l|0)<(c[o>>2]|0))}if((p|0)>0){e=0;do{m=(c[k+1179664+(e<<2)>>2]|0)+-1|0;n=e*7|0;l=k+12+(m<<2)|0;c[l>>2]=(c[l>>2]|0)+(c[k+1310736+(n<<2)>>2]|0);l=m<<1;j=k+655376+(l<<3)|0;h[j>>3]=+h[j>>3]+ +(c[k+1310736+(n+1<<2)>>2]|0);l=k+655376+((l|1)<<3)|0;h[l>>3]=+h[l>>3]+ +(c[k+1310736+(n+2<<2)>>2]|0);m=m<<2;l=k+131084+(m<<2)|0;j=c[k+1310736+(n+3<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;l=k+131084+((m|1)<<2)|0;j=c[k+1310736+(n+4<<2)>>2]|0;if((c[l>>2]|0)<(j|0))c[l>>2]=j;l=k+131084+((m|2)<<2)|0;j=c[k+1310736+(n+5<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;j=k+131084+((m|3)<<2)|0;l=c[k+1310736+(n+6<<2)>>2]|0;if((c[j>>2]|0)<(l|0))c[j>>2]=l;e=e+1|0}while((e|0)<(p|0))}if((c[o>>2]|0)>0){l=0;do{f=k+12+(l<<2)|0;g=l<<1;D=k+655376+(g<<3)|0;h[D>>3]=+h[D>>3]/+(c[f>>2]|0);g=k+655376+((g|1)<<3)|0;h[g>>3]=+h[g>>3]/+(c[f>>2]|0);l=l+1|0}while((l|0)<(c[o>>2]|0));l=0}else l=0}else l=0}i=E;return l|0}function hd(e,f,g,j,k){e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;E=i;i=i+16|0;C=E;p=c[k>>2]|0;B=g+-1|0;if((f|0)>0){l=0;m=p;n=p+(($(B,f)|0)<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(f|0))break;else{m=m+2|0;n=n+2|0}}}A=j*3|0;z=f+-1|0;if((g|0)>0){l=0;j=p;m=p+(z<<1)|0;while(1){b[m>>1]=0;b[j>>1]=0;l=l+1|0;if((l|0)>=(g|0))break;else{j=j+(f<<1)|0;m=m+(f<<1)|0}}}m=k+1179664|0;l=f+1|0;w=0-f|0;u=1-f|0;v=~f;a:do if((B|0)>1){x=(z|0)>1;o=(c[k+4>>2]|0)+l|0;y=1;n=e+(l<<1)|0;e=p+(l<<1)|0;j=0;b:while(1){if(x){l=o;t=1;s=n;r=j;while(1){p=d[s>>0]|0;q=d[s+1>>0]|0;do if(((p&248)+10+(p<<5&224)+(q>>>3&28)+(q<<3&248)|0)>(A|0)){b[e>>1]=0;a[l>>0]=0;j=r}else{a[l>>0]=-1;j=b[e+(w<<1)>>1]|0;if(j<<16>>16>0){b[e>>1]=j;j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;q=k+1310736+(j+-5<<2)|0;c[q>>2]=(c[q>>2]|0)+y;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}o=b[e+(u<<1)>>1]|0;p=o<<16>>16;j=b[e+(v<<1)>>1]|0;q=j<<16>>16;n=j<<16>>16>0;if(o<<16>>16<=0){if(n){b[e>>1]=j;j=q*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+t;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+y;n=k+1310736+(j+-3<<2)|0;if((c[n>>2]|0)<(t|0))c[n>>2]=t;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}j=b[e+-2>>1]|0;if(j<<16>>16>0){b[e>>1]=j;j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;q=k+1310736+(j+-5<<2)|0;c[q>>2]=(c[q>>2]|0)+y;j=k+1310736+(j+-3<<2)|0;if((c[j>>2]|0)>=(t|0)){j=r;break}c[j>>2]=t;j=r;break}else{j=r+1|0;if((r|0)>32767)break b;b[e>>1]=j;c[k+1179664+(r<<2)>>2]=j<<16>>16;r=r*7|0;c[k+1310736+(r<<2)>>2]=1;c[k+1310736+(r+1<<2)>>2]=t;c[k+1310736+(r+2<<2)>>2]=y;c[k+1310736+(r+3<<2)>>2]=t;c[k+1310736+(r+4<<2)>>2]=t;c[k+1310736+(r+5<<2)>>2]=y;c[k+1310736+(r+6<<2)>>2]=y;break}}if(n){j=c[k+1179664+(p+-1<<2)>>2]|0;p=c[k+1179664+(q+-1<<2)>>2]|0;if((j|0)>(p|0)){b[e>>1]=p;if((r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(j|0))c[o>>2]=p;n=n+1|0;if((n|0)>=(r|0)){j=p;break}else o=o+4|0}}else j=p}else{b[e>>1]=j;if((j|0)<(p|0)&(r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(p|0))c[o>>2]=j;n=n+1|0;if((n|0)>=(r|0))break;else o=o+4|0}}}j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;q=k+1310736+(j+-5<<2)|0;c[q>>2]=(c[q>>2]|0)+y;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}n=b[e+-2>>1]|0;if(n<<16>>16<=0){b[e>>1]=o;j=p*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+t;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+y;n=k+1310736+(j+-4<<2)|0;if((c[n>>2]|0)>(t|0))c[n>>2]=t;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}j=c[k+1179664+(p+-1<<2)>>2]|0;p=c[k+1179664+((n<<16>>16)+-1<<2)>>2]|0;if((j|0)>(p|0)){b[e>>1]=p;if((r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(j|0))c[o>>2]=p;n=n+1|0;if((n|0)>=(r|0)){j=p;break}else o=o+4|0}}else j=p}else{b[e>>1]=j;if((j|0)<(p|0)&(r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(p|0))c[o>>2]=j;n=n+1|0;if((n|0)>=(r|0))break;else o=o+4|0}}}j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;j=k+1310736+(j+-5<<2)|0;c[j>>2]=(c[j>>2]|0)+y;j=r}while(0);t=t+1|0;n=s+2|0;e=e+2|0;l=l+1|0;if((t|0)>=(z|0))break;else{s=n;r=j}}}else l=o;y=y+1|0;if((y|0)>=(B|0)){p=j;D=52;break a}else{o=l+2|0;n=n+4|0;e=e+4|0}}Me(3,3904,C);l=-1}else{p=0;D=52}while(0);if((D|0)==52){e=k+12|0;if((p|0)<1)j=1;else{n=1;j=1;while(1){l=c[m>>2]|0;if((l|0)==(n|0)){l=j;j=j+1|0}else l=c[k+1179664+(l+-1<<2)>>2]|0;c[m>>2]=l;if((n|0)<(p|0)){n=n+1|0;m=m+4|0}else break}}o=k+8|0;l=j+-1|0;c[o>>2]=l;if(l){ek(e|0,0,l<<2|0)|0;ek(k+655376|0,0,l<<4|0)|0;if((j|0)>1){l=0;do{D=l<<2;c[k+131084+(D<<2)>>2]=f;c[k+131084+((D|1)<<2)>>2]=0;c[k+131084+((D|2)<<2)>>2]=g;c[k+131084+((D|3)<<2)>>2]=0;l=l+1|0}while((l|0)<(c[o>>2]|0))}if((p|0)>0){e=0;do{m=(c[k+1179664+(e<<2)>>2]|0)+-1|0;n=e*7|0;l=k+12+(m<<2)|0;c[l>>2]=(c[l>>2]|0)+(c[k+1310736+(n<<2)>>2]|0);l=m<<1;j=k+655376+(l<<3)|0;h[j>>3]=+h[j>>3]+ +(c[k+1310736+(n+1<<2)>>2]|0);l=k+655376+((l|1)<<3)|0;h[l>>3]=+h[l>>3]+ +(c[k+1310736+(n+2<<2)>>2]|0);m=m<<2;l=k+131084+(m<<2)|0;j=c[k+1310736+(n+3<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;l=k+131084+((m|1)<<2)|0;j=c[k+1310736+(n+4<<2)>>2]|0;if((c[l>>2]|0)<(j|0))c[l>>2]=j;l=k+131084+((m|2)<<2)|0;j=c[k+1310736+(n+5<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;j=k+131084+((m|3)<<2)|0;l=c[k+1310736+(n+6<<2)>>2]|0;if((c[j>>2]|0)<(l|0))c[j>>2]=l;e=e+1|0}while((e|0)<(p|0))}if((c[o>>2]|0)>0){l=0;do{f=k+12+(l<<2)|0;g=l<<1;D=k+655376+(g<<3)|0;h[D>>3]=+h[D>>3]/+(c[f>>2]|0);g=k+655376+((g|1)<<3)|0;h[g>>3]=+h[g>>3]/+(c[f>>2]|0);l=l+1|0}while((l|0)<(c[o>>2]|0));l=0}else l=0}else l=0}i=E;return l|0}function id(e,f,g,j,k){e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;E=i;i=i+16|0;C=E;p=c[k>>2]|0;B=g+-1|0;if((f|0)>0){l=0;m=p;n=p+(($(B,f)|0)<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(f|0))break;else{m=m+2|0;n=n+2|0}}}A=j*3|0;z=f+-1|0;if((g|0)>0){l=0;j=p;m=p+(z<<1)|0;while(1){b[m>>1]=0;b[j>>1]=0;l=l+1|0;if((l|0)>=(g|0))break;else{j=j+(f<<1)|0;m=m+(f<<1)|0}}}m=k+1179664|0;l=f+1|0;w=0-f|0;u=1-f|0;v=~f;a:do if((B|0)>1){x=(z|0)>1;o=(c[k+4>>2]|0)+l|0;y=1;n=e+(l<<2)|0;e=p+(l<<1)|0;j=0;b:while(1){if(x){l=o;t=1;s=n;r=j;while(1){do if(((d[s+1>>0]|0)+(d[s>>0]|0)+(d[s+2>>0]|0)|0)>(A|0)){b[e>>1]=0;a[l>>0]=0;j=r}else{a[l>>0]=-1;j=b[e+(w<<1)>>1]|0;if(j<<16>>16>0){b[e>>1]=j;j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;q=k+1310736+(j+-5<<2)|0;c[q>>2]=(c[q>>2]|0)+y;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}o=b[e+(u<<1)>>1]|0;p=o<<16>>16;j=b[e+(v<<1)>>1]|0;q=j<<16>>16;n=j<<16>>16>0;if(o<<16>>16<=0){if(n){b[e>>1]=j;j=q*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+t;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+y;n=k+1310736+(j+-3<<2)|0;if((c[n>>2]|0)<(t|0))c[n>>2]=t;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}j=b[e+-2>>1]|0;if(j<<16>>16>0){b[e>>1]=j;j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;q=k+1310736+(j+-5<<2)|0;c[q>>2]=(c[q>>2]|0)+y;j=k+1310736+(j+-3<<2)|0;if((c[j>>2]|0)>=(t|0)){j=r;break}c[j>>2]=t;j=r;break}else{j=r+1|0;if((r|0)>32767)break b;b[e>>1]=j;c[k+1179664+(r<<2)>>2]=j<<16>>16;r=r*7|0;c[k+1310736+(r<<2)>>2]=1;c[k+1310736+(r+1<<2)>>2]=t;c[k+1310736+(r+2<<2)>>2]=y;c[k+1310736+(r+3<<2)>>2]=t;c[k+1310736+(r+4<<2)>>2]=t;c[k+1310736+(r+5<<2)>>2]=y;c[k+1310736+(r+6<<2)>>2]=y;break}}if(n){j=c[k+1179664+(p+-1<<2)>>2]|0;p=c[k+1179664+(q+-1<<2)>>2]|0;if((j|0)>(p|0)){b[e>>1]=p;if((r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(j|0))c[o>>2]=p;n=n+1|0;if((n|0)>=(r|0)){j=p;break}else o=o+4|0}}else j=p}else{b[e>>1]=j;if((j|0)<(p|0)&(r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(p|0))c[o>>2]=j;n=n+1|0;if((n|0)>=(r|0))break;else o=o+4|0}}}j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;q=k+1310736+(j+-5<<2)|0;c[q>>2]=(c[q>>2]|0)+y;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}n=b[e+-2>>1]|0;if(n<<16>>16<=0){b[e>>1]=o;j=p*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+t;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+y;n=k+1310736+(j+-4<<2)|0;if((c[n>>2]|0)>(t|0))c[n>>2]=t;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}j=c[k+1179664+(p+-1<<2)>>2]|0;p=c[k+1179664+((n<<16>>16)+-1<<2)>>2]|0;if((j|0)>(p|0)){b[e>>1]=p;if((r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(j|0))c[o>>2]=p;n=n+1|0;if((n|0)>=(r|0)){j=p;break}else o=o+4|0}}else j=p}else{b[e>>1]=j;if((j|0)<(p|0)&(r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(p|0))c[o>>2]=j;n=n+1|0;if((n|0)>=(r|0))break;else o=o+4|0}}}j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;j=k+1310736+(j+-5<<2)|0;c[j>>2]=(c[j>>2]|0)+y;j=r}while(0);t=t+1|0;n=s+4|0;e=e+2|0;l=l+1|0;if((t|0)>=(z|0))break;else{s=n;r=j}}}else l=o;y=y+1|0;if((y|0)>=(B|0)){p=j;D=52;break a}else{o=l+2|0;n=n+8|0;e=e+4|0}}Me(3,3904,C);l=-1}else{p=0;D=52}while(0);if((D|0)==52){e=k+12|0;if((p|0)<1)j=1;else{n=1;j=1;while(1){l=c[m>>2]|0;if((l|0)==(n|0)){l=j;j=j+1|0}else l=c[k+1179664+(l+-1<<2)>>2]|0;c[m>>2]=l;if((n|0)<(p|0)){n=n+1|0;m=m+4|0}else break}}o=k+8|0;l=j+-1|0;c[o>>2]=l;if(l){ek(e|0,0,l<<2|0)|0;ek(k+655376|0,0,l<<4|0)|0;if((j|0)>1){l=0;do{D=l<<2;c[k+131084+(D<<2)>>2]=f;c[k+131084+((D|1)<<2)>>2]=0;c[k+131084+((D|2)<<2)>>2]=g;c[k+131084+((D|3)<<2)>>2]=0;l=l+1|0}while((l|0)<(c[o>>2]|0))}if((p|0)>0){e=0;do{m=(c[k+1179664+(e<<2)>>2]|0)+-1|0;n=e*7|0;l=k+12+(m<<2)|0;c[l>>2]=(c[l>>2]|0)+(c[k+1310736+(n<<2)>>2]|0);l=m<<1;j=k+655376+(l<<3)|0;h[j>>3]=+h[j>>3]+ +(c[k+1310736+(n+1<<2)>>2]|0);l=k+655376+((l|1)<<3)|0;h[l>>3]=+h[l>>3]+ +(c[k+1310736+(n+2<<2)>>2]|0);m=m<<2;l=k+131084+(m<<2)|0;j=c[k+1310736+(n+3<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;l=k+131084+((m|1)<<2)|0;j=c[k+1310736+(n+4<<2)>>2]|0;if((c[l>>2]|0)<(j|0))c[l>>2]=j;l=k+131084+((m|2)<<2)|0;j=c[k+1310736+(n+5<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;j=k+131084+((m|3)<<2)|0;l=c[k+1310736+(n+6<<2)>>2]|0;if((c[j>>2]|0)<(l|0))c[j>>2]=l;e=e+1|0}while((e|0)<(p|0))}if((c[o>>2]|0)>0){l=0;do{f=k+12+(l<<2)|0;g=l<<1;D=k+655376+(g<<3)|0;h[D>>3]=+h[D>>3]/+(c[f>>2]|0);g=k+655376+((g|1)<<3)|0;h[g>>3]=+h[g>>3]/+(c[f>>2]|0);l=l+1|0}while((l|0)<(c[o>>2]|0));l=0}else l=0}else l=0}i=E;return l|0}function jd(e,f,g,j,k){e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;E=i;i=i+16|0;C=E;p=c[k>>2]|0;B=g+-1|0;if((f|0)>0){l=0;m=p;n=p+(($(B,f)|0)<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(f|0))break;else{m=m+2|0;n=n+2|0}}}A=j*3|0;z=f+-1|0;if((g|0)>0){l=0;j=p;m=p+(z<<1)|0;while(1){b[m>>1]=0;b[j>>1]=0;l=l+1|0;if((l|0)>=(g|0))break;else{j=j+(f<<1)|0;m=m+(f<<1)|0}}}m=k+1179664|0;l=f+1|0;w=0-f|0;u=1-f|0;v=~f;a:do if((B|0)>1){x=(z|0)>1;o=(c[k+4>>2]|0)+l|0;y=1;n=e+(l<<1)|0;e=p+(l<<1)|0;j=0;b:while(1){if(x){l=o;t=1;s=n;r=j;while(1){q=d[s>>0]|0;do if(((q&240)+24+(q<<4&240)+((d[s+1>>0]|0)&240)|0)>(A|0)){b[e>>1]=0;a[l>>0]=0;j=r}else{a[l>>0]=-1;j=b[e+(w<<1)>>1]|0;if(j<<16>>16>0){b[e>>1]=j;j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;q=k+1310736+(j+-5<<2)|0;c[q>>2]=(c[q>>2]|0)+y;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}o=b[e+(u<<1)>>1]|0;p=o<<16>>16;j=b[e+(v<<1)>>1]|0;q=j<<16>>16;n=j<<16>>16>0;if(o<<16>>16<=0){if(n){b[e>>1]=j;j=q*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+t;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+y;n=k+1310736+(j+-3<<2)|0;if((c[n>>2]|0)<(t|0))c[n>>2]=t;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}j=b[e+-2>>1]|0;if(j<<16>>16>0){b[e>>1]=j;j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;q=k+1310736+(j+-5<<2)|0;c[q>>2]=(c[q>>2]|0)+y;j=k+1310736+(j+-3<<2)|0;if((c[j>>2]|0)>=(t|0)){j=r;break}c[j>>2]=t;j=r;break}else{j=r+1|0;if((r|0)>32767)break b;b[e>>1]=j;c[k+1179664+(r<<2)>>2]=j<<16>>16;r=r*7|0;c[k+1310736+(r<<2)>>2]=1;c[k+1310736+(r+1<<2)>>2]=t;c[k+1310736+(r+2<<2)>>2]=y;c[k+1310736+(r+3<<2)>>2]=t;c[k+1310736+(r+4<<2)>>2]=t;c[k+1310736+(r+5<<2)>>2]=y;c[k+1310736+(r+6<<2)>>2]=y;break}}if(n){j=c[k+1179664+(p+-1<<2)>>2]|0;p=c[k+1179664+(q+-1<<2)>>2]|0;if((j|0)>(p|0)){b[e>>1]=p;if((r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(j|0))c[o>>2]=p;n=n+1|0;if((n|0)>=(r|0)){j=p;break}else o=o+4|0}}else j=p}else{b[e>>1]=j;if((j|0)<(p|0)&(r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(p|0))c[o>>2]=j;n=n+1|0;if((n|0)>=(r|0))break;else o=o+4|0}}}j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;q=k+1310736+(j+-5<<2)|0;c[q>>2]=(c[q>>2]|0)+y;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}n=b[e+-2>>1]|0;if(n<<16>>16<=0){b[e>>1]=o;j=p*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+t;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+y;n=k+1310736+(j+-4<<2)|0;if((c[n>>2]|0)>(t|0))c[n>>2]=t;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}j=c[k+1179664+(p+-1<<2)>>2]|0;p=c[k+1179664+((n<<16>>16)+-1<<2)>>2]|0;if((j|0)>(p|0)){b[e>>1]=p;if((r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(j|0))c[o>>2]=p;n=n+1|0;if((n|0)>=(r|0)){j=p;break}else o=o+4|0}}else j=p}else{b[e>>1]=j;if((j|0)<(p|0)&(r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(p|0))c[o>>2]=j;n=n+1|0;if((n|0)>=(r|0))break;else o=o+4|0}}}j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;j=k+1310736+(j+-5<<2)|0;c[j>>2]=(c[j>>2]|0)+y;j=r}while(0);t=t+1|0;n=s+2|0;e=e+2|0;l=l+1|0;if((t|0)>=(z|0))break;else{s=n;r=j}}}else l=o;y=y+1|0;if((y|0)>=(B|0)){p=j;D=52;break a}else{o=l+2|0;n=n+4|0;e=e+4|0}}Me(3,3904,C);l=-1}else{p=0;D=52}while(0);if((D|0)==52){e=k+12|0;if((p|0)<1)j=1;else{n=1;j=1;while(1){l=c[m>>2]|0;if((l|0)==(n|0)){l=j;j=j+1|0}else l=c[k+1179664+(l+-1<<2)>>2]|0;c[m>>2]=l;if((n|0)<(p|0)){n=n+1|0;m=m+4|0}else break}}o=k+8|0;l=j+-1|0;c[o>>2]=l;if(l){ek(e|0,0,l<<2|0)|0;ek(k+655376|0,0,l<<4|0)|0;if((j|0)>1){l=0;do{D=l<<2;c[k+131084+(D<<2)>>2]=f;c[k+131084+((D|1)<<2)>>2]=0;c[k+131084+((D|2)<<2)>>2]=g;c[k+131084+((D|3)<<2)>>2]=0;l=l+1|0}while((l|0)<(c[o>>2]|0))}if((p|0)>0){e=0;do{m=(c[k+1179664+(e<<2)>>2]|0)+-1|0;n=e*7|0;l=k+12+(m<<2)|0;c[l>>2]=(c[l>>2]|0)+(c[k+1310736+(n<<2)>>2]|0);l=m<<1;j=k+655376+(l<<3)|0;h[j>>3]=+h[j>>3]+ +(c[k+1310736+(n+1<<2)>>2]|0);l=k+655376+((l|1)<<3)|0;h[l>>3]=+h[l>>3]+ +(c[k+1310736+(n+2<<2)>>2]|0);m=m<<2;l=k+131084+(m<<2)|0;j=c[k+1310736+(n+3<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;l=k+131084+((m|1)<<2)|0;j=c[k+1310736+(n+4<<2)>>2]|0;if((c[l>>2]|0)<(j|0))c[l>>2]=j;l=k+131084+((m|2)<<2)|0;j=c[k+1310736+(n+5<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;j=k+131084+((m|3)<<2)|0;l=c[k+1310736+(n+6<<2)>>2]|0;if((c[j>>2]|0)<(l|0))c[j>>2]=l;e=e+1|0}while((e|0)<(p|0))}if((c[o>>2]|0)>0){l=0;do{f=k+12+(l<<2)|0;g=l<<1;D=k+655376+(g<<3)|0;h[D>>3]=+h[D>>3]/+(c[f>>2]|0);g=k+655376+((g|1)<<3)|0;h[g>>3]=+h[g>>3]/+(c[f>>2]|0);l=l+1|0}while((l|0)<(c[o>>2]|0));l=0}else l=0}else l=0}i=E;return l|0}function kd(e,f,g,j,k){e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;E=i;i=i+16|0;C=E;p=c[k>>2]|0;B=g+-1|0;if((f|0)>0){l=0;m=p;n=p+(($(B,f)|0)<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(f|0))break;else{m=m+2|0;n=n+2|0}}}A=j*3|0;z=f+-1|0;if((g|0)>0){l=0;j=p;m=p+(z<<1)|0;while(1){b[m>>1]=0;b[j>>1]=0;l=l+1|0;if((l|0)>=(g|0))break;else{j=j+(f<<1)|0;m=m+(f<<1)|0}}}m=k+1179664|0;l=f+1|0;w=0-f|0;u=1-f|0;v=~f;a:do if((B|0)>1){x=(z|0)>1;o=(c[k+4>>2]|0)+l|0;y=1;n=e+(l<<1)|0;e=p+(l<<1)|0;j=0;b:while(1){if(x){l=o;t=1;s=n;r=j;while(1){p=d[s>>0]|0;q=d[s+1>>0]|0;do if(((p&248)+12+(p<<5&224)+(q>>>3&24)+(q<<2&248)|0)>(A|0)){b[e>>1]=0;a[l>>0]=0;j=r}else{a[l>>0]=-1;j=b[e+(w<<1)>>1]|0;if(j<<16>>16>0){b[e>>1]=j;j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;q=k+1310736+(j+-5<<2)|0;c[q>>2]=(c[q>>2]|0)+y;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}o=b[e+(u<<1)>>1]|0;p=o<<16>>16;j=b[e+(v<<1)>>1]|0;q=j<<16>>16;n=j<<16>>16>0;if(o<<16>>16<=0){if(n){b[e>>1]=j;j=q*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+t;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+y;n=k+1310736+(j+-3<<2)|0;if((c[n>>2]|0)<(t|0))c[n>>2]=t;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}j=b[e+-2>>1]|0;if(j<<16>>16>0){b[e>>1]=j;j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;q=k+1310736+(j+-5<<2)|0;c[q>>2]=(c[q>>2]|0)+y;j=k+1310736+(j+-3<<2)|0;if((c[j>>2]|0)>=(t|0)){j=r;break}c[j>>2]=t;j=r;break}else{j=r+1|0;if((r|0)>32767)break b;b[e>>1]=j;c[k+1179664+(r<<2)>>2]=j<<16>>16;r=r*7|0;c[k+1310736+(r<<2)>>2]=1;c[k+1310736+(r+1<<2)>>2]=t;c[k+1310736+(r+2<<2)>>2]=y;c[k+1310736+(r+3<<2)>>2]=t;c[k+1310736+(r+4<<2)>>2]=t;c[k+1310736+(r+5<<2)>>2]=y;c[k+1310736+(r+6<<2)>>2]=y;break}}if(n){j=c[k+1179664+(p+-1<<2)>>2]|0;p=c[k+1179664+(q+-1<<2)>>2]|0;if((j|0)>(p|0)){b[e>>1]=p;if((r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(j|0))c[o>>2]=p;n=n+1|0;if((n|0)>=(r|0)){j=p;break}else o=o+4|0}}else j=p}else{b[e>>1]=j;if((j|0)<(p|0)&(r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(p|0))c[o>>2]=j;n=n+1|0;if((n|0)>=(r|0))break;else o=o+4|0}}}j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;q=k+1310736+(j+-5<<2)|0;c[q>>2]=(c[q>>2]|0)+y;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}n=b[e+-2>>1]|0;if(n<<16>>16<=0){b[e>>1]=o;j=p*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+t;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+y;n=k+1310736+(j+-4<<2)|0;if((c[n>>2]|0)>(t|0))c[n>>2]=t;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}j=c[k+1179664+(p+-1<<2)>>2]|0;p=c[k+1179664+((n<<16>>16)+-1<<2)>>2]|0;if((j|0)>(p|0)){b[e>>1]=p;if((r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(j|0))c[o>>2]=p;n=n+1|0;if((n|0)>=(r|0)){j=p;break}else o=o+4|0}}else j=p}else{b[e>>1]=j;if((j|0)<(p|0)&(r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(p|0))c[o>>2]=j;n=n+1|0;if((n|0)>=(r|0))break;else o=o+4|0}}}j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;j=k+1310736+(j+-5<<2)|0;c[j>>2]=(c[j>>2]|0)+y;j=r}while(0);t=t+1|0;n=s+2|0;e=e+2|0;l=l+1|0;if((t|0)>=(z|0))break;else{s=n;r=j}}}else l=o;y=y+1|0;if((y|0)>=(B|0)){p=j;D=52;break a}else{o=l+2|0;n=n+4|0;e=e+4|0}}Me(3,3904,C);l=-1}else{p=0;D=52}while(0);if((D|0)==52){e=k+12|0;if((p|0)<1)j=1;else{n=1;j=1;while(1){l=c[m>>2]|0;if((l|0)==(n|0)){l=j;j=j+1|0}else l=c[k+1179664+(l+-1<<2)>>2]|0;c[m>>2]=l;if((n|0)<(p|0)){n=n+1|0;m=m+4|0}else break}}o=k+8|0;l=j+-1|0;c[o>>2]=l;if(l){ek(e|0,0,l<<2|0)|0;ek(k+655376|0,0,l<<4|0)|0;if((j|0)>1){l=0;do{D=l<<2;c[k+131084+(D<<2)>>2]=f;c[k+131084+((D|1)<<2)>>2]=0;c[k+131084+((D|2)<<2)>>2]=g;c[k+131084+((D|3)<<2)>>2]=0;l=l+1|0}while((l|0)<(c[o>>2]|0))}if((p|0)>0){e=0;do{m=(c[k+1179664+(e<<2)>>2]|0)+-1|0;n=e*7|0;l=k+12+(m<<2)|0;c[l>>2]=(c[l>>2]|0)+(c[k+1310736+(n<<2)>>2]|0);l=m<<1;j=k+655376+(l<<3)|0;h[j>>3]=+h[j>>3]+ +(c[k+1310736+(n+1<<2)>>2]|0);l=k+655376+((l|1)<<3)|0;h[l>>3]=+h[l>>3]+ +(c[k+1310736+(n+2<<2)>>2]|0);m=m<<2;l=k+131084+(m<<2)|0;j=c[k+1310736+(n+3<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;l=k+131084+((m|1)<<2)|0;j=c[k+1310736+(n+4<<2)>>2]|0;if((c[l>>2]|0)<(j|0))c[l>>2]=j;l=k+131084+((m|2)<<2)|0;j=c[k+1310736+(n+5<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;j=k+131084+((m|3)<<2)|0;l=c[k+1310736+(n+6<<2)>>2]|0;if((c[j>>2]|0)<(l|0))c[j>>2]=l;e=e+1|0}while((e|0)<(p|0))}if((c[o>>2]|0)>0){l=0;do{f=k+12+(l<<2)|0;g=l<<1;D=k+655376+(g<<3)|0;h[D>>3]=+h[D>>3]/+(c[f>>2]|0);g=k+655376+((g|1)<<3)|0;h[g>>3]=+h[g>>3]/+(c[f>>2]|0);l=l+1|0}while((l|0)<(c[o>>2]|0));l=0}else l=0}else l=0}i=E;return l|0}function ld(e,f,g,j,k){e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;E=i;i=i+16|0;C=E;p=c[k>>2]|0;B=g+-1|0;if((f|0)>0){l=0;m=p;n=p+(($(B,f)|0)<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(f|0))break;else{m=m+2|0;n=n+2|0}}}A=j*3|0;z=f+-1|0;if((g|0)>0){l=0;j=p;m=p+(z<<1)|0;while(1){b[m>>1]=0;b[j>>1]=0;l=l+1|0;if((l|0)>=(g|0))break;else{j=j+(f<<1)|0;m=m+(f<<1)|0}}}m=k+1179664|0;l=f+1|0;w=0-f|0;u=1-f|0;v=~f;a:do if((B|0)>1){x=(z|0)>1;o=(c[k+4>>2]|0)+l|0;y=1;n=e+(l<<2)|0;e=p+(l<<1)|0;j=0;b:while(1){if(x){l=o;t=1;s=n;r=j;while(1){do if(((d[s+2>>0]|0)+(d[s+1>>0]|0)+(d[s+3>>0]|0)|0)>(A|0)){b[e>>1]=0;a[l>>0]=0;j=r}else{a[l>>0]=-1;j=b[e+(w<<1)>>1]|0;if(j<<16>>16>0){b[e>>1]=j;j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;q=k+1310736+(j+-5<<2)|0;c[q>>2]=(c[q>>2]|0)+y;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}o=b[e+(u<<1)>>1]|0;p=o<<16>>16;j=b[e+(v<<1)>>1]|0;q=j<<16>>16;n=j<<16>>16>0;if(o<<16>>16<=0){if(n){b[e>>1]=j;j=q*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+t;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+y;n=k+1310736+(j+-3<<2)|0;if((c[n>>2]|0)<(t|0))c[n>>2]=t;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}j=b[e+-2>>1]|0;if(j<<16>>16>0){b[e>>1]=j;j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;q=k+1310736+(j+-5<<2)|0;c[q>>2]=(c[q>>2]|0)+y;j=k+1310736+(j+-3<<2)|0;if((c[j>>2]|0)>=(t|0)){j=r;break}c[j>>2]=t;j=r;break}else{j=r+1|0;if((r|0)>32767)break b;b[e>>1]=j;c[k+1179664+(r<<2)>>2]=j<<16>>16;r=r*7|0;c[k+1310736+(r<<2)>>2]=1;c[k+1310736+(r+1<<2)>>2]=t;c[k+1310736+(r+2<<2)>>2]=y;c[k+1310736+(r+3<<2)>>2]=t;c[k+1310736+(r+4<<2)>>2]=t;c[k+1310736+(r+5<<2)>>2]=y;c[k+1310736+(r+6<<2)>>2]=y;break}}if(n){j=c[k+1179664+(p+-1<<2)>>2]|0;p=c[k+1179664+(q+-1<<2)>>2]|0;if((j|0)>(p|0)){b[e>>1]=p;if((r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(j|0))c[o>>2]=p;n=n+1|0;if((n|0)>=(r|0)){j=p;break}else o=o+4|0}}else j=p}else{b[e>>1]=j;if((j|0)<(p|0)&(r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(p|0))c[o>>2]=j;n=n+1|0;if((n|0)>=(r|0))break;else o=o+4|0}}}j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;q=k+1310736+(j+-5<<2)|0;c[q>>2]=(c[q>>2]|0)+y;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}n=b[e+-2>>1]|0;if(n<<16>>16<=0){b[e>>1]=o;j=p*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+t;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+y;n=k+1310736+(j+-4<<2)|0;if((c[n>>2]|0)>(t|0))c[n>>2]=t;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}j=c[k+1179664+(p+-1<<2)>>2]|0;p=c[k+1179664+((n<<16>>16)+-1<<2)>>2]|0;if((j|0)>(p|0)){b[e>>1]=p;if((r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(j|0))c[o>>2]=p;n=n+1|0;if((n|0)>=(r|0)){j=p;break}else o=o+4|0}}else j=p}else{b[e>>1]=j;if((j|0)<(p|0)&(r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(p|0))c[o>>2]=j;n=n+1|0;if((n|0)>=(r|0))break;else o=o+4|0}}}j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;j=k+1310736+(j+-5<<2)|0;c[j>>2]=(c[j>>2]|0)+y;j=r}while(0);t=t+1|0;n=s+4|0;e=e+2|0;l=l+1|0;if((t|0)>=(z|0))break;else{s=n;r=j}}}else l=o;y=y+1|0;if((y|0)>=(B|0)){p=j;D=52;break a}else{o=l+2|0;n=n+8|0;e=e+4|0}}Me(3,3904,C);l=-1}else{p=0;D=52}while(0);if((D|0)==52){e=k+12|0;if((p|0)<1)j=1;else{n=1;j=1;while(1){l=c[m>>2]|0;if((l|0)==(n|0)){l=j;j=j+1|0}else l=c[k+1179664+(l+-1<<2)>>2]|0;c[m>>2]=l;if((n|0)<(p|0)){n=n+1|0;m=m+4|0}else break}}o=k+8|0;l=j+-1|0;c[o>>2]=l;if(l){ek(e|0,0,l<<2|0)|0;ek(k+655376|0,0,l<<4|0)|0;if((j|0)>1){l=0;do{D=l<<2;c[k+131084+(D<<2)>>2]=f;c[k+131084+((D|1)<<2)>>2]=0;c[k+131084+((D|2)<<2)>>2]=g;c[k+131084+((D|3)<<2)>>2]=0;l=l+1|0}while((l|0)<(c[o>>2]|0))}if((p|0)>0){e=0;do{m=(c[k+1179664+(e<<2)>>2]|0)+-1|0;n=e*7|0;l=k+12+(m<<2)|0;c[l>>2]=(c[l>>2]|0)+(c[k+1310736+(n<<2)>>2]|0);l=m<<1;j=k+655376+(l<<3)|0;h[j>>3]=+h[j>>3]+ +(c[k+1310736+(n+1<<2)>>2]|0);l=k+655376+((l|1)<<3)|0;h[l>>3]=+h[l>>3]+ +(c[k+1310736+(n+2<<2)>>2]|0);m=m<<2;l=k+131084+(m<<2)|0;j=c[k+1310736+(n+3<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;l=k+131084+((m|1)<<2)|0;j=c[k+1310736+(n+4<<2)>>2]|0;if((c[l>>2]|0)<(j|0))c[l>>2]=j;l=k+131084+((m|2)<<2)|0;j=c[k+1310736+(n+5<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;j=k+131084+((m|3)<<2)|0;l=c[k+1310736+(n+6<<2)>>2]|0;if((c[j>>2]|0)<(l|0))c[j>>2]=l;e=e+1|0}while((e|0)<(p|0))}if((c[o>>2]|0)>0){l=0;do{f=k+12+(l<<2)|0;g=l<<1;D=k+655376+(g<<3)|0;h[D>>3]=+h[D>>3]/+(c[f>>2]|0);g=k+655376+((g|1)<<3)|0;h[g>>3]=+h[g>>3]/+(c[f>>2]|0);l=l+1|0}while((l|0)<(c[o>>2]|0));l=0}else l=0}else l=0}i=E;return l|0}function md(e,f,g,j,k){e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;E=i;i=i+16|0;C=E;o=c[k>>2]|0;B=g+-1|0;if((f|0)>0){l=0;m=o;n=o+(($(B,f)|0)<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(f|0))break;else{m=m+2|0;n=n+2|0}}}A=f+-1|0;if((g|0)>0){l=0;m=o;n=o+(A<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(g|0))break;else{m=m+(f<<1)|0;n=n+(f<<1)|0}}}n=k+1179664|0;l=f+1|0;x=0-f|0;v=1-f|0;w=~f;a:do if((B|0)>1){y=(A|0)>1;p=(c[k+4>>2]|0)+l|0;z=1;e=e+l|0;o=o+(l<<1)|0;m=0;b:while(1){if(y){l=p;u=1;t=e;s=m;while(1){do if((d[t>>0]|0|0)>(j|0)){b[o>>1]=0;a[l>>0]=0;m=s}else{a[l>>0]=-1;m=b[o+(x<<1)>>1]|0;if(m<<16>>16>0){b[o>>1]=m;m=(m<<16>>16)*7|0;r=k+1310736+(m+-7<<2)|0;c[r>>2]=(c[r>>2]|0)+1;r=k+1310736+(m+-6<<2)|0;c[r>>2]=(c[r>>2]|0)+u;r=k+1310736+(m+-5<<2)|0;c[r>>2]=(c[r>>2]|0)+z;c[k+1310736+(m+-1<<2)>>2]=z;m=s;break}p=b[o+(v<<1)>>1]|0;q=p<<16>>16;m=b[o+(w<<1)>>1]|0;r=m<<16>>16;e=m<<16>>16>0;if(p<<16>>16<=0){if(e){b[o>>1]=m;m=r*7|0;e=k+1310736+(m+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=k+1310736+(m+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+u;e=k+1310736+(m+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+z;e=k+1310736+(m+-3<<2)|0;if((c[e>>2]|0)<(u|0))c[e>>2]=u;c[k+1310736+(m+-1<<2)>>2]=z;m=s;break}m=b[o+-2>>1]|0;if(m<<16>>16>0){b[o>>1]=m;m=(m<<16>>16)*7|0;r=k+1310736+(m+-7<<2)|0;c[r>>2]=(c[r>>2]|0)+1;r=k+1310736+(m+-6<<2)|0;c[r>>2]=(c[r>>2]|0)+u;r=k+1310736+(m+-5<<2)|0;c[r>>2]=(c[r>>2]|0)+z;m=k+1310736+(m+-3<<2)|0;if((c[m>>2]|0)>=(u|0)){m=s;break}c[m>>2]=u;m=s;break}else{m=s+1|0;if((s|0)>32767)break b;b[o>>1]=m;c[k+1179664+(s<<2)>>2]=m<<16>>16;s=s*7|0;c[k+1310736+(s<<2)>>2]=1;c[k+1310736+(s+1<<2)>>2]=u;c[k+1310736+(s+2<<2)>>2]=z;c[k+1310736+(s+3<<2)>>2]=u;c[k+1310736+(s+4<<2)>>2]=u;c[k+1310736+(s+5<<2)>>2]=z;c[k+1310736+(s+6<<2)>>2]=z;break}}if(e){m=c[k+1179664+(q+-1<<2)>>2]|0;q=c[k+1179664+(r+-1<<2)>>2]|0;if((m|0)>(q|0)){b[o>>1]=q;if((s|0)>0){e=0;p=n;while(1){if((c[p>>2]|0)==(m|0))c[p>>2]=q;e=e+1|0;if((e|0)>=(s|0)){m=q;break}else p=p+4|0}}else m=q}else{b[o>>1]=m;if((m|0)<(q|0)&(s|0)>0){e=0;p=n;while(1){if((c[p>>2]|0)==(q|0))c[p>>2]=m;e=e+1|0;if((e|0)>=(s|0))break;else p=p+4|0}}}m=(m<<16>>16)*7|0;r=k+1310736+(m+-7<<2)|0;c[r>>2]=(c[r>>2]|0)+1;r=k+1310736+(m+-6<<2)|0;c[r>>2]=(c[r>>2]|0)+u;r=k+1310736+(m+-5<<2)|0;c[r>>2]=(c[r>>2]|0)+z;c[k+1310736+(m+-1<<2)>>2]=z;m=s;break}e=b[o+-2>>1]|0;if(e<<16>>16<=0){b[o>>1]=p;m=q*7|0;e=k+1310736+(m+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=k+1310736+(m+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+u;e=k+1310736+(m+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+z;e=k+1310736+(m+-4<<2)|0;if((c[e>>2]|0)>(u|0))c[e>>2]=u;c[k+1310736+(m+-1<<2)>>2]=z;m=s;break}m=c[k+1179664+(q+-1<<2)>>2]|0;q=c[k+1179664+((e<<16>>16)+-1<<2)>>2]|0;if((m|0)>(q|0)){b[o>>1]=q;if((s|0)>0){e=0;p=n;while(1){if((c[p>>2]|0)==(m|0))c[p>>2]=q;e=e+1|0;if((e|0)>=(s|0)){m=q;break}else p=p+4|0}}else m=q}else{b[o>>1]=m;if((m|0)<(q|0)&(s|0)>0){e=0;p=n;while(1){if((c[p>>2]|0)==(q|0))c[p>>2]=m;e=e+1|0;if((e|0)>=(s|0))break;else p=p+4|0}}}m=(m<<16>>16)*7|0;r=k+1310736+(m+-7<<2)|0;c[r>>2]=(c[r>>2]|0)+1;r=k+1310736+(m+-6<<2)|0;c[r>>2]=(c[r>>2]|0)+u;m=k+1310736+(m+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+z;m=s}while(0);u=u+1|0;e=t+1|0;o=o+2|0;l=l+1|0;if((u|0)>=(A|0))break;else{t=e;s=m}}}else l=p;z=z+1|0;if((z|0)>=(B|0)){q=m;D=52;break a}else{p=l+2|0;e=e+2|0;o=o+4|0}}Me(3,3904,C);l=-1}else{q=0;D=52}while(0);if((D|0)==52){o=k+12|0;if((q|0)<1)m=1;else{e=1;m=1;while(1){l=c[n>>2]|0;if((l|0)==(e|0)){l=m;m=m+1|0}else l=c[k+1179664+(l+-1<<2)>>2]|0;c[n>>2]=l;if((e|0)<(q|0)){e=e+1|0;n=n+4|0}else break}}p=k+8|0;l=m+-1|0;c[p>>2]=l;if(l){ek(o|0,0,l<<2|0)|0;ek(k+655376|0,0,l<<4|0)|0;if((m|0)>1){l=0;do{D=l<<2;c[k+131084+(D<<2)>>2]=f;c[k+131084+((D|1)<<2)>>2]=0;c[k+131084+((D|2)<<2)>>2]=g;c[k+131084+((D|3)<<2)>>2]=0;l=l+1|0}while((l|0)<(c[p>>2]|0))}if((q|0)>0){o=0;do{n=(c[k+1179664+(o<<2)>>2]|0)+-1|0;e=o*7|0;l=k+12+(n<<2)|0;c[l>>2]=(c[l>>2]|0)+(c[k+1310736+(e<<2)>>2]|0);l=n<<1;m=k+655376+(l<<3)|0;h[m>>3]=+h[m>>3]+ +(c[k+1310736+(e+1<<2)>>2]|0);l=k+655376+((l|1)<<3)|0;h[l>>3]=+h[l>>3]+ +(c[k+1310736+(e+2<<2)>>2]|0);n=n<<2;l=k+131084+(n<<2)|0;m=c[k+1310736+(e+3<<2)>>2]|0;if((c[l>>2]|0)>(m|0))c[l>>2]=m;l=k+131084+((n|1)<<2)|0;m=c[k+1310736+(e+4<<2)>>2]|0;if((c[l>>2]|0)<(m|0))c[l>>2]=m;l=k+131084+((n|2)<<2)|0;m=c[k+1310736+(e+5<<2)>>2]|0;if((c[l>>2]|0)>(m|0))c[l>>2]=m;m=k+131084+((n|3)<<2)|0;l=c[k+1310736+(e+6<<2)>>2]|0;if((c[m>>2]|0)<(l|0))c[m>>2]=l;o=o+1|0}while((o|0)<(q|0))}if((c[p>>2]|0)>0){l=0;do{f=k+12+(l<<2)|0;g=l<<1;D=k+655376+(g<<3)|0;h[D>>3]=+h[D>>3]/+(c[f>>2]|0);g=k+655376+((g|1)<<3)|0;h[g>>3]=+h[g>>3]/+(c[f>>2]|0);l=l+1|0}while((l|0)<(c[p>>2]|0));l=0}else l=0}else l=0}i=E;return l|0}function nd(e,f,g,j,k){e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;E=i;i=i+16|0;C=E;o=c[k>>2]|0;B=g+-1|0;if((f|0)>0){l=0;m=o;n=o+(($(B,f)|0)<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(f|0))break;else{m=m+2|0;n=n+2|0}}}A=f+-1|0;if((g|0)>0){l=0;m=o;n=o+(A<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(g|0))break;else{m=m+(f<<1)|0;n=n+(f<<1)|0}}}n=k+1179664|0;l=f+1|0;x=0-f|0;v=1-f|0;w=~f;a:do if((B|0)>1){y=(A|0)>1;p=(c[k+4>>2]|0)+l|0;z=1;e=e+(l<<1)|0;o=o+(l<<1)|0;m=0;b:while(1){if(y){l=p;u=1;t=e;s=m;while(1){do if((d[t+1>>0]|0|0)>(j|0)){b[o>>1]=0;a[l>>0]=0;m=s}else{a[l>>0]=-1;m=b[o+(x<<1)>>1]|0;if(m<<16>>16>0){b[o>>1]=m;m=(m<<16>>16)*7|0;r=k+1310736+(m+-7<<2)|0;c[r>>2]=(c[r>>2]|0)+1;r=k+1310736+(m+-6<<2)|0;c[r>>2]=(c[r>>2]|0)+u;r=k+1310736+(m+-5<<2)|0;c[r>>2]=(c[r>>2]|0)+z;c[k+1310736+(m+-1<<2)>>2]=z;m=s;break}p=b[o+(v<<1)>>1]|0;q=p<<16>>16;m=b[o+(w<<1)>>1]|0;r=m<<16>>16;e=m<<16>>16>0;if(p<<16>>16<=0){if(e){b[o>>1]=m;m=r*7|0;e=k+1310736+(m+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=k+1310736+(m+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+u;e=k+1310736+(m+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+z;e=k+1310736+(m+-3<<2)|0;if((c[e>>2]|0)<(u|0))c[e>>2]=u;c[k+1310736+(m+-1<<2)>>2]=z;m=s;break}m=b[o+-2>>1]|0;if(m<<16>>16>0){b[o>>1]=m;m=(m<<16>>16)*7|0;r=k+1310736+(m+-7<<2)|0;c[r>>2]=(c[r>>2]|0)+1;r=k+1310736+(m+-6<<2)|0;c[r>>2]=(c[r>>2]|0)+u;r=k+1310736+(m+-5<<2)|0;c[r>>2]=(c[r>>2]|0)+z;m=k+1310736+(m+-3<<2)|0;if((c[m>>2]|0)>=(u|0)){m=s;break}c[m>>2]=u;m=s;break}else{m=s+1|0;if((s|0)>32767)break b;b[o>>1]=m;c[k+1179664+(s<<2)>>2]=m<<16>>16;s=s*7|0;c[k+1310736+(s<<2)>>2]=1;c[k+1310736+(s+1<<2)>>2]=u;c[k+1310736+(s+2<<2)>>2]=z;c[k+1310736+(s+3<<2)>>2]=u;c[k+1310736+(s+4<<2)>>2]=u;c[k+1310736+(s+5<<2)>>2]=z;c[k+1310736+(s+6<<2)>>2]=z;break}}if(e){m=c[k+1179664+(q+-1<<2)>>2]|0;q=c[k+1179664+(r+-1<<2)>>2]|0;if((m|0)>(q|0)){b[o>>1]=q;if((s|0)>0){e=0;p=n;while(1){if((c[p>>2]|0)==(m|0))c[p>>2]=q;e=e+1|0;if((e|0)>=(s|0)){m=q;break}else p=p+4|0}}else m=q}else{b[o>>1]=m;if((m|0)<(q|0)&(s|0)>0){e=0;p=n;while(1){if((c[p>>2]|0)==(q|0))c[p>>2]=m;e=e+1|0;if((e|0)>=(s|0))break;else p=p+4|0}}}m=(m<<16>>16)*7|0;r=k+1310736+(m+-7<<2)|0;c[r>>2]=(c[r>>2]|0)+1;r=k+1310736+(m+-6<<2)|0;c[r>>2]=(c[r>>2]|0)+u;r=k+1310736+(m+-5<<2)|0;c[r>>2]=(c[r>>2]|0)+z;c[k+1310736+(m+-1<<2)>>2]=z;m=s;break}e=b[o+-2>>1]|0;if(e<<16>>16<=0){b[o>>1]=p;m=q*7|0;e=k+1310736+(m+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=k+1310736+(m+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+u;e=k+1310736+(m+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+z;e=k+1310736+(m+-4<<2)|0;if((c[e>>2]|0)>(u|0))c[e>>2]=u;c[k+1310736+(m+-1<<2)>>2]=z;m=s;break}m=c[k+1179664+(q+-1<<2)>>2]|0;q=c[k+1179664+((e<<16>>16)+-1<<2)>>2]|0;if((m|0)>(q|0)){b[o>>1]=q;if((s|0)>0){e=0;p=n;while(1){if((c[p>>2]|0)==(m|0))c[p>>2]=q;e=e+1|0;if((e|0)>=(s|0)){m=q;break}else p=p+4|0}}else m=q}else{b[o>>1]=m;if((m|0)<(q|0)&(s|0)>0){e=0;p=n;while(1){if((c[p>>2]|0)==(q|0))c[p>>2]=m;e=e+1|0;if((e|0)>=(s|0))break;else p=p+4|0}}}m=(m<<16>>16)*7|0;r=k+1310736+(m+-7<<2)|0;c[r>>2]=(c[r>>2]|0)+1;r=k+1310736+(m+-6<<2)|0;c[r>>2]=(c[r>>2]|0)+u;m=k+1310736+(m+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+z;m=s}while(0);u=u+1|0;e=t+2|0;o=o+2|0;l=l+1|0;if((u|0)>=(A|0))break;else{t=e;s=m}}}else l=p;z=z+1|0;if((z|0)>=(B|0)){q=m;D=52;break a}else{p=l+2|0;e=e+4|0;o=o+4|0}}Me(3,3904,C);l=-1}else{q=0;D=52}while(0);if((D|0)==52){o=k+12|0;if((q|0)<1)m=1;else{e=1;m=1;while(1){l=c[n>>2]|0;if((l|0)==(e|0)){l=m;m=m+1|0}else l=c[k+1179664+(l+-1<<2)>>2]|0;c[n>>2]=l;if((e|0)<(q|0)){e=e+1|0;n=n+4|0}else break}}p=k+8|0;l=m+-1|0;c[p>>2]=l;if(l){ek(o|0,0,l<<2|0)|0;ek(k+655376|0,0,l<<4|0)|0;if((m|0)>1){l=0;do{D=l<<2;c[k+131084+(D<<2)>>2]=f;c[k+131084+((D|1)<<2)>>2]=0;c[k+131084+((D|2)<<2)>>2]=g;c[k+131084+((D|3)<<2)>>2]=0;l=l+1|0}while((l|0)<(c[p>>2]|0))}if((q|0)>0){o=0;do{n=(c[k+1179664+(o<<2)>>2]|0)+-1|0;e=o*7|0;l=k+12+(n<<2)|0;c[l>>2]=(c[l>>2]|0)+(c[k+1310736+(e<<2)>>2]|0);l=n<<1;m=k+655376+(l<<3)|0;h[m>>3]=+h[m>>3]+ +(c[k+1310736+(e+1<<2)>>2]|0);l=k+655376+((l|1)<<3)|0;h[l>>3]=+h[l>>3]+ +(c[k+1310736+(e+2<<2)>>2]|0);n=n<<2;l=k+131084+(n<<2)|0;m=c[k+1310736+(e+3<<2)>>2]|0;if((c[l>>2]|0)>(m|0))c[l>>2]=m;l=k+131084+((n|1)<<2)|0;m=c[k+1310736+(e+4<<2)>>2]|0;if((c[l>>2]|0)<(m|0))c[l>>2]=m;l=k+131084+((n|2)<<2)|0;m=c[k+1310736+(e+5<<2)>>2]|0;if((c[l>>2]|0)>(m|0))c[l>>2]=m;m=k+131084+((n|3)<<2)|0;l=c[k+1310736+(e+6<<2)>>2]|0;if((c[m>>2]|0)<(l|0))c[m>>2]=l;o=o+1|0}while((o|0)<(q|0))}if((c[p>>2]|0)>0){l=0;do{f=k+12+(l<<2)|0;g=l<<1;D=k+655376+(g<<3)|0;h[D>>3]=+h[D>>3]/+(c[f>>2]|0);g=k+655376+((g|1)<<3)|0;h[g>>3]=+h[g>>3]/+(c[f>>2]|0);l=l+1|0}while((l|0)<(c[p>>2]|0));l=0}else l=0}else l=0}i=E;return l|0}function od(e,f,g,j,k){e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;E=i;i=i+16|0;C=E;o=c[k>>2]|0;B=g+-1|0;if((f|0)>0){l=0;m=o;n=o+(($(B,f)|0)<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(f|0))break;else{m=m+2|0;n=n+2|0}}}A=f+-1|0;if((g|0)>0){l=0;m=o;n=o+(A<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(g|0))break;else{m=m+(f<<1)|0;n=n+(f<<1)|0}}}n=k+1179664|0;l=f+1|0;x=0-f|0;v=1-f|0;w=~f;a:do if((B|0)>1){y=(A|0)>1;p=(c[k+4>>2]|0)+l|0;z=1;e=e+(l<<1)|0;o=o+(l<<1)|0;m=0;b:while(1){if(y){l=p;u=1;t=e;s=m;while(1){do if((d[t>>0]|0|0)>(j|0)){b[o>>1]=0;a[l>>0]=0;m=s}else{a[l>>0]=-1;m=b[o+(x<<1)>>1]|0;if(m<<16>>16>0){b[o>>1]=m;m=(m<<16>>16)*7|0;r=k+1310736+(m+-7<<2)|0;c[r>>2]=(c[r>>2]|0)+1;r=k+1310736+(m+-6<<2)|0;c[r>>2]=(c[r>>2]|0)+u;r=k+1310736+(m+-5<<2)|0;c[r>>2]=(c[r>>2]|0)+z;c[k+1310736+(m+-1<<2)>>2]=z;m=s;break}p=b[o+(v<<1)>>1]|0;q=p<<16>>16;m=b[o+(w<<1)>>1]|0;r=m<<16>>16;e=m<<16>>16>0;if(p<<16>>16<=0){if(e){b[o>>1]=m;m=r*7|0;e=k+1310736+(m+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=k+1310736+(m+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+u;e=k+1310736+(m+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+z;e=k+1310736+(m+-3<<2)|0;if((c[e>>2]|0)<(u|0))c[e>>2]=u;c[k+1310736+(m+-1<<2)>>2]=z;m=s;break}m=b[o+-2>>1]|0;if(m<<16>>16>0){b[o>>1]=m;m=(m<<16>>16)*7|0;r=k+1310736+(m+-7<<2)|0;c[r>>2]=(c[r>>2]|0)+1;r=k+1310736+(m+-6<<2)|0;c[r>>2]=(c[r>>2]|0)+u;r=k+1310736+(m+-5<<2)|0;c[r>>2]=(c[r>>2]|0)+z;m=k+1310736+(m+-3<<2)|0;if((c[m>>2]|0)>=(u|0)){m=s;break}c[m>>2]=u;m=s;break}else{m=s+1|0;if((s|0)>32767)break b;b[o>>1]=m;c[k+1179664+(s<<2)>>2]=m<<16>>16;s=s*7|0;c[k+1310736+(s<<2)>>2]=1;c[k+1310736+(s+1<<2)>>2]=u;c[k+1310736+(s+2<<2)>>2]=z;c[k+1310736+(s+3<<2)>>2]=u;c[k+1310736+(s+4<<2)>>2]=u;c[k+1310736+(s+5<<2)>>2]=z;c[k+1310736+(s+6<<2)>>2]=z;break}}if(e){m=c[k+1179664+(q+-1<<2)>>2]|0;q=c[k+1179664+(r+-1<<2)>>2]|0;if((m|0)>(q|0)){b[o>>1]=q;if((s|0)>0){e=0;p=n;while(1){if((c[p>>2]|0)==(m|0))c[p>>2]=q;e=e+1|0;if((e|0)>=(s|0)){m=q;break}else p=p+4|0}}else m=q}else{b[o>>1]=m;if((m|0)<(q|0)&(s|0)>0){e=0;p=n;while(1){if((c[p>>2]|0)==(q|0))c[p>>2]=m;e=e+1|0;if((e|0)>=(s|0))break;else p=p+4|0}}}m=(m<<16>>16)*7|0;r=k+1310736+(m+-7<<2)|0;c[r>>2]=(c[r>>2]|0)+1;r=k+1310736+(m+-6<<2)|0;c[r>>2]=(c[r>>2]|0)+u;r=k+1310736+(m+-5<<2)|0;c[r>>2]=(c[r>>2]|0)+z;c[k+1310736+(m+-1<<2)>>2]=z;m=s;break}e=b[o+-2>>1]|0;if(e<<16>>16<=0){b[o>>1]=p;m=q*7|0;e=k+1310736+(m+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=k+1310736+(m+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+u;e=k+1310736+(m+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+z;e=k+1310736+(m+-4<<2)|0;if((c[e>>2]|0)>(u|0))c[e>>2]=u;c[k+1310736+(m+-1<<2)>>2]=z;m=s;break}m=c[k+1179664+(q+-1<<2)>>2]|0;q=c[k+1179664+((e<<16>>16)+-1<<2)>>2]|0;if((m|0)>(q|0)){b[o>>1]=q;if((s|0)>0){e=0;p=n;while(1){if((c[p>>2]|0)==(m|0))c[p>>2]=q;e=e+1|0;if((e|0)>=(s|0)){m=q;break}else p=p+4|0}}else m=q}else{b[o>>1]=m;if((m|0)<(q|0)&(s|0)>0){e=0;p=n;while(1){if((c[p>>2]|0)==(q|0))c[p>>2]=m;e=e+1|0;if((e|0)>=(s|0))break;else p=p+4|0}}}m=(m<<16>>16)*7|0;r=k+1310736+(m+-7<<2)|0;c[r>>2]=(c[r>>2]|0)+1;r=k+1310736+(m+-6<<2)|0;c[r>>2]=(c[r>>2]|0)+u;m=k+1310736+(m+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+z;m=s}while(0);u=u+1|0;e=t+2|0;o=o+2|0;l=l+1|0;if((u|0)>=(A|0))break;else{t=e;s=m}}}else l=p;z=z+1|0;if((z|0)>=(B|0)){q=m;D=52;break a}else{p=l+2|0;e=e+4|0;o=o+4|0}}Me(3,3904,C);l=-1}else{q=0;D=52}while(0);if((D|0)==52){o=k+12|0;if((q|0)<1)m=1;else{e=1;m=1;while(1){l=c[n>>2]|0;if((l|0)==(e|0)){l=m;m=m+1|0}else l=c[k+1179664+(l+-1<<2)>>2]|0;c[n>>2]=l;if((e|0)<(q|0)){e=e+1|0;n=n+4|0}else break}}p=k+8|0;l=m+-1|0;c[p>>2]=l;if(l){ek(o|0,0,l<<2|0)|0;ek(k+655376|0,0,l<<4|0)|0;if((m|0)>1){l=0;do{D=l<<2;c[k+131084+(D<<2)>>2]=f;c[k+131084+((D|1)<<2)>>2]=0;c[k+131084+((D|2)<<2)>>2]=g;c[k+131084+((D|3)<<2)>>2]=0;l=l+1|0}while((l|0)<(c[p>>2]|0))}if((q|0)>0){o=0;do{n=(c[k+1179664+(o<<2)>>2]|0)+-1|0;e=o*7|0;l=k+12+(n<<2)|0;c[l>>2]=(c[l>>2]|0)+(c[k+1310736+(e<<2)>>2]|0);l=n<<1;m=k+655376+(l<<3)|0;h[m>>3]=+h[m>>3]+ +(c[k+1310736+(e+1<<2)>>2]|0);l=k+655376+((l|1)<<3)|0;h[l>>3]=+h[l>>3]+ +(c[k+1310736+(e+2<<2)>>2]|0);n=n<<2;l=k+131084+(n<<2)|0;m=c[k+1310736+(e+3<<2)>>2]|0;if((c[l>>2]|0)>(m|0))c[l>>2]=m;l=k+131084+((n|1)<<2)|0;m=c[k+1310736+(e+4<<2)>>2]|0;if((c[l>>2]|0)<(m|0))c[l>>2]=m;l=k+131084+((n|2)<<2)|0;m=c[k+1310736+(e+5<<2)>>2]|0;if((c[l>>2]|0)>(m|0))c[l>>2]=m;m=k+131084+((n|3)<<2)|0;l=c[k+1310736+(e+6<<2)>>2]|0;if((c[m>>2]|0)<(l|0))c[m>>2]=l;o=o+1|0}while((o|0)<(q|0))}if((c[p>>2]|0)>0){l=0;do{f=k+12+(l<<2)|0;g=l<<1;D=k+655376+(g<<3)|0;h[D>>3]=+h[D>>3]/+(c[f>>2]|0);g=k+655376+((g|1)<<3)|0;h[g>>3]=+h[g>>3]/+(c[f>>2]|0);l=l+1|0}while((l|0)<(c[p>>2]|0));l=0}else l=0}else l=0}i=E;return l|0}function pd(e,f,g,j,k){e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;E=i;i=i+16|0;C=E;o=c[k>>2]|0;B=g+-1|0;if((f|0)>0){l=0;m=o;n=o+(($(B,f)|0)<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(f|0))break;else{m=m+2|0;n=n+2|0}}}A=f+-1|0;if((g|0)>0){l=0;m=o;n=o+(A<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(g|0))break;else{m=m+(f<<1)|0;n=n+(f<<1)|0}}}n=k+1179664|0;m=f+1|0;x=0-f|0;v=1-f|0;w=~f;a:do if((B|0)>1){y=(A|0)>1;l=(c[k+4>>2]|0)+m|0;z=1;e=e+m|0;o=o+(m<<1)|0;j=j+m|0;m=0;b:while(1){if(y){u=1;t=e;s=m;while(1){do if((d[t>>0]|0)>(d[j>>0]|0)){b[o>>1]=0;a[l>>0]=0;m=s}else{a[l>>0]=-1;m=b[o+(x<<1)>>1]|0;if(m<<16>>16>0){b[o>>1]=m;m=(m<<16>>16)*7|0;r=k+1310736+(m+-7<<2)|0;c[r>>2]=(c[r>>2]|0)+1;r=k+1310736+(m+-6<<2)|0;c[r>>2]=(c[r>>2]|0)+u;r=k+1310736+(m+-5<<2)|0;c[r>>2]=(c[r>>2]|0)+z;c[k+1310736+(m+-1<<2)>>2]=z;m=s;break}p=b[o+(v<<1)>>1]|0;q=p<<16>>16;m=b[o+(w<<1)>>1]|0;r=m<<16>>16;e=m<<16>>16>0;if(p<<16>>16<=0){if(e){b[o>>1]=m;m=r*7|0;e=k+1310736+(m+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=k+1310736+(m+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+u;e=k+1310736+(m+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+z;e=k+1310736+(m+-3<<2)|0;if((c[e>>2]|0)<(u|0))c[e>>2]=u;c[k+1310736+(m+-1<<2)>>2]=z;m=s;break}m=b[o+-2>>1]|0;if(m<<16>>16>0){b[o>>1]=m;m=(m<<16>>16)*7|0;r=k+1310736+(m+-7<<2)|0;c[r>>2]=(c[r>>2]|0)+1;r=k+1310736+(m+-6<<2)|0;c[r>>2]=(c[r>>2]|0)+u;r=k+1310736+(m+-5<<2)|0;c[r>>2]=(c[r>>2]|0)+z;m=k+1310736+(m+-3<<2)|0;if((c[m>>2]|0)>=(u|0)){m=s;break}c[m>>2]=u;m=s;break}else{m=s+1|0;if((s|0)>32767)break b;b[o>>1]=m;c[k+1179664+(s<<2)>>2]=m<<16>>16;s=s*7|0;c[k+1310736+(s<<2)>>2]=1;c[k+1310736+(s+1<<2)>>2]=u;c[k+1310736+(s+2<<2)>>2]=z;c[k+1310736+(s+3<<2)>>2]=u;c[k+1310736+(s+4<<2)>>2]=u;c[k+1310736+(s+5<<2)>>2]=z;c[k+1310736+(s+6<<2)>>2]=z;break}}if(e){m=c[k+1179664+(q+-1<<2)>>2]|0;q=c[k+1179664+(r+-1<<2)>>2]|0;if((m|0)>(q|0)){b[o>>1]=q;if((s|0)>0){e=0;p=n;while(1){if((c[p>>2]|0)==(m|0))c[p>>2]=q;e=e+1|0;if((e|0)>=(s|0)){m=q;break}else p=p+4|0}}else m=q}else{b[o>>1]=m;if((m|0)<(q|0)&(s|0)>0){e=0;p=n;while(1){if((c[p>>2]|0)==(q|0))c[p>>2]=m;e=e+1|0;if((e|0)>=(s|0))break;else p=p+4|0}}}m=(m<<16>>16)*7|0;r=k+1310736+(m+-7<<2)|0;c[r>>2]=(c[r>>2]|0)+1;r=k+1310736+(m+-6<<2)|0;c[r>>2]=(c[r>>2]|0)+u;r=k+1310736+(m+-5<<2)|0;c[r>>2]=(c[r>>2]|0)+z;c[k+1310736+(m+-1<<2)>>2]=z;m=s;break}e=b[o+-2>>1]|0;if(e<<16>>16<=0){b[o>>1]=p;m=q*7|0;e=k+1310736+(m+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=k+1310736+(m+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+u;e=k+1310736+(m+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+z;e=k+1310736+(m+-4<<2)|0;if((c[e>>2]|0)>(u|0))c[e>>2]=u;c[k+1310736+(m+-1<<2)>>2]=z;m=s;break}m=c[k+1179664+(q+-1<<2)>>2]|0;q=c[k+1179664+((e<<16>>16)+-1<<2)>>2]|0;if((m|0)>(q|0)){b[o>>1]=q;if((s|0)>0){e=0;p=n;while(1){if((c[p>>2]|0)==(m|0))c[p>>2]=q;e=e+1|0;if((e|0)>=(s|0)){m=q;break}else p=p+4|0}}else m=q}else{b[o>>1]=m;if((m|0)<(q|0)&(s|0)>0){e=0;p=n;while(1){if((c[p>>2]|0)==(q|0))c[p>>2]=m;e=e+1|0;if((e|0)>=(s|0))break;else p=p+4|0}}}m=(m<<16>>16)*7|0;r=k+1310736+(m+-7<<2)|0;c[r>>2]=(c[r>>2]|0)+1;r=k+1310736+(m+-6<<2)|0;c[r>>2]=(c[r>>2]|0)+u;m=k+1310736+(m+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+z;m=s}while(0);u=u+1|0;e=t+1|0;j=j+1|0;o=o+2|0;l=l+1|0;if((u|0)>=(A|0))break;else{t=e;s=m}}}z=z+1|0;if((z|0)>=(B|0)){p=m;D=52;break a}else{l=l+2|0;e=e+2|0;o=o+4|0;j=j+2|0}}Me(3,3904,C);l=-1}else{p=0;D=52}while(0);if((D|0)==52){o=k+12|0;if((p|0)<1)m=1;else{e=1;m=1;while(1){l=c[n>>2]|0;if((l|0)==(e|0)){l=m;m=m+1|0}else l=c[k+1179664+(l+-1<<2)>>2]|0;c[n>>2]=l;if((e|0)<(p|0)){e=e+1|0;n=n+4|0}else break}}j=k+8|0;l=m+-1|0;c[j>>2]=l;if(l){ek(o|0,0,l<<2|0)|0;ek(k+655376|0,0,l<<4|0)|0;if((m|0)>1){l=0;do{D=l<<2;c[k+131084+(D<<2)>>2]=f;c[k+131084+((D|1)<<2)>>2]=0;c[k+131084+((D|2)<<2)>>2]=g;c[k+131084+((D|3)<<2)>>2]=0;l=l+1|0}while((l|0)<(c[j>>2]|0))}if((p|0)>0){o=0;do{n=(c[k+1179664+(o<<2)>>2]|0)+-1|0;e=o*7|0;l=k+12+(n<<2)|0;c[l>>2]=(c[l>>2]|0)+(c[k+1310736+(e<<2)>>2]|0);l=n<<1;m=k+655376+(l<<3)|0;h[m>>3]=+h[m>>3]+ +(c[k+1310736+(e+1<<2)>>2]|0);l=k+655376+((l|1)<<3)|0;h[l>>3]=+h[l>>3]+ +(c[k+1310736+(e+2<<2)>>2]|0);n=n<<2;l=k+131084+(n<<2)|0;m=c[k+1310736+(e+3<<2)>>2]|0;if((c[l>>2]|0)>(m|0))c[l>>2]=m;l=k+131084+((n|1)<<2)|0;m=c[k+1310736+(e+4<<2)>>2]|0;if((c[l>>2]|0)<(m|0))c[l>>2]=m;l=k+131084+((n|2)<<2)|0;m=c[k+1310736+(e+5<<2)>>2]|0;if((c[l>>2]|0)>(m|0))c[l>>2]=m;m=k+131084+((n|3)<<2)|0;l=c[k+1310736+(e+6<<2)>>2]|0;if((c[m>>2]|0)<(l|0))c[m>>2]=l;o=o+1|0}while((o|0)<(p|0))}if((c[j>>2]|0)>0){l=0;do{f=k+12+(l<<2)|0;g=l<<1;D=k+655376+(g<<3)|0;h[D>>3]=+h[D>>3]/+(c[f>>2]|0);g=k+655376+((g|1)<<3)|0;h[g>>3]=+h[g>>3]/+(c[f>>2]|0);l=l+1|0}while((l|0)<(c[j>>2]|0));l=0}else l=0}else l=0}i=E;return l|0}function qd(e,f,g,j,k){e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;F=i;i=i+16|0;B=F;D=(f|0)/2|0;E=(g|0)/2|0;o=c[k>>2]|0;A=E+-1|0;if((f|0)>1){l=0;m=o;n=o+(($(A,D)|0)<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(D|0))break;else{m=m+2|0;n=n+2|0}}}y=j*3|0;z=D+-1|0;if((g|0)>1){l=0;j=o;m=o+(z<<1)|0;while(1){b[m>>1]=0;b[j>>1]=0;l=l+1|0;if((l|0)>=(E|0))break;else{j=j+(D<<1)|0;m=m+(D<<1)|0}}}m=k+1179664|0;j=D+1|0;v=0-D|0;t=1-D|0;u=~D;s=(f*3|0)+12|0;a:do if((A|0)>1){w=(z|0)>1;l=(c[k+4>>2]|0)+j|0;x=1;n=e+((f*6|0)+6)|0;g=o+(j<<1)|0;j=0;b:while(1){if(w){r=1;q=n;p=j;while(1){do if(((d[q+1>>0]|0)+(d[q>>0]|0)+(d[q+2>>0]|0)|0)>(y|0)){a[l>>0]=-1;j=b[g+(v<<1)>>1]|0;if(j<<16>>16>0){b[g>>1]=j;j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=k+1310736+(j+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+x;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}e=b[g+(t<<1)>>1]|0;f=e<<16>>16;j=b[g+(u<<1)>>1]|0;o=j<<16>>16;n=j<<16>>16>0;if(e<<16>>16<=0){if(n){b[g>>1]=j;j=o*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+r;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+x;n=k+1310736+(j+-3<<2)|0;if((c[n>>2]|0)<(r|0))c[n>>2]=r;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}j=b[g+-2>>1]|0;if(j<<16>>16>0){b[g>>1]=j;j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=k+1310736+(j+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+x;j=k+1310736+(j+-3<<2)|0;if((c[j>>2]|0)>=(r|0)){j=p;break}c[j>>2]=r;j=p;break}else{j=p+1|0;if((p|0)>32767)break b;b[g>>1]=j;c[k+1179664+(p<<2)>>2]=j<<16>>16;p=p*7|0;c[k+1310736+(p<<2)>>2]=1;c[k+1310736+(p+1<<2)>>2]=r;c[k+1310736+(p+2<<2)>>2]=x;c[k+1310736+(p+3<<2)>>2]=r;c[k+1310736+(p+4<<2)>>2]=r;c[k+1310736+(p+5<<2)>>2]=x;c[k+1310736+(p+6<<2)>>2]=x;break}}if(n){j=c[k+1179664+(f+-1<<2)>>2]|0;f=c[k+1179664+(o+-1<<2)>>2]|0;if((j|0)>(f|0)){b[g>>1]=f;if((p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(j|0))c[e>>2]=f;n=n+1|0;if((n|0)>=(p|0)){j=f;break}else e=e+4|0}}else j=f}else{b[g>>1]=j;if((j|0)<(f|0)&(p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(f|0))c[e>>2]=j;n=n+1|0;if((n|0)>=(p|0))break;else e=e+4|0}}}j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=k+1310736+(j+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+x;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}n=b[g+-2>>1]|0;if(n<<16>>16<=0){b[g>>1]=e;j=f*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+r;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+x;n=k+1310736+(j+-4<<2)|0;if((c[n>>2]|0)>(r|0))c[n>>2]=r;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}j=c[k+1179664+(f+-1<<2)>>2]|0;f=c[k+1179664+((n<<16>>16)+-1<<2)>>2]|0;if((j|0)>(f|0)){b[g>>1]=f;if((p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(j|0))c[e>>2]=f;n=n+1|0;if((n|0)>=(p|0)){j=f;break}else e=e+4|0}}else j=f}else{b[g>>1]=j;if((j|0)<(f|0)&(p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(f|0))c[e>>2]=j;n=n+1|0;if((n|0)>=(p|0))break;else e=e+4|0}}}j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;j=k+1310736+(j+-5<<2)|0;c[j>>2]=(c[j>>2]|0)+x;j=p}else{b[g>>1]=0;a[l>>0]=0;j=p}while(0);r=r+1|0;n=q+6|0;g=g+2|0;l=l+1|0;if((r|0)>=(z|0))break;else{q=n;p=j}}}x=x+1|0;if((x|0)>=(A|0)){f=j;C=52;break a}else{l=l+2|0;n=n+s|0;g=g+4|0}}Me(3,3904,B);l=-1}else{f=0;C=52}while(0);if((C|0)==52){g=k+12|0;if((f|0)<1)j=1;else{n=1;j=1;while(1){l=c[m>>2]|0;if((l|0)==(n|0)){l=j;j=j+1|0}else l=c[k+1179664+(l+-1<<2)>>2]|0;c[m>>2]=l;if((n|0)<(f|0)){n=n+1|0;m=m+4|0}else break}}e=k+8|0;l=j+-1|0;c[e>>2]=l;if(l){ek(g|0,0,l<<2|0)|0;ek(k+655376|0,0,l<<4|0)|0;if((j|0)>1){l=0;do{C=l<<2;c[k+131084+(C<<2)>>2]=D;c[k+131084+((C|1)<<2)>>2]=0;c[k+131084+((C|2)<<2)>>2]=E;c[k+131084+((C|3)<<2)>>2]=0;l=l+1|0}while((l|0)<(c[e>>2]|0))}if((f|0)>0){g=0;do{m=(c[k+1179664+(g<<2)>>2]|0)+-1|0;n=g*7|0;l=k+12+(m<<2)|0;c[l>>2]=(c[l>>2]|0)+(c[k+1310736+(n<<2)>>2]|0);l=m<<1;j=k+655376+(l<<3)|0;h[j>>3]=+h[j>>3]+ +(c[k+1310736+(n+1<<2)>>2]|0);l=k+655376+((l|1)<<3)|0;h[l>>3]=+h[l>>3]+ +(c[k+1310736+(n+2<<2)>>2]|0);m=m<<2;l=k+131084+(m<<2)|0;j=c[k+1310736+(n+3<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;l=k+131084+((m|1)<<2)|0;j=c[k+1310736+(n+4<<2)>>2]|0;if((c[l>>2]|0)<(j|0))c[l>>2]=j;l=k+131084+((m|2)<<2)|0;j=c[k+1310736+(n+5<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;j=k+131084+((m|3)<<2)|0;l=c[k+1310736+(n+6<<2)>>2]|0;if((c[j>>2]|0)<(l|0))c[j>>2]=l;g=g+1|0}while((g|0)<(f|0))}if((c[e>>2]|0)>0){l=0;do{D=k+12+(l<<2)|0;E=l<<1;C=k+655376+(E<<3)|0;h[C>>3]=+h[C>>3]/+(c[D>>2]|0);E=k+655376+((E|1)<<3)|0;h[E>>3]=+h[E>>3]/+(c[D>>2]|0);l=l+1|0}while((l|0)<(c[e>>2]|0));l=0}else l=0}else l=0}i=F;return l|0}function rd(e,f,g,j,k){e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;F=i;i=i+16|0;B=F;D=(f|0)/2|0;E=(g|0)/2|0;o=c[k>>2]|0;A=E+-1|0;if((f|0)>1){l=0;m=o;n=o+(($(A,D)|0)<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(D|0))break;else{m=m+2|0;n=n+2|0}}}y=j*3|0;z=D+-1|0;if((g|0)>1){l=0;j=o;m=o+(z<<1)|0;while(1){b[m>>1]=0;b[j>>1]=0;l=l+1|0;if((l|0)>=(E|0))break;else{j=j+(D<<1)|0;m=m+(D<<1)|0}}}m=k+1179664|0;j=D+1|0;v=0-D|0;t=1-D|0;u=~D;s=(f<<1)+8|0;a:do if((A|0)>1){w=(z|0)>1;l=(c[k+4>>2]|0)+j|0;x=1;n=e+((f<<2)+4)|0;g=o+(j<<1)|0;j=0;b:while(1){if(w){r=1;q=n;p=j;while(1){f=d[q>>0]|0;o=d[q+1>>0]|0;do if(((f&248)+10+(f<<5&224)+(o>>>3&28)+(o<<3&248)|0)>(y|0)){a[l>>0]=-1;j=b[g+(v<<1)>>1]|0;if(j<<16>>16>0){b[g>>1]=j;j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=k+1310736+(j+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+x;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}e=b[g+(t<<1)>>1]|0;f=e<<16>>16;j=b[g+(u<<1)>>1]|0;o=j<<16>>16;n=j<<16>>16>0;if(e<<16>>16<=0){if(n){b[g>>1]=j;j=o*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+r;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+x;n=k+1310736+(j+-3<<2)|0;if((c[n>>2]|0)<(r|0))c[n>>2]=r;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}j=b[g+-2>>1]|0;if(j<<16>>16>0){b[g>>1]=j;j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=k+1310736+(j+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+x;j=k+1310736+(j+-3<<2)|0;if((c[j>>2]|0)>=(r|0)){j=p;break}c[j>>2]=r;j=p;break}else{j=p+1|0;if((p|0)>32767)break b;b[g>>1]=j;c[k+1179664+(p<<2)>>2]=j<<16>>16;p=p*7|0;c[k+1310736+(p<<2)>>2]=1;c[k+1310736+(p+1<<2)>>2]=r;c[k+1310736+(p+2<<2)>>2]=x;c[k+1310736+(p+3<<2)>>2]=r;c[k+1310736+(p+4<<2)>>2]=r;c[k+1310736+(p+5<<2)>>2]=x;c[k+1310736+(p+6<<2)>>2]=x;break}}if(n){j=c[k+1179664+(f+-1<<2)>>2]|0;f=c[k+1179664+(o+-1<<2)>>2]|0;if((j|0)>(f|0)){b[g>>1]=f;if((p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(j|0))c[e>>2]=f;n=n+1|0;if((n|0)>=(p|0)){j=f;break}else e=e+4|0}}else j=f}else{b[g>>1]=j;if((j|0)<(f|0)&(p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(f|0))c[e>>2]=j;n=n+1|0;if((n|0)>=(p|0))break;else e=e+4|0}}}j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=k+1310736+(j+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+x;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}n=b[g+-2>>1]|0;if(n<<16>>16<=0){b[g>>1]=e;j=f*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+r;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+x;n=k+1310736+(j+-4<<2)|0;if((c[n>>2]|0)>(r|0))c[n>>2]=r;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}j=c[k+1179664+(f+-1<<2)>>2]|0;f=c[k+1179664+((n<<16>>16)+-1<<2)>>2]|0;if((j|0)>(f|0)){b[g>>1]=f;if((p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(j|0))c[e>>2]=f;n=n+1|0;if((n|0)>=(p|0)){j=f;break}else e=e+4|0}}else j=f}else{b[g>>1]=j;if((j|0)<(f|0)&(p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(f|0))c[e>>2]=j;n=n+1|0;if((n|0)>=(p|0))break;else e=e+4|0}}}j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;j=k+1310736+(j+-5<<2)|0;c[j>>2]=(c[j>>2]|0)+x;j=p}else{b[g>>1]=0;a[l>>0]=0;j=p}while(0);r=r+1|0;n=q+4|0;g=g+2|0;l=l+1|0;if((r|0)>=(z|0))break;else{q=n;p=j}}}x=x+1|0;if((x|0)>=(A|0)){f=j;C=52;break a}else{l=l+2|0;n=n+s|0;g=g+4|0}}Me(3,3904,B);l=-1}else{f=0;C=52}while(0);if((C|0)==52){g=k+12|0;if((f|0)<1)j=1;else{n=1;j=1;while(1){l=c[m>>2]|0;if((l|0)==(n|0)){l=j;j=j+1|0}else l=c[k+1179664+(l+-1<<2)>>2]|0;c[m>>2]=l;if((n|0)<(f|0)){n=n+1|0;m=m+4|0}else break}}e=k+8|0;l=j+-1|0;c[e>>2]=l;if(l){ek(g|0,0,l<<2|0)|0;ek(k+655376|0,0,l<<4|0)|0;if((j|0)>1){l=0;do{C=l<<2;c[k+131084+(C<<2)>>2]=D;c[k+131084+((C|1)<<2)>>2]=0;c[k+131084+((C|2)<<2)>>2]=E;c[k+131084+((C|3)<<2)>>2]=0;l=l+1|0}while((l|0)<(c[e>>2]|0))}if((f|0)>0){g=0;do{m=(c[k+1179664+(g<<2)>>2]|0)+-1|0;n=g*7|0;l=k+12+(m<<2)|0;c[l>>2]=(c[l>>2]|0)+(c[k+1310736+(n<<2)>>2]|0);l=m<<1;j=k+655376+(l<<3)|0;h[j>>3]=+h[j>>3]+ +(c[k+1310736+(n+1<<2)>>2]|0);l=k+655376+((l|1)<<3)|0;h[l>>3]=+h[l>>3]+ +(c[k+1310736+(n+2<<2)>>2]|0);m=m<<2;l=k+131084+(m<<2)|0;j=c[k+1310736+(n+3<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;l=k+131084+((m|1)<<2)|0;j=c[k+1310736+(n+4<<2)>>2]|0;if((c[l>>2]|0)<(j|0))c[l>>2]=j;l=k+131084+((m|2)<<2)|0;j=c[k+1310736+(n+5<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;j=k+131084+((m|3)<<2)|0;l=c[k+1310736+(n+6<<2)>>2]|0;if((c[j>>2]|0)<(l|0))c[j>>2]=l;g=g+1|0}while((g|0)<(f|0))}if((c[e>>2]|0)>0){l=0;do{D=k+12+(l<<2)|0;E=l<<1;C=k+655376+(E<<3)|0;h[C>>3]=+h[C>>3]/+(c[D>>2]|0);E=k+655376+((E|1)<<3)|0;h[E>>3]=+h[E>>3]/+(c[D>>2]|0);l=l+1|0}while((l|0)<(c[e>>2]|0));l=0}else l=0}else l=0}i=F;return l|0}function sd(e,f,g,j,k){e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;F=i;i=i+16|0;B=F;D=(f|0)/2|0;E=(g|0)/2|0;o=c[k>>2]|0;A=E+-1|0;if((f|0)>1){l=0;m=o;n=o+(($(A,D)|0)<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(D|0))break;else{m=m+2|0;n=n+2|0}}}y=j*3|0;z=D+-1|0;if((g|0)>1){l=0;j=o;m=o+(z<<1)|0;while(1){b[m>>1]=0;b[j>>1]=0;l=l+1|0;if((l|0)>=(E|0))break;else{j=j+(D<<1)|0;m=m+(D<<1)|0}}}m=k+1179664|0;j=D+1|0;v=0-D|0;t=1-D|0;u=~D;s=(f<<2)+16|0;a:do if((A|0)>1){w=(z|0)>1;l=(c[k+4>>2]|0)+j|0;x=1;n=e+((f<<3)+8)|0;g=o+(j<<1)|0;j=0;b:while(1){if(w){r=1;q=n;p=j;while(1){do if(((d[q+1>>0]|0)+(d[q>>0]|0)+(d[q+2>>0]|0)|0)>(y|0)){a[l>>0]=-1;j=b[g+(v<<1)>>1]|0;if(j<<16>>16>0){b[g>>1]=j;j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=k+1310736+(j+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+x;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}e=b[g+(t<<1)>>1]|0;f=e<<16>>16;j=b[g+(u<<1)>>1]|0;o=j<<16>>16;n=j<<16>>16>0;if(e<<16>>16<=0){if(n){b[g>>1]=j;j=o*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+r;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+x;n=k+1310736+(j+-3<<2)|0;if((c[n>>2]|0)<(r|0))c[n>>2]=r;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}j=b[g+-2>>1]|0;if(j<<16>>16>0){b[g>>1]=j;j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=k+1310736+(j+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+x;j=k+1310736+(j+-3<<2)|0;if((c[j>>2]|0)>=(r|0)){j=p;break}c[j>>2]=r;j=p;break}else{j=p+1|0;if((p|0)>32767)break b;b[g>>1]=j;c[k+1179664+(p<<2)>>2]=j<<16>>16;p=p*7|0;c[k+1310736+(p<<2)>>2]=1;c[k+1310736+(p+1<<2)>>2]=r;c[k+1310736+(p+2<<2)>>2]=x;c[k+1310736+(p+3<<2)>>2]=r;c[k+1310736+(p+4<<2)>>2]=r;c[k+1310736+(p+5<<2)>>2]=x;c[k+1310736+(p+6<<2)>>2]=x;break}}if(n){j=c[k+1179664+(f+-1<<2)>>2]|0;f=c[k+1179664+(o+-1<<2)>>2]|0;if((j|0)>(f|0)){b[g>>1]=f;if((p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(j|0))c[e>>2]=f;n=n+1|0;if((n|0)>=(p|0)){j=f;break}else e=e+4|0}}else j=f}else{b[g>>1]=j;if((j|0)<(f|0)&(p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(f|0))c[e>>2]=j;n=n+1|0;if((n|0)>=(p|0))break;else e=e+4|0}}}j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=k+1310736+(j+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+x;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}n=b[g+-2>>1]|0;if(n<<16>>16<=0){b[g>>1]=e;j=f*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+r;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+x;n=k+1310736+(j+-4<<2)|0;if((c[n>>2]|0)>(r|0))c[n>>2]=r;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}j=c[k+1179664+(f+-1<<2)>>2]|0;f=c[k+1179664+((n<<16>>16)+-1<<2)>>2]|0;if((j|0)>(f|0)){b[g>>1]=f;if((p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(j|0))c[e>>2]=f;n=n+1|0;if((n|0)>=(p|0)){j=f;break}else e=e+4|0}}else j=f}else{b[g>>1]=j;if((j|0)<(f|0)&(p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(f|0))c[e>>2]=j;n=n+1|0;if((n|0)>=(p|0))break;else e=e+4|0}}}j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;j=k+1310736+(j+-5<<2)|0;c[j>>2]=(c[j>>2]|0)+x;j=p}else{b[g>>1]=0;a[l>>0]=0;j=p}while(0);r=r+1|0;n=q+8|0;g=g+2|0;l=l+1|0;if((r|0)>=(z|0))break;else{q=n;p=j}}}x=x+1|0;if((x|0)>=(A|0)){f=j;C=52;break a}else{l=l+2|0;n=n+s|0;g=g+4|0}}Me(3,3904,B);l=-1}else{f=0;C=52}while(0);if((C|0)==52){g=k+12|0;if((f|0)<1)j=1;else{n=1;j=1;while(1){l=c[m>>2]|0;if((l|0)==(n|0)){l=j;j=j+1|0}else l=c[k+1179664+(l+-1<<2)>>2]|0;c[m>>2]=l;if((n|0)<(f|0)){n=n+1|0;m=m+4|0}else break}}e=k+8|0;l=j+-1|0;c[e>>2]=l;if(l){ek(g|0,0,l<<2|0)|0;ek(k+655376|0,0,l<<4|0)|0;if((j|0)>1){l=0;do{C=l<<2;c[k+131084+(C<<2)>>2]=D;c[k+131084+((C|1)<<2)>>2]=0;c[k+131084+((C|2)<<2)>>2]=E;c[k+131084+((C|3)<<2)>>2]=0;l=l+1|0}while((l|0)<(c[e>>2]|0))}if((f|0)>0){g=0;do{m=(c[k+1179664+(g<<2)>>2]|0)+-1|0;n=g*7|0;l=k+12+(m<<2)|0;c[l>>2]=(c[l>>2]|0)+(c[k+1310736+(n<<2)>>2]|0);l=m<<1;j=k+655376+(l<<3)|0;h[j>>3]=+h[j>>3]+ +(c[k+1310736+(n+1<<2)>>2]|0);l=k+655376+((l|1)<<3)|0;h[l>>3]=+h[l>>3]+ +(c[k+1310736+(n+2<<2)>>2]|0);m=m<<2;l=k+131084+(m<<2)|0;j=c[k+1310736+(n+3<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;l=k+131084+((m|1)<<2)|0;j=c[k+1310736+(n+4<<2)>>2]|0;if((c[l>>2]|0)<(j|0))c[l>>2]=j;l=k+131084+((m|2)<<2)|0;j=c[k+1310736+(n+5<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;j=k+131084+((m|3)<<2)|0;l=c[k+1310736+(n+6<<2)>>2]|0;if((c[j>>2]|0)<(l|0))c[j>>2]=l;g=g+1|0}while((g|0)<(f|0))}if((c[e>>2]|0)>0){l=0;do{D=k+12+(l<<2)|0;E=l<<1;C=k+655376+(E<<3)|0;h[C>>3]=+h[C>>3]/+(c[D>>2]|0);E=k+655376+((E|1)<<3)|0;h[E>>3]=+h[E>>3]/+(c[D>>2]|0);l=l+1|0}while((l|0)<(c[e>>2]|0));l=0}else l=0}else l=0}i=F;return l|0}function td(e,f,g,j,k){e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;F=i;i=i+16|0;B=F;D=(f|0)/2|0;E=(g|0)/2|0;o=c[k>>2]|0;A=E+-1|0;if((f|0)>1){l=0;m=o;n=o+(($(A,D)|0)<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(D|0))break;else{m=m+2|0;n=n+2|0}}}y=j*3|0;z=D+-1|0;if((g|0)>1){l=0;j=o;m=o+(z<<1)|0;while(1){b[m>>1]=0;b[j>>1]=0;l=l+1|0;if((l|0)>=(E|0))break;else{j=j+(D<<1)|0;m=m+(D<<1)|0}}}m=k+1179664|0;j=D+1|0;v=0-D|0;t=1-D|0;u=~D;s=(f<<1)+8|0;a:do if((A|0)>1){w=(z|0)>1;l=(c[k+4>>2]|0)+j|0;x=1;n=e+((f<<2)+4)|0;g=o+(j<<1)|0;j=0;b:while(1){if(w){r=1;q=n;p=j;while(1){o=d[q>>0]|0;do if(((o&240)+24+(o<<4&240)+((d[q+1>>0]|0)&240)|0)>(y|0)){a[l>>0]=-1;j=b[g+(v<<1)>>1]|0;if(j<<16>>16>0){b[g>>1]=j;j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=k+1310736+(j+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+x;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}e=b[g+(t<<1)>>1]|0;f=e<<16>>16;j=b[g+(u<<1)>>1]|0;o=j<<16>>16;n=j<<16>>16>0;if(e<<16>>16<=0){if(n){b[g>>1]=j;j=o*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+r;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+x;n=k+1310736+(j+-3<<2)|0;if((c[n>>2]|0)<(r|0))c[n>>2]=r;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}j=b[g+-2>>1]|0;if(j<<16>>16>0){b[g>>1]=j;j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=k+1310736+(j+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+x;j=k+1310736+(j+-3<<2)|0;if((c[j>>2]|0)>=(r|0)){j=p;break}c[j>>2]=r;j=p;break}else{j=p+1|0;if((p|0)>32767)break b;b[g>>1]=j;c[k+1179664+(p<<2)>>2]=j<<16>>16;p=p*7|0;c[k+1310736+(p<<2)>>2]=1;c[k+1310736+(p+1<<2)>>2]=r;c[k+1310736+(p+2<<2)>>2]=x;c[k+1310736+(p+3<<2)>>2]=r;c[k+1310736+(p+4<<2)>>2]=r;c[k+1310736+(p+5<<2)>>2]=x;c[k+1310736+(p+6<<2)>>2]=x;break}}if(n){j=c[k+1179664+(f+-1<<2)>>2]|0;f=c[k+1179664+(o+-1<<2)>>2]|0;if((j|0)>(f|0)){b[g>>1]=f;if((p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(j|0))c[e>>2]=f;n=n+1|0;if((n|0)>=(p|0)){j=f;break}else e=e+4|0}}else j=f}else{b[g>>1]=j;if((j|0)<(f|0)&(p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(f|0))c[e>>2]=j;n=n+1|0;if((n|0)>=(p|0))break;else e=e+4|0}}}j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=k+1310736+(j+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+x;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}n=b[g+-2>>1]|0;if(n<<16>>16<=0){b[g>>1]=e;j=f*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+r;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+x;n=k+1310736+(j+-4<<2)|0;if((c[n>>2]|0)>(r|0))c[n>>2]=r;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}j=c[k+1179664+(f+-1<<2)>>2]|0;f=c[k+1179664+((n<<16>>16)+-1<<2)>>2]|0;if((j|0)>(f|0)){b[g>>1]=f;if((p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(j|0))c[e>>2]=f;n=n+1|0;if((n|0)>=(p|0)){j=f;break}else e=e+4|0}}else j=f}else{b[g>>1]=j;if((j|0)<(f|0)&(p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(f|0))c[e>>2]=j;n=n+1|0;if((n|0)>=(p|0))break;else e=e+4|0}}}j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;j=k+1310736+(j+-5<<2)|0;c[j>>2]=(c[j>>2]|0)+x;j=p}else{b[g>>1]=0;a[l>>0]=0;j=p}while(0);r=r+1|0;n=q+4|0;g=g+2|0;l=l+1|0;if((r|0)>=(z|0))break;else{q=n;p=j}}}x=x+1|0;if((x|0)>=(A|0)){f=j;C=52;break a}else{l=l+2|0;n=n+s|0;g=g+4|0}}Me(3,3904,B);l=-1}else{f=0;C=52}while(0);if((C|0)==52){g=k+12|0;if((f|0)<1)j=1;else{n=1;j=1;while(1){l=c[m>>2]|0;if((l|0)==(n|0)){l=j;j=j+1|0}else l=c[k+1179664+(l+-1<<2)>>2]|0;c[m>>2]=l;if((n|0)<(f|0)){n=n+1|0;m=m+4|0}else break}}e=k+8|0;l=j+-1|0;c[e>>2]=l;if(l){ek(g|0,0,l<<2|0)|0;ek(k+655376|0,0,l<<4|0)|0;if((j|0)>1){l=0;do{C=l<<2;c[k+131084+(C<<2)>>2]=D;c[k+131084+((C|1)<<2)>>2]=0;c[k+131084+((C|2)<<2)>>2]=E;c[k+131084+((C|3)<<2)>>2]=0;l=l+1|0}while((l|0)<(c[e>>2]|0))}if((f|0)>0){g=0;do{m=(c[k+1179664+(g<<2)>>2]|0)+-1|0;n=g*7|0;l=k+12+(m<<2)|0;c[l>>2]=(c[l>>2]|0)+(c[k+1310736+(n<<2)>>2]|0);l=m<<1;j=k+655376+(l<<3)|0;h[j>>3]=+h[j>>3]+ +(c[k+1310736+(n+1<<2)>>2]|0);l=k+655376+((l|1)<<3)|0;h[l>>3]=+h[l>>3]+ +(c[k+1310736+(n+2<<2)>>2]|0);m=m<<2;l=k+131084+(m<<2)|0;j=c[k+1310736+(n+3<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;l=k+131084+((m|1)<<2)|0;j=c[k+1310736+(n+4<<2)>>2]|0;if((c[l>>2]|0)<(j|0))c[l>>2]=j;l=k+131084+((m|2)<<2)|0;j=c[k+1310736+(n+5<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;j=k+131084+((m|3)<<2)|0;l=c[k+1310736+(n+6<<2)>>2]|0;if((c[j>>2]|0)<(l|0))c[j>>2]=l;g=g+1|0}while((g|0)<(f|0))}if((c[e>>2]|0)>0){l=0;do{D=k+12+(l<<2)|0;E=l<<1;C=k+655376+(E<<3)|0;h[C>>3]=+h[C>>3]/+(c[D>>2]|0);E=k+655376+((E|1)<<3)|0;h[E>>3]=+h[E>>3]/+(c[D>>2]|0);l=l+1|0}while((l|0)<(c[e>>2]|0));l=0}else l=0}else l=0}i=F;return l|0}function ud(e,f,g,j,k){e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;F=i;i=i+16|0;B=F;D=(f|0)/2|0;E=(g|0)/2|0;o=c[k>>2]|0;A=E+-1|0;if((f|0)>1){l=0;m=o;n=o+(($(A,D)|0)<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(D|0))break;else{m=m+2|0;n=n+2|0}}}y=j*3|0;z=D+-1|0;if((g|0)>1){l=0;j=o;m=o+(z<<1)|0;while(1){b[m>>1]=0;b[j>>1]=0;l=l+1|0;if((l|0)>=(E|0))break;else{j=j+(D<<1)|0;m=m+(D<<1)|0}}}m=k+1179664|0;j=D+1|0;v=0-D|0;t=1-D|0;u=~D;s=(f<<1)+8|0;a:do if((A|0)>1){w=(z|0)>1;l=(c[k+4>>2]|0)+j|0;x=1;n=e+((f<<2)+4)|0;g=o+(j<<1)|0;j=0;b:while(1){if(w){r=1;q=n;p=j;while(1){f=d[q>>0]|0;o=d[q+1>>0]|0;do if(((f&248)+12+(f<<5&224)+(o>>>3&24)+(o<<2&248)|0)>(y|0)){a[l>>0]=-1;j=b[g+(v<<1)>>1]|0;if(j<<16>>16>0){b[g>>1]=j;j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=k+1310736+(j+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+x;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}e=b[g+(t<<1)>>1]|0;f=e<<16>>16;j=b[g+(u<<1)>>1]|0;o=j<<16>>16;n=j<<16>>16>0;if(e<<16>>16<=0){if(n){b[g>>1]=j;j=o*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+r;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+x;n=k+1310736+(j+-3<<2)|0;if((c[n>>2]|0)<(r|0))c[n>>2]=r;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}j=b[g+-2>>1]|0;if(j<<16>>16>0){b[g>>1]=j;j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=k+1310736+(j+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+x;j=k+1310736+(j+-3<<2)|0;if((c[j>>2]|0)>=(r|0)){j=p;break}c[j>>2]=r;j=p;break}else{j=p+1|0;if((p|0)>32767)break b;b[g>>1]=j;c[k+1179664+(p<<2)>>2]=j<<16>>16;p=p*7|0;c[k+1310736+(p<<2)>>2]=1;c[k+1310736+(p+1<<2)>>2]=r;c[k+1310736+(p+2<<2)>>2]=x;c[k+1310736+(p+3<<2)>>2]=r;c[k+1310736+(p+4<<2)>>2]=r;c[k+1310736+(p+5<<2)>>2]=x;c[k+1310736+(p+6<<2)>>2]=x;break}}if(n){j=c[k+1179664+(f+-1<<2)>>2]|0;f=c[k+1179664+(o+-1<<2)>>2]|0;if((j|0)>(f|0)){b[g>>1]=f;if((p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(j|0))c[e>>2]=f;n=n+1|0;if((n|0)>=(p|0)){j=f;break}else e=e+4|0}}else j=f}else{b[g>>1]=j;if((j|0)<(f|0)&(p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(f|0))c[e>>2]=j;n=n+1|0;if((n|0)>=(p|0))break;else e=e+4|0}}}j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=k+1310736+(j+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+x;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}n=b[g+-2>>1]|0;if(n<<16>>16<=0){b[g>>1]=e;j=f*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+r;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+x;n=k+1310736+(j+-4<<2)|0;if((c[n>>2]|0)>(r|0))c[n>>2]=r;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}j=c[k+1179664+(f+-1<<2)>>2]|0;f=c[k+1179664+((n<<16>>16)+-1<<2)>>2]|0;if((j|0)>(f|0)){b[g>>1]=f;if((p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(j|0))c[e>>2]=f;n=n+1|0;if((n|0)>=(p|0)){j=f;break}else e=e+4|0}}else j=f}else{b[g>>1]=j;if((j|0)<(f|0)&(p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(f|0))c[e>>2]=j;n=n+1|0;if((n|0)>=(p|0))break;else e=e+4|0}}}j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;j=k+1310736+(j+-5<<2)|0;c[j>>2]=(c[j>>2]|0)+x;j=p}else{b[g>>1]=0;a[l>>0]=0;j=p}while(0);r=r+1|0;n=q+4|0;g=g+2|0;l=l+1|0;if((r|0)>=(z|0))break;else{q=n;p=j}}}x=x+1|0;if((x|0)>=(A|0)){f=j;C=52;break a}else{l=l+2|0;n=n+s|0;g=g+4|0}}Me(3,3904,B);l=-1}else{f=0;C=52}while(0);if((C|0)==52){g=k+12|0;if((f|0)<1)j=1;else{n=1;j=1;while(1){l=c[m>>2]|0;if((l|0)==(n|0)){l=j;j=j+1|0}else l=c[k+1179664+(l+-1<<2)>>2]|0;c[m>>2]=l;if((n|0)<(f|0)){n=n+1|0;m=m+4|0}else break}}e=k+8|0;l=j+-1|0;c[e>>2]=l;if(l){ek(g|0,0,l<<2|0)|0;ek(k+655376|0,0,l<<4|0)|0;if((j|0)>1){l=0;do{C=l<<2;c[k+131084+(C<<2)>>2]=D;c[k+131084+((C|1)<<2)>>2]=0;c[k+131084+((C|2)<<2)>>2]=E;c[k+131084+((C|3)<<2)>>2]=0;l=l+1|0}while((l|0)<(c[e>>2]|0))}if((f|0)>0){g=0;do{m=(c[k+1179664+(g<<2)>>2]|0)+-1|0;n=g*7|0;l=k+12+(m<<2)|0;c[l>>2]=(c[l>>2]|0)+(c[k+1310736+(n<<2)>>2]|0);l=m<<1;j=k+655376+(l<<3)|0;h[j>>3]=+h[j>>3]+ +(c[k+1310736+(n+1<<2)>>2]|0);l=k+655376+((l|1)<<3)|0;h[l>>3]=+h[l>>3]+ +(c[k+1310736+(n+2<<2)>>2]|0);m=m<<2;l=k+131084+(m<<2)|0;j=c[k+1310736+(n+3<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;l=k+131084+((m|1)<<2)|0;j=c[k+1310736+(n+4<<2)>>2]|0;if((c[l>>2]|0)<(j|0))c[l>>2]=j;l=k+131084+((m|2)<<2)|0;j=c[k+1310736+(n+5<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;j=k+131084+((m|3)<<2)|0;l=c[k+1310736+(n+6<<2)>>2]|0;if((c[j>>2]|0)<(l|0))c[j>>2]=l;g=g+1|0}while((g|0)<(f|0))}if((c[e>>2]|0)>0){l=0;do{D=k+12+(l<<2)|0;E=l<<1;C=k+655376+(E<<3)|0;h[C>>3]=+h[C>>3]/+(c[D>>2]|0);E=k+655376+((E|1)<<3)|0;h[E>>3]=+h[E>>3]/+(c[D>>2]|0);l=l+1|0}while((l|0)<(c[e>>2]|0));l=0}else l=0}else l=0}i=F;return l|0}function vd(e,f,g,j,k){e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;F=i;i=i+16|0;B=F;D=(f|0)/2|0;E=(g|0)/2|0;o=c[k>>2]|0;A=E+-1|0;if((f|0)>1){l=0;m=o;n=o+(($(A,D)|0)<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(D|0))break;else{m=m+2|0;n=n+2|0}}}y=j*3|0;z=D+-1|0;if((g|0)>1){l=0;j=o;m=o+(z<<1)|0;while(1){b[m>>1]=0;b[j>>1]=0;l=l+1|0;if((l|0)>=(E|0))break;else{j=j+(D<<1)|0;m=m+(D<<1)|0}}}m=k+1179664|0;j=D+1|0;v=0-D|0;t=1-D|0;u=~D;s=(f<<2)+16|0;a:do if((A|0)>1){w=(z|0)>1;l=(c[k+4>>2]|0)+j|0;x=1;n=e+((f<<3)+8)|0;g=o+(j<<1)|0;j=0;b:while(1){if(w){r=1;q=n;p=j;while(1){do if(((d[q+2>>0]|0)+(d[q+1>>0]|0)+(d[q+3>>0]|0)|0)>(y|0)){a[l>>0]=-1;j=b[g+(v<<1)>>1]|0;if(j<<16>>16>0){b[g>>1]=j;j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=k+1310736+(j+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+x;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}e=b[g+(t<<1)>>1]|0;f=e<<16>>16;j=b[g+(u<<1)>>1]|0;o=j<<16>>16;n=j<<16>>16>0;if(e<<16>>16<=0){if(n){b[g>>1]=j;j=o*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+r;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+x;n=k+1310736+(j+-3<<2)|0;if((c[n>>2]|0)<(r|0))c[n>>2]=r;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}j=b[g+-2>>1]|0;if(j<<16>>16>0){b[g>>1]=j;j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=k+1310736+(j+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+x;j=k+1310736+(j+-3<<2)|0;if((c[j>>2]|0)>=(r|0)){j=p;break}c[j>>2]=r;j=p;break}else{j=p+1|0;if((p|0)>32767)break b;b[g>>1]=j;c[k+1179664+(p<<2)>>2]=j<<16>>16;p=p*7|0;c[k+1310736+(p<<2)>>2]=1;c[k+1310736+(p+1<<2)>>2]=r;c[k+1310736+(p+2<<2)>>2]=x;c[k+1310736+(p+3<<2)>>2]=r;c[k+1310736+(p+4<<2)>>2]=r;c[k+1310736+(p+5<<2)>>2]=x;c[k+1310736+(p+6<<2)>>2]=x;break}}if(n){j=c[k+1179664+(f+-1<<2)>>2]|0;f=c[k+1179664+(o+-1<<2)>>2]|0;if((j|0)>(f|0)){b[g>>1]=f;if((p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(j|0))c[e>>2]=f;n=n+1|0;if((n|0)>=(p|0)){j=f;break}else e=e+4|0}}else j=f}else{b[g>>1]=j;if((j|0)<(f|0)&(p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(f|0))c[e>>2]=j;n=n+1|0;if((n|0)>=(p|0))break;else e=e+4|0}}}j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=k+1310736+(j+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+x;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}n=b[g+-2>>1]|0;if(n<<16>>16<=0){b[g>>1]=e;j=f*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+r;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+x;n=k+1310736+(j+-4<<2)|0;if((c[n>>2]|0)>(r|0))c[n>>2]=r;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}j=c[k+1179664+(f+-1<<2)>>2]|0;f=c[k+1179664+((n<<16>>16)+-1<<2)>>2]|0;if((j|0)>(f|0)){b[g>>1]=f;if((p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(j|0))c[e>>2]=f;n=n+1|0;if((n|0)>=(p|0)){j=f;break}else e=e+4|0}}else j=f}else{b[g>>1]=j;if((j|0)<(f|0)&(p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(f|0))c[e>>2]=j;n=n+1|0;if((n|0)>=(p|0))break;else e=e+4|0}}}j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;j=k+1310736+(j+-5<<2)|0;c[j>>2]=(c[j>>2]|0)+x;j=p}else{b[g>>1]=0;a[l>>0]=0;j=p}while(0);r=r+1|0;n=q+8|0;g=g+2|0;l=l+1|0;if((r|0)>=(z|0))break;else{q=n;p=j}}}x=x+1|0;if((x|0)>=(A|0)){f=j;C=52;break a}else{l=l+2|0;n=n+s|0;g=g+4|0}}Me(3,3904,B);l=-1}else{f=0;C=52}while(0);if((C|0)==52){g=k+12|0;if((f|0)<1)j=1;else{n=1;j=1;while(1){l=c[m>>2]|0;if((l|0)==(n|0)){l=j;j=j+1|0}else l=c[k+1179664+(l+-1<<2)>>2]|0;c[m>>2]=l;if((n|0)<(f|0)){n=n+1|0;m=m+4|0}else break}}e=k+8|0;l=j+-1|0;c[e>>2]=l;if(l){ek(g|0,0,l<<2|0)|0;ek(k+655376|0,0,l<<4|0)|0;if((j|0)>1){l=0;do{C=l<<2;c[k+131084+(C<<2)>>2]=D;c[k+131084+((C|1)<<2)>>2]=0;c[k+131084+((C|2)<<2)>>2]=E;c[k+131084+((C|3)<<2)>>2]=0;l=l+1|0}while((l|0)<(c[e>>2]|0))}if((f|0)>0){g=0;do{m=(c[k+1179664+(g<<2)>>2]|0)+-1|0;n=g*7|0;l=k+12+(m<<2)|0;c[l>>2]=(c[l>>2]|0)+(c[k+1310736+(n<<2)>>2]|0);l=m<<1;j=k+655376+(l<<3)|0;h[j>>3]=+h[j>>3]+ +(c[k+1310736+(n+1<<2)>>2]|0);l=k+655376+((l|1)<<3)|0;h[l>>3]=+h[l>>3]+ +(c[k+1310736+(n+2<<2)>>2]|0);m=m<<2;l=k+131084+(m<<2)|0;j=c[k+1310736+(n+3<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;l=k+131084+((m|1)<<2)|0;j=c[k+1310736+(n+4<<2)>>2]|0;if((c[l>>2]|0)<(j|0))c[l>>2]=j;l=k+131084+((m|2)<<2)|0;j=c[k+1310736+(n+5<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;j=k+131084+((m|3)<<2)|0;l=c[k+1310736+(n+6<<2)>>2]|0;if((c[j>>2]|0)<(l|0))c[j>>2]=l;g=g+1|0}while((g|0)<(f|0))}if((c[e>>2]|0)>0){l=0;do{D=k+12+(l<<2)|0;E=l<<1;C=k+655376+(E<<3)|0;h[C>>3]=+h[C>>3]/+(c[D>>2]|0);E=k+655376+((E|1)<<3)|0;h[E>>3]=+h[E>>3]/+(c[D>>2]|0);l=l+1|0}while((l|0)<(c[e>>2]|0));l=0}else l=0}else l=0}i=F;return l|0}function wd(e,f,g,j,k){e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;F=i;i=i+16|0;B=F;D=(f|0)/2|0;E=(g|0)/2|0;o=c[k>>2]|0;A=E+-1|0;if((f|0)>1){l=0;m=o;n=o+(($(A,D)|0)<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(D|0))break;else{m=m+2|0;n=n+2|0}}}z=D+-1|0;if((g|0)>1){l=0;m=o;n=o+(z<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(E|0))break;else{m=m+(D<<1)|0;n=n+(D<<1)|0}}}n=k+1179664|0;m=D+1|0;w=0-D|0;u=1-D|0;v=~D;t=f+4|0;a:do if((A|0)>1){x=(z|0)>1;l=(c[k+4>>2]|0)+m|0;y=1;g=e+((f<<1)+2)|0;e=o+(m<<1)|0;m=0;b:while(1){if(x){s=1;r=g;q=m;while(1){do if((d[r>>0]|0|0)>(j|0)){a[l>>0]=-1;m=b[e+(w<<1)>>1]|0;if(m<<16>>16>0){b[e>>1]=m;m=(m<<16>>16)*7|0;p=k+1310736+(m+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=k+1310736+(m+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=k+1310736+(m+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+y;c[k+1310736+(m+-1<<2)>>2]=y;m=q;break}f=b[e+(u<<1)>>1]|0;o=f<<16>>16;m=b[e+(v<<1)>>1]|0;p=m<<16>>16;g=m<<16>>16>0;if(f<<16>>16<=0){if(g){b[e>>1]=m;m=p*7|0;g=k+1310736+(m+-7<<2)|0;c[g>>2]=(c[g>>2]|0)+1;g=k+1310736+(m+-6<<2)|0;c[g>>2]=(c[g>>2]|0)+s;g=k+1310736+(m+-5<<2)|0;c[g>>2]=(c[g>>2]|0)+y;g=k+1310736+(m+-3<<2)|0;if((c[g>>2]|0)<(s|0))c[g>>2]=s;c[k+1310736+(m+-1<<2)>>2]=y;m=q;break}m=b[e+-2>>1]|0;if(m<<16>>16>0){b[e>>1]=m;m=(m<<16>>16)*7|0;p=k+1310736+(m+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=k+1310736+(m+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=k+1310736+(m+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+y;m=k+1310736+(m+-3<<2)|0;if((c[m>>2]|0)>=(s|0)){m=q;break}c[m>>2]=s;m=q;break}else{m=q+1|0;if((q|0)>32767)break b;b[e>>1]=m;c[k+1179664+(q<<2)>>2]=m<<16>>16;q=q*7|0;c[k+1310736+(q<<2)>>2]=1;c[k+1310736+(q+1<<2)>>2]=s;c[k+1310736+(q+2<<2)>>2]=y;c[k+1310736+(q+3<<2)>>2]=s;c[k+1310736+(q+4<<2)>>2]=s;c[k+1310736+(q+5<<2)>>2]=y;c[k+1310736+(q+6<<2)>>2]=y;break}}if(g){m=c[k+1179664+(o+-1<<2)>>2]|0;o=c[k+1179664+(p+-1<<2)>>2]|0;if((m|0)>(o|0)){b[e>>1]=o;if((q|0)>0){g=0;f=n;while(1){if((c[f>>2]|0)==(m|0))c[f>>2]=o;g=g+1|0;if((g|0)>=(q|0)){m=o;break}else f=f+4|0}}else m=o}else{b[e>>1]=m;if((m|0)<(o|0)&(q|0)>0){g=0;f=n;while(1){if((c[f>>2]|0)==(o|0))c[f>>2]=m;g=g+1|0;if((g|0)>=(q|0))break;else f=f+4|0}}}m=(m<<16>>16)*7|0;p=k+1310736+(m+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=k+1310736+(m+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=k+1310736+(m+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+y;c[k+1310736+(m+-1<<2)>>2]=y;m=q;break}g=b[e+-2>>1]|0;if(g<<16>>16<=0){b[e>>1]=f;m=o*7|0;g=k+1310736+(m+-7<<2)|0;c[g>>2]=(c[g>>2]|0)+1;g=k+1310736+(m+-6<<2)|0;c[g>>2]=(c[g>>2]|0)+s;g=k+1310736+(m+-5<<2)|0;c[g>>2]=(c[g>>2]|0)+y;g=k+1310736+(m+-4<<2)|0;if((c[g>>2]|0)>(s|0))c[g>>2]=s;c[k+1310736+(m+-1<<2)>>2]=y;m=q;break}m=c[k+1179664+(o+-1<<2)>>2]|0;o=c[k+1179664+((g<<16>>16)+-1<<2)>>2]|0;if((m|0)>(o|0)){b[e>>1]=o;if((q|0)>0){g=0;f=n;while(1){if((c[f>>2]|0)==(m|0))c[f>>2]=o;g=g+1|0;if((g|0)>=(q|0)){m=o;break}else f=f+4|0}}else m=o}else{b[e>>1]=m;if((m|0)<(o|0)&(q|0)>0){g=0;f=n;while(1){if((c[f>>2]|0)==(o|0))c[f>>2]=m;g=g+1|0;if((g|0)>=(q|0))break;else f=f+4|0}}}m=(m<<16>>16)*7|0;p=k+1310736+(m+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=k+1310736+(m+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;m=k+1310736+(m+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+y;m=q}else{b[e>>1]=0;a[l>>0]=0;m=q}while(0);s=s+1|0;g=r+2|0;e=e+2|0;l=l+1|0;if((s|0)>=(z|0))break;else{r=g;q=m}}}y=y+1|0;if((y|0)>=(A|0)){o=m;C=52;break a}else{l=l+2|0;g=g+t|0;e=e+4|0}}Me(3,3904,B);l=-1}else{o=0;C=52}while(0);if((C|0)==52){e=k+12|0;if((o|0)<1)m=1;else{g=1;m=1;while(1){l=c[n>>2]|0;if((l|0)==(g|0)){l=m;m=m+1|0}else l=c[k+1179664+(l+-1<<2)>>2]|0;c[n>>2]=l;if((g|0)<(o|0)){g=g+1|0;n=n+4|0}else break}}f=k+8|0;l=m+-1|0;c[f>>2]=l;if(l){ek(e|0,0,l<<2|0)|0;ek(k+655376|0,0,l<<4|0)|0;if((m|0)>1){l=0;do{C=l<<2;c[k+131084+(C<<2)>>2]=D;c[k+131084+((C|1)<<2)>>2]=0;c[k+131084+((C|2)<<2)>>2]=E;c[k+131084+((C|3)<<2)>>2]=0;l=l+1|0}while((l|0)<(c[f>>2]|0))}if((o|0)>0){e=0;do{n=(c[k+1179664+(e<<2)>>2]|0)+-1|0;g=e*7|0;l=k+12+(n<<2)|0;c[l>>2]=(c[l>>2]|0)+(c[k+1310736+(g<<2)>>2]|0);l=n<<1;m=k+655376+(l<<3)|0;h[m>>3]=+h[m>>3]+ +(c[k+1310736+(g+1<<2)>>2]|0);l=k+655376+((l|1)<<3)|0;h[l>>3]=+h[l>>3]+ +(c[k+1310736+(g+2<<2)>>2]|0);n=n<<2;l=k+131084+(n<<2)|0;m=c[k+1310736+(g+3<<2)>>2]|0;if((c[l>>2]|0)>(m|0))c[l>>2]=m;l=k+131084+((n|1)<<2)|0;m=c[k+1310736+(g+4<<2)>>2]|0;if((c[l>>2]|0)<(m|0))c[l>>2]=m;l=k+131084+((n|2)<<2)|0;m=c[k+1310736+(g+5<<2)>>2]|0;if((c[l>>2]|0)>(m|0))c[l>>2]=m;m=k+131084+((n|3)<<2)|0;l=c[k+1310736+(g+6<<2)>>2]|0;if((c[m>>2]|0)<(l|0))c[m>>2]=l;e=e+1|0}while((e|0)<(o|0))}if((c[f>>2]|0)>0){l=0;do{D=k+12+(l<<2)|0;E=l<<1;C=k+655376+(E<<3)|0;h[C>>3]=+h[C>>3]/+(c[D>>2]|0);E=k+655376+((E|1)<<3)|0;h[E>>3]=+h[E>>3]/+(c[D>>2]|0);l=l+1|0}while((l|0)<(c[f>>2]|0));l=0}else l=0}else l=0}i=F;return l|0}function xd(e,f,g,j,k){e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;F=i;i=i+16|0;B=F;D=(f|0)/2|0;E=(g|0)/2|0;o=c[k>>2]|0;A=E+-1|0;if((f|0)>1){l=0;m=o;n=o+(($(A,D)|0)<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(D|0))break;else{m=m+2|0;n=n+2|0}}}z=D+-1|0;if((g|0)>1){l=0;m=o;n=o+(z<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(E|0))break;else{m=m+(D<<1)|0;n=n+(D<<1)|0}}}n=k+1179664|0;m=D+1|0;w=0-D|0;u=1-D|0;v=~D;t=(f<<1)+8|0;a:do if((A|0)>1){x=(z|0)>1;l=(c[k+4>>2]|0)+m|0;y=1;g=e+((f<<2)+4)|0;e=o+(m<<1)|0;m=0;b:while(1){if(x){s=1;r=g;q=m;while(1){do if((d[r+1>>0]|0|0)>(j|0)){a[l>>0]=-1;m=b[e+(w<<1)>>1]|0;if(m<<16>>16>0){b[e>>1]=m;m=(m<<16>>16)*7|0;p=k+1310736+(m+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=k+1310736+(m+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=k+1310736+(m+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+y;c[k+1310736+(m+-1<<2)>>2]=y;m=q;break}f=b[e+(u<<1)>>1]|0;o=f<<16>>16;m=b[e+(v<<1)>>1]|0;p=m<<16>>16;g=m<<16>>16>0;if(f<<16>>16<=0){if(g){b[e>>1]=m;m=p*7|0;g=k+1310736+(m+-7<<2)|0;c[g>>2]=(c[g>>2]|0)+1;g=k+1310736+(m+-6<<2)|0;c[g>>2]=(c[g>>2]|0)+s;g=k+1310736+(m+-5<<2)|0;c[g>>2]=(c[g>>2]|0)+y;g=k+1310736+(m+-3<<2)|0;if((c[g>>2]|0)<(s|0))c[g>>2]=s;c[k+1310736+(m+-1<<2)>>2]=y;m=q;break}m=b[e+-2>>1]|0;if(m<<16>>16>0){b[e>>1]=m;m=(m<<16>>16)*7|0;p=k+1310736+(m+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=k+1310736+(m+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=k+1310736+(m+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+y;m=k+1310736+(m+-3<<2)|0;if((c[m>>2]|0)>=(s|0)){m=q;break}c[m>>2]=s;m=q;break}else{m=q+1|0;if((q|0)>32767)break b;b[e>>1]=m;c[k+1179664+(q<<2)>>2]=m<<16>>16;q=q*7|0;c[k+1310736+(q<<2)>>2]=1;c[k+1310736+(q+1<<2)>>2]=s;c[k+1310736+(q+2<<2)>>2]=y;c[k+1310736+(q+3<<2)>>2]=s;c[k+1310736+(q+4<<2)>>2]=s;c[k+1310736+(q+5<<2)>>2]=y;c[k+1310736+(q+6<<2)>>2]=y;break}}if(g){m=c[k+1179664+(o+-1<<2)>>2]|0;o=c[k+1179664+(p+-1<<2)>>2]|0;if((m|0)>(o|0)){b[e>>1]=o;if((q|0)>0){g=0;f=n;while(1){if((c[f>>2]|0)==(m|0))c[f>>2]=o;g=g+1|0;if((g|0)>=(q|0)){m=o;break}else f=f+4|0}}else m=o}else{b[e>>1]=m;if((m|0)<(o|0)&(q|0)>0){g=0;f=n;while(1){if((c[f>>2]|0)==(o|0))c[f>>2]=m;g=g+1|0;if((g|0)>=(q|0))break;else f=f+4|0}}}m=(m<<16>>16)*7|0;p=k+1310736+(m+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=k+1310736+(m+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=k+1310736+(m+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+y;c[k+1310736+(m+-1<<2)>>2]=y;m=q;break}g=b[e+-2>>1]|0;if(g<<16>>16<=0){b[e>>1]=f;m=o*7|0;g=k+1310736+(m+-7<<2)|0;c[g>>2]=(c[g>>2]|0)+1;g=k+1310736+(m+-6<<2)|0;c[g>>2]=(c[g>>2]|0)+s;g=k+1310736+(m+-5<<2)|0;c[g>>2]=(c[g>>2]|0)+y;g=k+1310736+(m+-4<<2)|0;if((c[g>>2]|0)>(s|0))c[g>>2]=s;c[k+1310736+(m+-1<<2)>>2]=y;m=q;break}m=c[k+1179664+(o+-1<<2)>>2]|0;o=c[k+1179664+((g<<16>>16)+-1<<2)>>2]|0;if((m|0)>(o|0)){b[e>>1]=o;if((q|0)>0){g=0;f=n;while(1){if((c[f>>2]|0)==(m|0))c[f>>2]=o;g=g+1|0;if((g|0)>=(q|0)){m=o;break}else f=f+4|0}}else m=o}else{b[e>>1]=m;if((m|0)<(o|0)&(q|0)>0){g=0;f=n;while(1){if((c[f>>2]|0)==(o|0))c[f>>2]=m;g=g+1|0;if((g|0)>=(q|0))break;else f=f+4|0}}}m=(m<<16>>16)*7|0;p=k+1310736+(m+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=k+1310736+(m+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;m=k+1310736+(m+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+y;m=q}else{b[e>>1]=0;a[l>>0]=0;m=q}while(0);s=s+1|0;g=r+4|0;e=e+2|0;l=l+1|0;if((s|0)>=(z|0))break;else{r=g;q=m}}}y=y+1|0;if((y|0)>=(A|0)){o=m;C=52;break a}else{l=l+2|0;g=g+t|0;e=e+4|0}}Me(3,3904,B);l=-1}else{o=0;C=52}while(0);if((C|0)==52){e=k+12|0;if((o|0)<1)m=1;else{g=1;m=1;while(1){l=c[n>>2]|0;if((l|0)==(g|0)){l=m;m=m+1|0}else l=c[k+1179664+(l+-1<<2)>>2]|0;c[n>>2]=l;if((g|0)<(o|0)){g=g+1|0;n=n+4|0}else break}}f=k+8|0;l=m+-1|0;c[f>>2]=l;if(l){ek(e|0,0,l<<2|0)|0;ek(k+655376|0,0,l<<4|0)|0;if((m|0)>1){l=0;do{C=l<<2;c[k+131084+(C<<2)>>2]=D;c[k+131084+((C|1)<<2)>>2]=0;c[k+131084+((C|2)<<2)>>2]=E;c[k+131084+((C|3)<<2)>>2]=0;l=l+1|0}while((l|0)<(c[f>>2]|0))}if((o|0)>0){e=0;do{n=(c[k+1179664+(e<<2)>>2]|0)+-1|0;g=e*7|0;l=k+12+(n<<2)|0;c[l>>2]=(c[l>>2]|0)+(c[k+1310736+(g<<2)>>2]|0);l=n<<1;m=k+655376+(l<<3)|0;h[m>>3]=+h[m>>3]+ +(c[k+1310736+(g+1<<2)>>2]|0);l=k+655376+((l|1)<<3)|0;h[l>>3]=+h[l>>3]+ +(c[k+1310736+(g+2<<2)>>2]|0);n=n<<2;l=k+131084+(n<<2)|0;m=c[k+1310736+(g+3<<2)>>2]|0;if((c[l>>2]|0)>(m|0))c[l>>2]=m;l=k+131084+((n|1)<<2)|0;m=c[k+1310736+(g+4<<2)>>2]|0;if((c[l>>2]|0)<(m|0))c[l>>2]=m;l=k+131084+((n|2)<<2)|0;m=c[k+1310736+(g+5<<2)>>2]|0;if((c[l>>2]|0)>(m|0))c[l>>2]=m;m=k+131084+((n|3)<<2)|0;l=c[k+1310736+(g+6<<2)>>2]|0;if((c[m>>2]|0)<(l|0))c[m>>2]=l;e=e+1|0}while((e|0)<(o|0))}if((c[f>>2]|0)>0){l=0;do{D=k+12+(l<<2)|0;E=l<<1;C=k+655376+(E<<3)|0;h[C>>3]=+h[C>>3]/+(c[D>>2]|0);E=k+655376+((E|1)<<3)|0;h[E>>3]=+h[E>>3]/+(c[D>>2]|0);l=l+1|0}while((l|0)<(c[f>>2]|0));l=0}else l=0}else l=0}i=F;return l|0}function yd(e,f,g,j,k){e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;F=i;i=i+16|0;B=F;D=(f|0)/2|0;E=(g|0)/2|0;o=c[k>>2]|0;A=E+-1|0;if((f|0)>1){l=0;m=o;n=o+(($(A,D)|0)<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(D|0))break;else{m=m+2|0;n=n+2|0}}}z=D+-1|0;if((g|0)>1){l=0;m=o;n=o+(z<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(E|0))break;else{m=m+(D<<1)|0;n=n+(D<<1)|0}}}n=k+1179664|0;m=D+1|0;w=0-D|0;u=1-D|0;v=~D;t=(f<<1)+8|0;a:do if((A|0)>1){x=(z|0)>1;l=(c[k+4>>2]|0)+m|0;y=1;g=e+((f<<2)+4)|0;e=o+(m<<1)|0;m=0;b:while(1){if(x){s=1;r=g;q=m;while(1){do if((d[r>>0]|0|0)>(j|0)){a[l>>0]=-1;m=b[e+(w<<1)>>1]|0;if(m<<16>>16>0){b[e>>1]=m;m=(m<<16>>16)*7|0;p=k+1310736+(m+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=k+1310736+(m+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=k+1310736+(m+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+y;c[k+1310736+(m+-1<<2)>>2]=y;m=q;break}f=b[e+(u<<1)>>1]|0;o=f<<16>>16;m=b[e+(v<<1)>>1]|0;p=m<<16>>16;g=m<<16>>16>0;if(f<<16>>16<=0){if(g){b[e>>1]=m;m=p*7|0;g=k+1310736+(m+-7<<2)|0;c[g>>2]=(c[g>>2]|0)+1;g=k+1310736+(m+-6<<2)|0;c[g>>2]=(c[g>>2]|0)+s;g=k+1310736+(m+-5<<2)|0;c[g>>2]=(c[g>>2]|0)+y;g=k+1310736+(m+-3<<2)|0;if((c[g>>2]|0)<(s|0))c[g>>2]=s;c[k+1310736+(m+-1<<2)>>2]=y;m=q;break}m=b[e+-2>>1]|0;if(m<<16>>16>0){b[e>>1]=m;m=(m<<16>>16)*7|0;p=k+1310736+(m+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=k+1310736+(m+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=k+1310736+(m+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+y;m=k+1310736+(m+-3<<2)|0;if((c[m>>2]|0)>=(s|0)){m=q;break}c[m>>2]=s;m=q;break}else{m=q+1|0;if((q|0)>32767)break b;b[e>>1]=m;c[k+1179664+(q<<2)>>2]=m<<16>>16;q=q*7|0;c[k+1310736+(q<<2)>>2]=1;c[k+1310736+(q+1<<2)>>2]=s;c[k+1310736+(q+2<<2)>>2]=y;c[k+1310736+(q+3<<2)>>2]=s;c[k+1310736+(q+4<<2)>>2]=s;c[k+1310736+(q+5<<2)>>2]=y;c[k+1310736+(q+6<<2)>>2]=y;break}}if(g){m=c[k+1179664+(o+-1<<2)>>2]|0;o=c[k+1179664+(p+-1<<2)>>2]|0;if((m|0)>(o|0)){b[e>>1]=o;if((q|0)>0){g=0;f=n;while(1){if((c[f>>2]|0)==(m|0))c[f>>2]=o;g=g+1|0;if((g|0)>=(q|0)){m=o;break}else f=f+4|0}}else m=o}else{b[e>>1]=m;if((m|0)<(o|0)&(q|0)>0){g=0;f=n;while(1){if((c[f>>2]|0)==(o|0))c[f>>2]=m;g=g+1|0;if((g|0)>=(q|0))break;else f=f+4|0}}}m=(m<<16>>16)*7|0;p=k+1310736+(m+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=k+1310736+(m+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=k+1310736+(m+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+y;c[k+1310736+(m+-1<<2)>>2]=y;m=q;break}g=b[e+-2>>1]|0;if(g<<16>>16<=0){b[e>>1]=f;m=o*7|0;g=k+1310736+(m+-7<<2)|0;c[g>>2]=(c[g>>2]|0)+1;g=k+1310736+(m+-6<<2)|0;c[g>>2]=(c[g>>2]|0)+s;g=k+1310736+(m+-5<<2)|0;c[g>>2]=(c[g>>2]|0)+y;g=k+1310736+(m+-4<<2)|0;if((c[g>>2]|0)>(s|0))c[g>>2]=s;c[k+1310736+(m+-1<<2)>>2]=y;m=q;break}m=c[k+1179664+(o+-1<<2)>>2]|0;o=c[k+1179664+((g<<16>>16)+-1<<2)>>2]|0;if((m|0)>(o|0)){b[e>>1]=o;if((q|0)>0){g=0;f=n;while(1){if((c[f>>2]|0)==(m|0))c[f>>2]=o;g=g+1|0;if((g|0)>=(q|0)){m=o;break}else f=f+4|0}}else m=o}else{b[e>>1]=m;if((m|0)<(o|0)&(q|0)>0){g=0;f=n;while(1){if((c[f>>2]|0)==(o|0))c[f>>2]=m;g=g+1|0;if((g|0)>=(q|0))break;else f=f+4|0}}}m=(m<<16>>16)*7|0;p=k+1310736+(m+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=k+1310736+(m+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;m=k+1310736+(m+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+y;m=q}else{b[e>>1]=0;a[l>>0]=0;m=q}while(0);s=s+1|0;g=r+4|0;e=e+2|0;l=l+1|0;if((s|0)>=(z|0))break;else{r=g;q=m}}}y=y+1|0;if((y|0)>=(A|0)){o=m;C=52;break a}else{l=l+2|0;g=g+t|0;e=e+4|0}}Me(3,3904,B);l=-1}else{o=0;C=52}while(0);if((C|0)==52){e=k+12|0;if((o|0)<1)m=1;else{g=1;m=1;while(1){l=c[n>>2]|0;if((l|0)==(g|0)){l=m;m=m+1|0}else l=c[k+1179664+(l+-1<<2)>>2]|0;c[n>>2]=l;if((g|0)<(o|0)){g=g+1|0;n=n+4|0}else break}}f=k+8|0;l=m+-1|0;c[f>>2]=l;if(l){ek(e|0,0,l<<2|0)|0;ek(k+655376|0,0,l<<4|0)|0;if((m|0)>1){l=0;do{C=l<<2;c[k+131084+(C<<2)>>2]=D;c[k+131084+((C|1)<<2)>>2]=0;c[k+131084+((C|2)<<2)>>2]=E;c[k+131084+((C|3)<<2)>>2]=0;l=l+1|0}while((l|0)<(c[f>>2]|0))}if((o|0)>0){e=0;do{n=(c[k+1179664+(e<<2)>>2]|0)+-1|0;g=e*7|0;l=k+12+(n<<2)|0;c[l>>2]=(c[l>>2]|0)+(c[k+1310736+(g<<2)>>2]|0);l=n<<1;m=k+655376+(l<<3)|0;h[m>>3]=+h[m>>3]+ +(c[k+1310736+(g+1<<2)>>2]|0);l=k+655376+((l|1)<<3)|0;h[l>>3]=+h[l>>3]+ +(c[k+1310736+(g+2<<2)>>2]|0);n=n<<2;l=k+131084+(n<<2)|0;m=c[k+1310736+(g+3<<2)>>2]|0;if((c[l>>2]|0)>(m|0))c[l>>2]=m;l=k+131084+((n|1)<<2)|0;m=c[k+1310736+(g+4<<2)>>2]|0;if((c[l>>2]|0)<(m|0))c[l>>2]=m;l=k+131084+((n|2)<<2)|0;m=c[k+1310736+(g+5<<2)>>2]|0;if((c[l>>2]|0)>(m|0))c[l>>2]=m;m=k+131084+((n|3)<<2)|0;l=c[k+1310736+(g+6<<2)>>2]|0;if((c[m>>2]|0)<(l|0))c[m>>2]=l;e=e+1|0}while((e|0)<(o|0))}if((c[f>>2]|0)>0){l=0;do{D=k+12+(l<<2)|0;E=l<<1;C=k+655376+(E<<3)|0;h[C>>3]=+h[C>>3]/+(c[D>>2]|0);E=k+655376+((E|1)<<3)|0;h[E>>3]=+h[E>>3]/+(c[D>>2]|0);l=l+1|0}while((l|0)<(c[f>>2]|0));l=0}else l=0}else l=0}i=F;return l|0}
function ec(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+15&-16;return b|0}function fc(){return i|0}function gc(a){a=a|0;i=a}function hc(a,b){a=a|0;b=b|0;i=a;j=b}function ic(a,b){a=a|0;b=b|0;if(!o){o=a;p=b}}function jc(b){b=b|0;a[k>>0]=a[b>>0];a[k+1>>0]=a[b+1>>0];a[k+2>>0]=a[b+2>>0];a[k+3>>0]=a[b+3>>0]}function kc(b){b=b|0;a[k>>0]=a[b>>0];a[k+1>>0]=a[b+1>>0];a[k+2>>0]=a[b+2>>0];a[k+3>>0]=a[b+3>>0];a[k+4>>0]=a[b+4>>0];a[k+5>>0]=a[b+5>>0];a[k+6>>0]=a[b+6>>0];a[k+7>>0]=a[b+7>>0]}function lc(a){a=a|0;D=a}function mc(){return D|0}function nc(a,e,f,g,j){a=a|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;D=i;i=i+16|0;z=D;B=(e|0)/2|0;C=(f|0)/2|0;n=c[j>>2]|0;y=C+-1|0;if((e|0)>1){k=0;l=n;m=n+(($(y,B)|0)<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(B|0))break;else{l=l+2|0;m=m+2|0}}}w=g*3|0;x=B+-1|0;if((f|0)>1){k=0;g=n;l=n+(x<<1)|0;while(1){b[l>>1]=0;b[g>>1]=0;k=k+1|0;if((k|0)>=(C|0))break;else{g=g+(B<<1)|0;l=l+(B<<1)|0}}}l=j+1179664|0;t=0-B|0;r=1-B|0;s=~B;q=(e*3|0)+12|0;a:do if((y|0)>1){u=(x|0)>1;v=1;g=a+((e*6|0)+6)|0;m=n+(B+1<<1)|0;k=0;b:while(1){if(u){p=1;o=m;n=k;while(1){do if(((d[g+1>>0]|0)+(d[g>>0]|0)+(d[g+2>>0]|0)|0)>(w|0)){b[o>>1]=0;k=n}else{k=b[o+(t<<1)>>1]|0;if(k<<16>>16>0){b[o>>1]=k;k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;e=j+1310736+(k+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+v;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}f=b[o+(r<<1)>>1]|0;a=f<<16>>16;k=b[o+(s<<1)>>1]|0;e=k<<16>>16;m=k<<16>>16>0;if(f<<16>>16<=0){if(m){b[o>>1]=k;k=e*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+p;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+v;m=j+1310736+(k+-3<<2)|0;if((c[m>>2]|0)<(p|0))c[m>>2]=p;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}k=b[o+-2>>1]|0;if(k<<16>>16>0){b[o>>1]=k;k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;e=j+1310736+(k+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+v;k=j+1310736+(k+-3<<2)|0;if((c[k>>2]|0)>=(p|0)){k=n;break}c[k>>2]=p;k=n;break}else{k=n+1|0;if((n|0)>32767)break b;b[o>>1]=k;c[j+1179664+(n<<2)>>2]=k<<16>>16;n=n*7|0;c[j+1310736+(n<<2)>>2]=1;c[j+1310736+(n+1<<2)>>2]=p;c[j+1310736+(n+2<<2)>>2]=v;c[j+1310736+(n+3<<2)>>2]=p;c[j+1310736+(n+4<<2)>>2]=p;c[j+1310736+(n+5<<2)>>2]=v;c[j+1310736+(n+6<<2)>>2]=v;break}}if(m){k=c[j+1179664+(a+-1<<2)>>2]|0;a=c[j+1179664+(e+-1<<2)>>2]|0;if((k|0)>(a|0)){b[o>>1]=a;if((n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(k|0))c[f>>2]=a;m=m+1|0;if((m|0)>=(n|0)){k=a;break}else f=f+4|0}}else k=a}else{b[o>>1]=k;if((k|0)<(a|0)&(n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(a|0))c[f>>2]=k;m=m+1|0;if((m|0)>=(n|0))break;else f=f+4|0}}}k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;e=j+1310736+(k+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+v;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}m=b[o+-2>>1]|0;if(m<<16>>16<=0){b[o>>1]=f;k=a*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+p;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+v;m=j+1310736+(k+-4<<2)|0;if((c[m>>2]|0)>(p|0))c[m>>2]=p;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}k=c[j+1179664+(a+-1<<2)>>2]|0;a=c[j+1179664+((m<<16>>16)+-1<<2)>>2]|0;if((k|0)>(a|0)){b[o>>1]=a;if((n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(k|0))c[f>>2]=a;m=m+1|0;if((m|0)>=(n|0)){k=a;break}else f=f+4|0}}else k=a}else{b[o>>1]=k;if((k|0)<(a|0)&(n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(a|0))c[f>>2]=k;m=m+1|0;if((m|0)>=(n|0))break;else f=f+4|0}}}k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;k=j+1310736+(k+-5<<2)|0;c[k>>2]=(c[k>>2]|0)+v;k=n}while(0);p=p+1|0;g=g+6|0;m=o+2|0;if((p|0)>=(x|0))break;else{o=m;n=k}}}v=v+1|0;if((v|0)>=(y|0)){e=k;A=52;break a}else{g=g+q|0;m=m+4|0}}Me(3,3904,z);k=-1}else{e=0;A=52}while(0);if((A|0)==52){f=j+12|0;if((e|0)<1)g=1;else{m=1;g=1;while(1){k=c[l>>2]|0;if((k|0)==(m|0)){k=g;g=g+1|0}else k=c[j+1179664+(k+-1<<2)>>2]|0;c[l>>2]=k;if((m|0)<(e|0)){m=m+1|0;l=l+4|0}else break}}a=j+8|0;k=g+-1|0;c[a>>2]=k;if(k){ek(f|0,0,k<<2|0)|0;ek(j+655376|0,0,k<<4|0)|0;if((g|0)>1){k=0;do{A=k<<2;c[j+131084+(A<<2)>>2]=B;c[j+131084+((A|1)<<2)>>2]=0;c[j+131084+((A|2)<<2)>>2]=C;c[j+131084+((A|3)<<2)>>2]=0;k=k+1|0}while((k|0)<(c[a>>2]|0))}if((e|0)>0){f=0;do{l=(c[j+1179664+(f<<2)>>2]|0)+-1|0;m=f*7|0;k=j+12+(l<<2)|0;c[k>>2]=(c[k>>2]|0)+(c[j+1310736+(m<<2)>>2]|0);k=l<<1;g=j+655376+(k<<3)|0;h[g>>3]=+h[g>>3]+ +(c[j+1310736+(m+1<<2)>>2]|0);k=j+655376+((k|1)<<3)|0;h[k>>3]=+h[k>>3]+ +(c[j+1310736+(m+2<<2)>>2]|0);l=l<<2;k=j+131084+(l<<2)|0;g=c[j+1310736+(m+3<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;k=j+131084+((l|1)<<2)|0;g=c[j+1310736+(m+4<<2)>>2]|0;if((c[k>>2]|0)<(g|0))c[k>>2]=g;k=j+131084+((l|2)<<2)|0;g=c[j+1310736+(m+5<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;g=j+131084+((l|3)<<2)|0;k=c[j+1310736+(m+6<<2)>>2]|0;if((c[g>>2]|0)<(k|0))c[g>>2]=k;f=f+1|0}while((f|0)<(e|0))}if((c[a>>2]|0)>0){k=0;do{B=j+12+(k<<2)|0;C=k<<1;A=j+655376+(C<<3)|0;h[A>>3]=+h[A>>3]/+(c[B>>2]|0);C=j+655376+((C|1)<<3)|0;h[C>>3]=+h[C>>3]/+(c[B>>2]|0);k=k+1|0}while((k|0)<(c[a>>2]|0));k=0}else k=0}else k=0}i=D;return k|0}function oc(a,e,f,g,j){a=a|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;D=i;i=i+16|0;z=D;B=(e|0)/2|0;C=(f|0)/2|0;n=c[j>>2]|0;y=C+-1|0;if((e|0)>1){k=0;l=n;m=n+(($(y,B)|0)<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(B|0))break;else{l=l+2|0;m=m+2|0}}}w=g*3|0;x=B+-1|0;if((f|0)>1){k=0;g=n;l=n+(x<<1)|0;while(1){b[l>>1]=0;b[g>>1]=0;k=k+1|0;if((k|0)>=(C|0))break;else{g=g+(B<<1)|0;l=l+(B<<1)|0}}}l=j+1179664|0;t=0-B|0;r=1-B|0;s=~B;q=(e<<1)+8|0;a:do if((y|0)>1){u=(x|0)>1;v=1;g=a+((e<<2)+4)|0;m=n+(B+1<<1)|0;k=0;b:while(1){if(u){p=1;o=m;n=k;while(1){a=d[g>>0]|0;e=d[g+1>>0]|0;do if(((a&248)+10+(a<<5&224)+(e>>>3&28)+(e<<3&248)|0)>(w|0)){b[o>>1]=0;k=n}else{k=b[o+(t<<1)>>1]|0;if(k<<16>>16>0){b[o>>1]=k;k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;e=j+1310736+(k+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+v;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}f=b[o+(r<<1)>>1]|0;a=f<<16>>16;k=b[o+(s<<1)>>1]|0;e=k<<16>>16;m=k<<16>>16>0;if(f<<16>>16<=0){if(m){b[o>>1]=k;k=e*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+p;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+v;m=j+1310736+(k+-3<<2)|0;if((c[m>>2]|0)<(p|0))c[m>>2]=p;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}k=b[o+-2>>1]|0;if(k<<16>>16>0){b[o>>1]=k;k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;e=j+1310736+(k+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+v;k=j+1310736+(k+-3<<2)|0;if((c[k>>2]|0)>=(p|0)){k=n;break}c[k>>2]=p;k=n;break}else{k=n+1|0;if((n|0)>32767)break b;b[o>>1]=k;c[j+1179664+(n<<2)>>2]=k<<16>>16;n=n*7|0;c[j+1310736+(n<<2)>>2]=1;c[j+1310736+(n+1<<2)>>2]=p;c[j+1310736+(n+2<<2)>>2]=v;c[j+1310736+(n+3<<2)>>2]=p;c[j+1310736+(n+4<<2)>>2]=p;c[j+1310736+(n+5<<2)>>2]=v;c[j+1310736+(n+6<<2)>>2]=v;break}}if(m){k=c[j+1179664+(a+-1<<2)>>2]|0;a=c[j+1179664+(e+-1<<2)>>2]|0;if((k|0)>(a|0)){b[o>>1]=a;if((n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(k|0))c[f>>2]=a;m=m+1|0;if((m|0)>=(n|0)){k=a;break}else f=f+4|0}}else k=a}else{b[o>>1]=k;if((k|0)<(a|0)&(n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(a|0))c[f>>2]=k;m=m+1|0;if((m|0)>=(n|0))break;else f=f+4|0}}}k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;e=j+1310736+(k+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+v;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}m=b[o+-2>>1]|0;if(m<<16>>16<=0){b[o>>1]=f;k=a*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+p;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+v;m=j+1310736+(k+-4<<2)|0;if((c[m>>2]|0)>(p|0))c[m>>2]=p;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}k=c[j+1179664+(a+-1<<2)>>2]|0;a=c[j+1179664+((m<<16>>16)+-1<<2)>>2]|0;if((k|0)>(a|0)){b[o>>1]=a;if((n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(k|0))c[f>>2]=a;m=m+1|0;if((m|0)>=(n|0)){k=a;break}else f=f+4|0}}else k=a}else{b[o>>1]=k;if((k|0)<(a|0)&(n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(a|0))c[f>>2]=k;m=m+1|0;if((m|0)>=(n|0))break;else f=f+4|0}}}k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;k=j+1310736+(k+-5<<2)|0;c[k>>2]=(c[k>>2]|0)+v;k=n}while(0);p=p+1|0;g=g+4|0;m=o+2|0;if((p|0)>=(x|0))break;else{o=m;n=k}}}v=v+1|0;if((v|0)>=(y|0)){e=k;A=52;break a}else{g=g+q|0;m=m+4|0}}Me(3,3904,z);k=-1}else{e=0;A=52}while(0);if((A|0)==52){f=j+12|0;if((e|0)<1)g=1;else{m=1;g=1;while(1){k=c[l>>2]|0;if((k|0)==(m|0)){k=g;g=g+1|0}else k=c[j+1179664+(k+-1<<2)>>2]|0;c[l>>2]=k;if((m|0)<(e|0)){m=m+1|0;l=l+4|0}else break}}a=j+8|0;k=g+-1|0;c[a>>2]=k;if(k){ek(f|0,0,k<<2|0)|0;ek(j+655376|0,0,k<<4|0)|0;if((g|0)>1){k=0;do{A=k<<2;c[j+131084+(A<<2)>>2]=B;c[j+131084+((A|1)<<2)>>2]=0;c[j+131084+((A|2)<<2)>>2]=C;c[j+131084+((A|3)<<2)>>2]=0;k=k+1|0}while((k|0)<(c[a>>2]|0))}if((e|0)>0){f=0;do{l=(c[j+1179664+(f<<2)>>2]|0)+-1|0;m=f*7|0;k=j+12+(l<<2)|0;c[k>>2]=(c[k>>2]|0)+(c[j+1310736+(m<<2)>>2]|0);k=l<<1;g=j+655376+(k<<3)|0;h[g>>3]=+h[g>>3]+ +(c[j+1310736+(m+1<<2)>>2]|0);k=j+655376+((k|1)<<3)|0;h[k>>3]=+h[k>>3]+ +(c[j+1310736+(m+2<<2)>>2]|0);l=l<<2;k=j+131084+(l<<2)|0;g=c[j+1310736+(m+3<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;k=j+131084+((l|1)<<2)|0;g=c[j+1310736+(m+4<<2)>>2]|0;if((c[k>>2]|0)<(g|0))c[k>>2]=g;k=j+131084+((l|2)<<2)|0;g=c[j+1310736+(m+5<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;g=j+131084+((l|3)<<2)|0;k=c[j+1310736+(m+6<<2)>>2]|0;if((c[g>>2]|0)<(k|0))c[g>>2]=k;f=f+1|0}while((f|0)<(e|0))}if((c[a>>2]|0)>0){k=0;do{B=j+12+(k<<2)|0;C=k<<1;A=j+655376+(C<<3)|0;h[A>>3]=+h[A>>3]/+(c[B>>2]|0);C=j+655376+((C|1)<<3)|0;h[C>>3]=+h[C>>3]/+(c[B>>2]|0);k=k+1|0}while((k|0)<(c[a>>2]|0));k=0}else k=0}else k=0}i=D;return k|0}function pc(a,e,f,g,j){a=a|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;D=i;i=i+16|0;z=D;B=(e|0)/2|0;C=(f|0)/2|0;n=c[j>>2]|0;y=C+-1|0;if((e|0)>1){k=0;l=n;m=n+(($(y,B)|0)<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(B|0))break;else{l=l+2|0;m=m+2|0}}}w=g*3|0;x=B+-1|0;if((f|0)>1){k=0;g=n;l=n+(x<<1)|0;while(1){b[l>>1]=0;b[g>>1]=0;k=k+1|0;if((k|0)>=(C|0))break;else{g=g+(B<<1)|0;l=l+(B<<1)|0}}}l=j+1179664|0;t=0-B|0;r=1-B|0;s=~B;q=(e<<2)+16|0;a:do if((y|0)>1){u=(x|0)>1;v=1;g=a+((e<<3)+8)|0;m=n+(B+1<<1)|0;k=0;b:while(1){if(u){p=1;o=m;n=k;while(1){do if(((d[g+1>>0]|0)+(d[g>>0]|0)+(d[g+2>>0]|0)|0)>(w|0)){b[o>>1]=0;k=n}else{k=b[o+(t<<1)>>1]|0;if(k<<16>>16>0){b[o>>1]=k;k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;e=j+1310736+(k+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+v;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}f=b[o+(r<<1)>>1]|0;a=f<<16>>16;k=b[o+(s<<1)>>1]|0;e=k<<16>>16;m=k<<16>>16>0;if(f<<16>>16<=0){if(m){b[o>>1]=k;k=e*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+p;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+v;m=j+1310736+(k+-3<<2)|0;if((c[m>>2]|0)<(p|0))c[m>>2]=p;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}k=b[o+-2>>1]|0;if(k<<16>>16>0){b[o>>1]=k;k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;e=j+1310736+(k+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+v;k=j+1310736+(k+-3<<2)|0;if((c[k>>2]|0)>=(p|0)){k=n;break}c[k>>2]=p;k=n;break}else{k=n+1|0;if((n|0)>32767)break b;b[o>>1]=k;c[j+1179664+(n<<2)>>2]=k<<16>>16;n=n*7|0;c[j+1310736+(n<<2)>>2]=1;c[j+1310736+(n+1<<2)>>2]=p;c[j+1310736+(n+2<<2)>>2]=v;c[j+1310736+(n+3<<2)>>2]=p;c[j+1310736+(n+4<<2)>>2]=p;c[j+1310736+(n+5<<2)>>2]=v;c[j+1310736+(n+6<<2)>>2]=v;break}}if(m){k=c[j+1179664+(a+-1<<2)>>2]|0;a=c[j+1179664+(e+-1<<2)>>2]|0;if((k|0)>(a|0)){b[o>>1]=a;if((n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(k|0))c[f>>2]=a;m=m+1|0;if((m|0)>=(n|0)){k=a;break}else f=f+4|0}}else k=a}else{b[o>>1]=k;if((k|0)<(a|0)&(n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(a|0))c[f>>2]=k;m=m+1|0;if((m|0)>=(n|0))break;else f=f+4|0}}}k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;e=j+1310736+(k+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+v;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}m=b[o+-2>>1]|0;if(m<<16>>16<=0){b[o>>1]=f;k=a*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+p;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+v;m=j+1310736+(k+-4<<2)|0;if((c[m>>2]|0)>(p|0))c[m>>2]=p;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}k=c[j+1179664+(a+-1<<2)>>2]|0;a=c[j+1179664+((m<<16>>16)+-1<<2)>>2]|0;if((k|0)>(a|0)){b[o>>1]=a;if((n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(k|0))c[f>>2]=a;m=m+1|0;if((m|0)>=(n|0)){k=a;break}else f=f+4|0}}else k=a}else{b[o>>1]=k;if((k|0)<(a|0)&(n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(a|0))c[f>>2]=k;m=m+1|0;if((m|0)>=(n|0))break;else f=f+4|0}}}k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;k=j+1310736+(k+-5<<2)|0;c[k>>2]=(c[k>>2]|0)+v;k=n}while(0);p=p+1|0;g=g+8|0;m=o+2|0;if((p|0)>=(x|0))break;else{o=m;n=k}}}v=v+1|0;if((v|0)>=(y|0)){e=k;A=52;break a}else{g=g+q|0;m=m+4|0}}Me(3,3904,z);k=-1}else{e=0;A=52}while(0);if((A|0)==52){f=j+12|0;if((e|0)<1)g=1;else{m=1;g=1;while(1){k=c[l>>2]|0;if((k|0)==(m|0)){k=g;g=g+1|0}else k=c[j+1179664+(k+-1<<2)>>2]|0;c[l>>2]=k;if((m|0)<(e|0)){m=m+1|0;l=l+4|0}else break}}a=j+8|0;k=g+-1|0;c[a>>2]=k;if(k){ek(f|0,0,k<<2|0)|0;ek(j+655376|0,0,k<<4|0)|0;if((g|0)>1){k=0;do{A=k<<2;c[j+131084+(A<<2)>>2]=B;c[j+131084+((A|1)<<2)>>2]=0;c[j+131084+((A|2)<<2)>>2]=C;c[j+131084+((A|3)<<2)>>2]=0;k=k+1|0}while((k|0)<(c[a>>2]|0))}if((e|0)>0){f=0;do{l=(c[j+1179664+(f<<2)>>2]|0)+-1|0;m=f*7|0;k=j+12+(l<<2)|0;c[k>>2]=(c[k>>2]|0)+(c[j+1310736+(m<<2)>>2]|0);k=l<<1;g=j+655376+(k<<3)|0;h[g>>3]=+h[g>>3]+ +(c[j+1310736+(m+1<<2)>>2]|0);k=j+655376+((k|1)<<3)|0;h[k>>3]=+h[k>>3]+ +(c[j+1310736+(m+2<<2)>>2]|0);l=l<<2;k=j+131084+(l<<2)|0;g=c[j+1310736+(m+3<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;k=j+131084+((l|1)<<2)|0;g=c[j+1310736+(m+4<<2)>>2]|0;if((c[k>>2]|0)<(g|0))c[k>>2]=g;k=j+131084+((l|2)<<2)|0;g=c[j+1310736+(m+5<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;g=j+131084+((l|3)<<2)|0;k=c[j+1310736+(m+6<<2)>>2]|0;if((c[g>>2]|0)<(k|0))c[g>>2]=k;f=f+1|0}while((f|0)<(e|0))}if((c[a>>2]|0)>0){k=0;do{B=j+12+(k<<2)|0;C=k<<1;A=j+655376+(C<<3)|0;h[A>>3]=+h[A>>3]/+(c[B>>2]|0);C=j+655376+((C|1)<<3)|0;h[C>>3]=+h[C>>3]/+(c[B>>2]|0);k=k+1|0}while((k|0)<(c[a>>2]|0));k=0}else k=0}else k=0}i=D;return k|0}function qc(a,e,f,g,j){a=a|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;D=i;i=i+16|0;z=D;B=(e|0)/2|0;C=(f|0)/2|0;n=c[j>>2]|0;y=C+-1|0;if((e|0)>1){k=0;l=n;m=n+(($(y,B)|0)<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(B|0))break;else{l=l+2|0;m=m+2|0}}}w=g*3|0;x=B+-1|0;if((f|0)>1){k=0;g=n;l=n+(x<<1)|0;while(1){b[l>>1]=0;b[g>>1]=0;k=k+1|0;if((k|0)>=(C|0))break;else{g=g+(B<<1)|0;l=l+(B<<1)|0}}}l=j+1179664|0;t=0-B|0;r=1-B|0;s=~B;q=(e<<1)+8|0;a:do if((y|0)>1){u=(x|0)>1;v=1;g=a+((e<<2)+4)|0;m=n+(B+1<<1)|0;k=0;b:while(1){if(u){p=1;o=m;n=k;while(1){e=d[g>>0]|0;do if(((e&240)+24+(e<<4&240)+((d[g+1>>0]|0)&240)|0)>(w|0)){b[o>>1]=0;k=n}else{k=b[o+(t<<1)>>1]|0;if(k<<16>>16>0){b[o>>1]=k;k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;e=j+1310736+(k+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+v;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}f=b[o+(r<<1)>>1]|0;a=f<<16>>16;k=b[o+(s<<1)>>1]|0;e=k<<16>>16;m=k<<16>>16>0;if(f<<16>>16<=0){if(m){b[o>>1]=k;k=e*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+p;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+v;m=j+1310736+(k+-3<<2)|0;if((c[m>>2]|0)<(p|0))c[m>>2]=p;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}k=b[o+-2>>1]|0;if(k<<16>>16>0){b[o>>1]=k;k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;e=j+1310736+(k+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+v;k=j+1310736+(k+-3<<2)|0;if((c[k>>2]|0)>=(p|0)){k=n;break}c[k>>2]=p;k=n;break}else{k=n+1|0;if((n|0)>32767)break b;b[o>>1]=k;c[j+1179664+(n<<2)>>2]=k<<16>>16;n=n*7|0;c[j+1310736+(n<<2)>>2]=1;c[j+1310736+(n+1<<2)>>2]=p;c[j+1310736+(n+2<<2)>>2]=v;c[j+1310736+(n+3<<2)>>2]=p;c[j+1310736+(n+4<<2)>>2]=p;c[j+1310736+(n+5<<2)>>2]=v;c[j+1310736+(n+6<<2)>>2]=v;break}}if(m){k=c[j+1179664+(a+-1<<2)>>2]|0;a=c[j+1179664+(e+-1<<2)>>2]|0;if((k|0)>(a|0)){b[o>>1]=a;if((n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(k|0))c[f>>2]=a;m=m+1|0;if((m|0)>=(n|0)){k=a;break}else f=f+4|0}}else k=a}else{b[o>>1]=k;if((k|0)<(a|0)&(n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(a|0))c[f>>2]=k;m=m+1|0;if((m|0)>=(n|0))break;else f=f+4|0}}}k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;e=j+1310736+(k+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+v;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}m=b[o+-2>>1]|0;if(m<<16>>16<=0){b[o>>1]=f;k=a*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+p;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+v;m=j+1310736+(k+-4<<2)|0;if((c[m>>2]|0)>(p|0))c[m>>2]=p;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}k=c[j+1179664+(a+-1<<2)>>2]|0;a=c[j+1179664+((m<<16>>16)+-1<<2)>>2]|0;if((k|0)>(a|0)){b[o>>1]=a;if((n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(k|0))c[f>>2]=a;m=m+1|0;if((m|0)>=(n|0)){k=a;break}else f=f+4|0}}else k=a}else{b[o>>1]=k;if((k|0)<(a|0)&(n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(a|0))c[f>>2]=k;m=m+1|0;if((m|0)>=(n|0))break;else f=f+4|0}}}k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;k=j+1310736+(k+-5<<2)|0;c[k>>2]=(c[k>>2]|0)+v;k=n}while(0);p=p+1|0;g=g+4|0;m=o+2|0;if((p|0)>=(x|0))break;else{o=m;n=k}}}v=v+1|0;if((v|0)>=(y|0)){e=k;A=52;break a}else{g=g+q|0;m=m+4|0}}Me(3,3904,z);k=-1}else{e=0;A=52}while(0);if((A|0)==52){f=j+12|0;if((e|0)<1)g=1;else{m=1;g=1;while(1){k=c[l>>2]|0;if((k|0)==(m|0)){k=g;g=g+1|0}else k=c[j+1179664+(k+-1<<2)>>2]|0;c[l>>2]=k;if((m|0)<(e|0)){m=m+1|0;l=l+4|0}else break}}a=j+8|0;k=g+-1|0;c[a>>2]=k;if(k){ek(f|0,0,k<<2|0)|0;ek(j+655376|0,0,k<<4|0)|0;if((g|0)>1){k=0;do{A=k<<2;c[j+131084+(A<<2)>>2]=B;c[j+131084+((A|1)<<2)>>2]=0;c[j+131084+((A|2)<<2)>>2]=C;c[j+131084+((A|3)<<2)>>2]=0;k=k+1|0}while((k|0)<(c[a>>2]|0))}if((e|0)>0){f=0;do{l=(c[j+1179664+(f<<2)>>2]|0)+-1|0;m=f*7|0;k=j+12+(l<<2)|0;c[k>>2]=(c[k>>2]|0)+(c[j+1310736+(m<<2)>>2]|0);k=l<<1;g=j+655376+(k<<3)|0;h[g>>3]=+h[g>>3]+ +(c[j+1310736+(m+1<<2)>>2]|0);k=j+655376+((k|1)<<3)|0;h[k>>3]=+h[k>>3]+ +(c[j+1310736+(m+2<<2)>>2]|0);l=l<<2;k=j+131084+(l<<2)|0;g=c[j+1310736+(m+3<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;k=j+131084+((l|1)<<2)|0;g=c[j+1310736+(m+4<<2)>>2]|0;if((c[k>>2]|0)<(g|0))c[k>>2]=g;k=j+131084+((l|2)<<2)|0;g=c[j+1310736+(m+5<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;g=j+131084+((l|3)<<2)|0;k=c[j+1310736+(m+6<<2)>>2]|0;if((c[g>>2]|0)<(k|0))c[g>>2]=k;f=f+1|0}while((f|0)<(e|0))}if((c[a>>2]|0)>0){k=0;do{B=j+12+(k<<2)|0;C=k<<1;A=j+655376+(C<<3)|0;h[A>>3]=+h[A>>3]/+(c[B>>2]|0);C=j+655376+((C|1)<<3)|0;h[C>>3]=+h[C>>3]/+(c[B>>2]|0);k=k+1|0}while((k|0)<(c[a>>2]|0));k=0}else k=0}else k=0}i=D;return k|0}function rc(a,e,f,g,j){a=a|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;D=i;i=i+16|0;z=D;B=(e|0)/2|0;C=(f|0)/2|0;n=c[j>>2]|0;y=C+-1|0;if((e|0)>1){k=0;l=n;m=n+(($(y,B)|0)<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(B|0))break;else{l=l+2|0;m=m+2|0}}}w=g*3|0;x=B+-1|0;if((f|0)>1){k=0;g=n;l=n+(x<<1)|0;while(1){b[l>>1]=0;b[g>>1]=0;k=k+1|0;if((k|0)>=(C|0))break;else{g=g+(B<<1)|0;l=l+(B<<1)|0}}}l=j+1179664|0;t=0-B|0;r=1-B|0;s=~B;q=(e<<1)+8|0;a:do if((y|0)>1){u=(x|0)>1;v=1;g=a+((e<<2)+4)|0;m=n+(B+1<<1)|0;k=0;b:while(1){if(u){p=1;o=m;n=k;while(1){a=d[g>>0]|0;e=d[g+1>>0]|0;do if(((a&248)+12+(a<<5&224)+(e>>>3&24)+(e<<2&248)|0)>(w|0)){b[o>>1]=0;k=n}else{k=b[o+(t<<1)>>1]|0;if(k<<16>>16>0){b[o>>1]=k;k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;e=j+1310736+(k+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+v;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}f=b[o+(r<<1)>>1]|0;a=f<<16>>16;k=b[o+(s<<1)>>1]|0;e=k<<16>>16;m=k<<16>>16>0;if(f<<16>>16<=0){if(m){b[o>>1]=k;k=e*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+p;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+v;m=j+1310736+(k+-3<<2)|0;if((c[m>>2]|0)<(p|0))c[m>>2]=p;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}k=b[o+-2>>1]|0;if(k<<16>>16>0){b[o>>1]=k;k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;e=j+1310736+(k+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+v;k=j+1310736+(k+-3<<2)|0;if((c[k>>2]|0)>=(p|0)){k=n;break}c[k>>2]=p;k=n;break}else{k=n+1|0;if((n|0)>32767)break b;b[o>>1]=k;c[j+1179664+(n<<2)>>2]=k<<16>>16;n=n*7|0;c[j+1310736+(n<<2)>>2]=1;c[j+1310736+(n+1<<2)>>2]=p;c[j+1310736+(n+2<<2)>>2]=v;c[j+1310736+(n+3<<2)>>2]=p;c[j+1310736+(n+4<<2)>>2]=p;c[j+1310736+(n+5<<2)>>2]=v;c[j+1310736+(n+6<<2)>>2]=v;break}}if(m){k=c[j+1179664+(a+-1<<2)>>2]|0;a=c[j+1179664+(e+-1<<2)>>2]|0;if((k|0)>(a|0)){b[o>>1]=a;if((n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(k|0))c[f>>2]=a;m=m+1|0;if((m|0)>=(n|0)){k=a;break}else f=f+4|0}}else k=a}else{b[o>>1]=k;if((k|0)<(a|0)&(n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(a|0))c[f>>2]=k;m=m+1|0;if((m|0)>=(n|0))break;else f=f+4|0}}}k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;e=j+1310736+(k+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+v;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}m=b[o+-2>>1]|0;if(m<<16>>16<=0){b[o>>1]=f;k=a*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+p;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+v;m=j+1310736+(k+-4<<2)|0;if((c[m>>2]|0)>(p|0))c[m>>2]=p;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}k=c[j+1179664+(a+-1<<2)>>2]|0;a=c[j+1179664+((m<<16>>16)+-1<<2)>>2]|0;if((k|0)>(a|0)){b[o>>1]=a;if((n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(k|0))c[f>>2]=a;m=m+1|0;if((m|0)>=(n|0)){k=a;break}else f=f+4|0}}else k=a}else{b[o>>1]=k;if((k|0)<(a|0)&(n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(a|0))c[f>>2]=k;m=m+1|0;if((m|0)>=(n|0))break;else f=f+4|0}}}k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;k=j+1310736+(k+-5<<2)|0;c[k>>2]=(c[k>>2]|0)+v;k=n}while(0);p=p+1|0;g=g+4|0;m=o+2|0;if((p|0)>=(x|0))break;else{o=m;n=k}}}v=v+1|0;if((v|0)>=(y|0)){e=k;A=52;break a}else{g=g+q|0;m=m+4|0}}Me(3,3904,z);k=-1}else{e=0;A=52}while(0);if((A|0)==52){f=j+12|0;if((e|0)<1)g=1;else{m=1;g=1;while(1){k=c[l>>2]|0;if((k|0)==(m|0)){k=g;g=g+1|0}else k=c[j+1179664+(k+-1<<2)>>2]|0;c[l>>2]=k;if((m|0)<(e|0)){m=m+1|0;l=l+4|0}else break}}a=j+8|0;k=g+-1|0;c[a>>2]=k;if(k){ek(f|0,0,k<<2|0)|0;ek(j+655376|0,0,k<<4|0)|0;if((g|0)>1){k=0;do{A=k<<2;c[j+131084+(A<<2)>>2]=B;c[j+131084+((A|1)<<2)>>2]=0;c[j+131084+((A|2)<<2)>>2]=C;c[j+131084+((A|3)<<2)>>2]=0;k=k+1|0}while((k|0)<(c[a>>2]|0))}if((e|0)>0){f=0;do{l=(c[j+1179664+(f<<2)>>2]|0)+-1|0;m=f*7|0;k=j+12+(l<<2)|0;c[k>>2]=(c[k>>2]|0)+(c[j+1310736+(m<<2)>>2]|0);k=l<<1;g=j+655376+(k<<3)|0;h[g>>3]=+h[g>>3]+ +(c[j+1310736+(m+1<<2)>>2]|0);k=j+655376+((k|1)<<3)|0;h[k>>3]=+h[k>>3]+ +(c[j+1310736+(m+2<<2)>>2]|0);l=l<<2;k=j+131084+(l<<2)|0;g=c[j+1310736+(m+3<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;k=j+131084+((l|1)<<2)|0;g=c[j+1310736+(m+4<<2)>>2]|0;if((c[k>>2]|0)<(g|0))c[k>>2]=g;k=j+131084+((l|2)<<2)|0;g=c[j+1310736+(m+5<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;g=j+131084+((l|3)<<2)|0;k=c[j+1310736+(m+6<<2)>>2]|0;if((c[g>>2]|0)<(k|0))c[g>>2]=k;f=f+1|0}while((f|0)<(e|0))}if((c[a>>2]|0)>0){k=0;do{B=j+12+(k<<2)|0;C=k<<1;A=j+655376+(C<<3)|0;h[A>>3]=+h[A>>3]/+(c[B>>2]|0);C=j+655376+((C|1)<<3)|0;h[C>>3]=+h[C>>3]/+(c[B>>2]|0);k=k+1|0}while((k|0)<(c[a>>2]|0));k=0}else k=0}else k=0}i=D;return k|0}function sc(a,e,f,g,j){a=a|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;D=i;i=i+16|0;z=D;B=(e|0)/2|0;C=(f|0)/2|0;n=c[j>>2]|0;y=C+-1|0;if((e|0)>1){k=0;l=n;m=n+(($(y,B)|0)<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(B|0))break;else{l=l+2|0;m=m+2|0}}}w=g*3|0;x=B+-1|0;if((f|0)>1){k=0;g=n;l=n+(x<<1)|0;while(1){b[l>>1]=0;b[g>>1]=0;k=k+1|0;if((k|0)>=(C|0))break;else{g=g+(B<<1)|0;l=l+(B<<1)|0}}}l=j+1179664|0;t=0-B|0;r=1-B|0;s=~B;q=(e<<2)+16|0;a:do if((y|0)>1){u=(x|0)>1;v=1;g=a+((e<<3)+8)|0;m=n+(B+1<<1)|0;k=0;b:while(1){if(u){p=1;o=m;n=k;while(1){do if(((d[g+2>>0]|0)+(d[g+1>>0]|0)+(d[g+3>>0]|0)|0)>(w|0)){b[o>>1]=0;k=n}else{k=b[o+(t<<1)>>1]|0;if(k<<16>>16>0){b[o>>1]=k;k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;e=j+1310736+(k+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+v;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}f=b[o+(r<<1)>>1]|0;a=f<<16>>16;k=b[o+(s<<1)>>1]|0;e=k<<16>>16;m=k<<16>>16>0;if(f<<16>>16<=0){if(m){b[o>>1]=k;k=e*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+p;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+v;m=j+1310736+(k+-3<<2)|0;if((c[m>>2]|0)<(p|0))c[m>>2]=p;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}k=b[o+-2>>1]|0;if(k<<16>>16>0){b[o>>1]=k;k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;e=j+1310736+(k+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+v;k=j+1310736+(k+-3<<2)|0;if((c[k>>2]|0)>=(p|0)){k=n;break}c[k>>2]=p;k=n;break}else{k=n+1|0;if((n|0)>32767)break b;b[o>>1]=k;c[j+1179664+(n<<2)>>2]=k<<16>>16;n=n*7|0;c[j+1310736+(n<<2)>>2]=1;c[j+1310736+(n+1<<2)>>2]=p;c[j+1310736+(n+2<<2)>>2]=v;c[j+1310736+(n+3<<2)>>2]=p;c[j+1310736+(n+4<<2)>>2]=p;c[j+1310736+(n+5<<2)>>2]=v;c[j+1310736+(n+6<<2)>>2]=v;break}}if(m){k=c[j+1179664+(a+-1<<2)>>2]|0;a=c[j+1179664+(e+-1<<2)>>2]|0;if((k|0)>(a|0)){b[o>>1]=a;if((n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(k|0))c[f>>2]=a;m=m+1|0;if((m|0)>=(n|0)){k=a;break}else f=f+4|0}}else k=a}else{b[o>>1]=k;if((k|0)<(a|0)&(n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(a|0))c[f>>2]=k;m=m+1|0;if((m|0)>=(n|0))break;else f=f+4|0}}}k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;e=j+1310736+(k+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+v;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}m=b[o+-2>>1]|0;if(m<<16>>16<=0){b[o>>1]=f;k=a*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+p;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+v;m=j+1310736+(k+-4<<2)|0;if((c[m>>2]|0)>(p|0))c[m>>2]=p;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}k=c[j+1179664+(a+-1<<2)>>2]|0;a=c[j+1179664+((m<<16>>16)+-1<<2)>>2]|0;if((k|0)>(a|0)){b[o>>1]=a;if((n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(k|0))c[f>>2]=a;m=m+1|0;if((m|0)>=(n|0)){k=a;break}else f=f+4|0}}else k=a}else{b[o>>1]=k;if((k|0)<(a|0)&(n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(a|0))c[f>>2]=k;m=m+1|0;if((m|0)>=(n|0))break;else f=f+4|0}}}k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;k=j+1310736+(k+-5<<2)|0;c[k>>2]=(c[k>>2]|0)+v;k=n}while(0);p=p+1|0;g=g+8|0;m=o+2|0;if((p|0)>=(x|0))break;else{o=m;n=k}}}v=v+1|0;if((v|0)>=(y|0)){e=k;A=52;break a}else{g=g+q|0;m=m+4|0}}Me(3,3904,z);k=-1}else{e=0;A=52}while(0);if((A|0)==52){f=j+12|0;if((e|0)<1)g=1;else{m=1;g=1;while(1){k=c[l>>2]|0;if((k|0)==(m|0)){k=g;g=g+1|0}else k=c[j+1179664+(k+-1<<2)>>2]|0;c[l>>2]=k;if((m|0)<(e|0)){m=m+1|0;l=l+4|0}else break}}a=j+8|0;k=g+-1|0;c[a>>2]=k;if(k){ek(f|0,0,k<<2|0)|0;ek(j+655376|0,0,k<<4|0)|0;if((g|0)>1){k=0;do{A=k<<2;c[j+131084+(A<<2)>>2]=B;c[j+131084+((A|1)<<2)>>2]=0;c[j+131084+((A|2)<<2)>>2]=C;c[j+131084+((A|3)<<2)>>2]=0;k=k+1|0}while((k|0)<(c[a>>2]|0))}if((e|0)>0){f=0;do{l=(c[j+1179664+(f<<2)>>2]|0)+-1|0;m=f*7|0;k=j+12+(l<<2)|0;c[k>>2]=(c[k>>2]|0)+(c[j+1310736+(m<<2)>>2]|0);k=l<<1;g=j+655376+(k<<3)|0;h[g>>3]=+h[g>>3]+ +(c[j+1310736+(m+1<<2)>>2]|0);k=j+655376+((k|1)<<3)|0;h[k>>3]=+h[k>>3]+ +(c[j+1310736+(m+2<<2)>>2]|0);l=l<<2;k=j+131084+(l<<2)|0;g=c[j+1310736+(m+3<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;k=j+131084+((l|1)<<2)|0;g=c[j+1310736+(m+4<<2)>>2]|0;if((c[k>>2]|0)<(g|0))c[k>>2]=g;k=j+131084+((l|2)<<2)|0;g=c[j+1310736+(m+5<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;g=j+131084+((l|3)<<2)|0;k=c[j+1310736+(m+6<<2)>>2]|0;if((c[g>>2]|0)<(k|0))c[g>>2]=k;f=f+1|0}while((f|0)<(e|0))}if((c[a>>2]|0)>0){k=0;do{B=j+12+(k<<2)|0;C=k<<1;A=j+655376+(C<<3)|0;h[A>>3]=+h[A>>3]/+(c[B>>2]|0);C=j+655376+((C|1)<<3)|0;h[C>>3]=+h[C>>3]/+(c[B>>2]|0);k=k+1|0}while((k|0)<(c[a>>2]|0));k=0}else k=0}else k=0}i=D;return k|0}function tc(a,e,f,g,j){a=a|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;D=i;i=i+16|0;z=D;B=(e|0)/2|0;C=(f|0)/2|0;n=c[j>>2]|0;y=C+-1|0;if((e|0)>1){k=0;l=n;m=n+(($(y,B)|0)<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(B|0))break;else{l=l+2|0;m=m+2|0}}}x=B+-1|0;if((f|0)>1){k=0;l=n;m=n+(x<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(C|0))break;else{l=l+(B<<1)|0;m=m+(B<<1)|0}}}m=j+1179664|0;u=0-B|0;s=1-B|0;t=~B;r=e+4|0;a:do if((y|0)>1){v=(x|0)>1;w=1;l=a+((e<<1)+2)|0;f=n+(B+1<<1)|0;k=0;b:while(1){if(v){q=1;p=f;o=k;while(1){do if((d[l>>0]|0|0)>(g|0)){b[p>>1]=0;k=o}else{k=b[p+(u<<1)>>1]|0;if(k<<16>>16>0){b[p>>1]=k;k=(k<<16>>16)*7|0;n=j+1310736+(k+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=j+1310736+(k+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+q;n=j+1310736+(k+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+w;c[j+1310736+(k+-1<<2)>>2]=w;k=o;break}a=b[p+(s<<1)>>1]|0;e=a<<16>>16;k=b[p+(t<<1)>>1]|0;n=k<<16>>16;f=k<<16>>16>0;if(a<<16>>16<=0){if(f){b[p>>1]=k;k=n*7|0;f=j+1310736+(k+-7<<2)|0;c[f>>2]=(c[f>>2]|0)+1;f=j+1310736+(k+-6<<2)|0;c[f>>2]=(c[f>>2]|0)+q;f=j+1310736+(k+-5<<2)|0;c[f>>2]=(c[f>>2]|0)+w;f=j+1310736+(k+-3<<2)|0;if((c[f>>2]|0)<(q|0))c[f>>2]=q;c[j+1310736+(k+-1<<2)>>2]=w;k=o;break}k=b[p+-2>>1]|0;if(k<<16>>16>0){b[p>>1]=k;k=(k<<16>>16)*7|0;n=j+1310736+(k+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=j+1310736+(k+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+q;n=j+1310736+(k+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+w;k=j+1310736+(k+-3<<2)|0;if((c[k>>2]|0)>=(q|0)){k=o;break}c[k>>2]=q;k=o;break}else{k=o+1|0;if((o|0)>32767)break b;b[p>>1]=k;c[j+1179664+(o<<2)>>2]=k<<16>>16;o=o*7|0;c[j+1310736+(o<<2)>>2]=1;c[j+1310736+(o+1<<2)>>2]=q;c[j+1310736+(o+2<<2)>>2]=w;c[j+1310736+(o+3<<2)>>2]=q;c[j+1310736+(o+4<<2)>>2]=q;c[j+1310736+(o+5<<2)>>2]=w;c[j+1310736+(o+6<<2)>>2]=w;break}}if(f){k=c[j+1179664+(e+-1<<2)>>2]|0;e=c[j+1179664+(n+-1<<2)>>2]|0;if((k|0)>(e|0)){b[p>>1]=e;if((o|0)>0){f=0;a=m;while(1){if((c[a>>2]|0)==(k|0))c[a>>2]=e;f=f+1|0;if((f|0)>=(o|0)){k=e;break}else a=a+4|0}}else k=e}else{b[p>>1]=k;if((k|0)<(e|0)&(o|0)>0){f=0;a=m;while(1){if((c[a>>2]|0)==(e|0))c[a>>2]=k;f=f+1|0;if((f|0)>=(o|0))break;else a=a+4|0}}}k=(k<<16>>16)*7|0;n=j+1310736+(k+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=j+1310736+(k+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+q;n=j+1310736+(k+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+w;c[j+1310736+(k+-1<<2)>>2]=w;k=o;break}f=b[p+-2>>1]|0;if(f<<16>>16<=0){b[p>>1]=a;k=e*7|0;f=j+1310736+(k+-7<<2)|0;c[f>>2]=(c[f>>2]|0)+1;f=j+1310736+(k+-6<<2)|0;c[f>>2]=(c[f>>2]|0)+q;f=j+1310736+(k+-5<<2)|0;c[f>>2]=(c[f>>2]|0)+w;f=j+1310736+(k+-4<<2)|0;if((c[f>>2]|0)>(q|0))c[f>>2]=q;c[j+1310736+(k+-1<<2)>>2]=w;k=o;break}k=c[j+1179664+(e+-1<<2)>>2]|0;e=c[j+1179664+((f<<16>>16)+-1<<2)>>2]|0;if((k|0)>(e|0)){b[p>>1]=e;if((o|0)>0){f=0;a=m;while(1){if((c[a>>2]|0)==(k|0))c[a>>2]=e;f=f+1|0;if((f|0)>=(o|0)){k=e;break}else a=a+4|0}}else k=e}else{b[p>>1]=k;if((k|0)<(e|0)&(o|0)>0){f=0;a=m;while(1){if((c[a>>2]|0)==(e|0))c[a>>2]=k;f=f+1|0;if((f|0)>=(o|0))break;else a=a+4|0}}}k=(k<<16>>16)*7|0;n=j+1310736+(k+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=j+1310736+(k+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+q;k=j+1310736+(k+-5<<2)|0;c[k>>2]=(c[k>>2]|0)+w;k=o}while(0);q=q+1|0;l=l+2|0;f=p+2|0;if((q|0)>=(x|0))break;else{p=f;o=k}}}w=w+1|0;if((w|0)>=(y|0)){n=k;A=52;break a}else{l=l+r|0;f=f+4|0}}Me(3,3904,z);k=-1}else{n=0;A=52}while(0);if((A|0)==52){a=j+12|0;if((n|0)<1)l=1;else{f=1;l=1;while(1){k=c[m>>2]|0;if((k|0)==(f|0)){k=l;l=l+1|0}else k=c[j+1179664+(k+-1<<2)>>2]|0;c[m>>2]=k;if((f|0)<(n|0)){f=f+1|0;m=m+4|0}else break}}e=j+8|0;k=l+-1|0;c[e>>2]=k;if(k){ek(a|0,0,k<<2|0)|0;ek(j+655376|0,0,k<<4|0)|0;if((l|0)>1){k=0;do{A=k<<2;c[j+131084+(A<<2)>>2]=B;c[j+131084+((A|1)<<2)>>2]=0;c[j+131084+((A|2)<<2)>>2]=C;c[j+131084+((A|3)<<2)>>2]=0;k=k+1|0}while((k|0)<(c[e>>2]|0))}if((n|0)>0){a=0;do{m=(c[j+1179664+(a<<2)>>2]|0)+-1|0;f=a*7|0;k=j+12+(m<<2)|0;c[k>>2]=(c[k>>2]|0)+(c[j+1310736+(f<<2)>>2]|0);k=m<<1;l=j+655376+(k<<3)|0;h[l>>3]=+h[l>>3]+ +(c[j+1310736+(f+1<<2)>>2]|0);k=j+655376+((k|1)<<3)|0;h[k>>3]=+h[k>>3]+ +(c[j+1310736+(f+2<<2)>>2]|0);m=m<<2;k=j+131084+(m<<2)|0;l=c[j+1310736+(f+3<<2)>>2]|0;if((c[k>>2]|0)>(l|0))c[k>>2]=l;k=j+131084+((m|1)<<2)|0;l=c[j+1310736+(f+4<<2)>>2]|0;if((c[k>>2]|0)<(l|0))c[k>>2]=l;k=j+131084+((m|2)<<2)|0;l=c[j+1310736+(f+5<<2)>>2]|0;if((c[k>>2]|0)>(l|0))c[k>>2]=l;l=j+131084+((m|3)<<2)|0;k=c[j+1310736+(f+6<<2)>>2]|0;if((c[l>>2]|0)<(k|0))c[l>>2]=k;a=a+1|0}while((a|0)<(n|0))}if((c[e>>2]|0)>0){k=0;do{B=j+12+(k<<2)|0;C=k<<1;A=j+655376+(C<<3)|0;h[A>>3]=+h[A>>3]/+(c[B>>2]|0);C=j+655376+((C|1)<<3)|0;h[C>>3]=+h[C>>3]/+(c[B>>2]|0);k=k+1|0}while((k|0)<(c[e>>2]|0));k=0}else k=0}else k=0}i=D;return k|0}function uc(a,e,f,g,j){a=a|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;D=i;i=i+16|0;z=D;B=(e|0)/2|0;C=(f|0)/2|0;n=c[j>>2]|0;y=C+-1|0;if((e|0)>1){k=0;l=n;m=n+(($(y,B)|0)<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(B|0))break;else{l=l+2|0;m=m+2|0}}}x=B+-1|0;if((f|0)>1){k=0;l=n;m=n+(x<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(C|0))break;else{l=l+(B<<1)|0;m=m+(B<<1)|0}}}m=j+1179664|0;u=0-B|0;s=1-B|0;t=~B;r=(e<<1)+8|0;a:do if((y|0)>1){v=(x|0)>1;w=1;l=a+((e<<2)+4)|0;f=n+(B+1<<1)|0;k=0;b:while(1){if(v){q=1;p=f;o=k;while(1){do if((d[l+1>>0]|0|0)>(g|0)){b[p>>1]=0;k=o}else{k=b[p+(u<<1)>>1]|0;if(k<<16>>16>0){b[p>>1]=k;k=(k<<16>>16)*7|0;n=j+1310736+(k+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=j+1310736+(k+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+q;n=j+1310736+(k+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+w;c[j+1310736+(k+-1<<2)>>2]=w;k=o;break}a=b[p+(s<<1)>>1]|0;e=a<<16>>16;k=b[p+(t<<1)>>1]|0;n=k<<16>>16;f=k<<16>>16>0;if(a<<16>>16<=0){if(f){b[p>>1]=k;k=n*7|0;f=j+1310736+(k+-7<<2)|0;c[f>>2]=(c[f>>2]|0)+1;f=j+1310736+(k+-6<<2)|0;c[f>>2]=(c[f>>2]|0)+q;f=j+1310736+(k+-5<<2)|0;c[f>>2]=(c[f>>2]|0)+w;f=j+1310736+(k+-3<<2)|0;if((c[f>>2]|0)<(q|0))c[f>>2]=q;c[j+1310736+(k+-1<<2)>>2]=w;k=o;break}k=b[p+-2>>1]|0;if(k<<16>>16>0){b[p>>1]=k;k=(k<<16>>16)*7|0;n=j+1310736+(k+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=j+1310736+(k+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+q;n=j+1310736+(k+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+w;k=j+1310736+(k+-3<<2)|0;if((c[k>>2]|0)>=(q|0)){k=o;break}c[k>>2]=q;k=o;break}else{k=o+1|0;if((o|0)>32767)break b;b[p>>1]=k;c[j+1179664+(o<<2)>>2]=k<<16>>16;o=o*7|0;c[j+1310736+(o<<2)>>2]=1;c[j+1310736+(o+1<<2)>>2]=q;c[j+1310736+(o+2<<2)>>2]=w;c[j+1310736+(o+3<<2)>>2]=q;c[j+1310736+(o+4<<2)>>2]=q;c[j+1310736+(o+5<<2)>>2]=w;c[j+1310736+(o+6<<2)>>2]=w;break}}if(f){k=c[j+1179664+(e+-1<<2)>>2]|0;e=c[j+1179664+(n+-1<<2)>>2]|0;if((k|0)>(e|0)){b[p>>1]=e;if((o|0)>0){f=0;a=m;while(1){if((c[a>>2]|0)==(k|0))c[a>>2]=e;f=f+1|0;if((f|0)>=(o|0)){k=e;break}else a=a+4|0}}else k=e}else{b[p>>1]=k;if((k|0)<(e|0)&(o|0)>0){f=0;a=m;while(1){if((c[a>>2]|0)==(e|0))c[a>>2]=k;f=f+1|0;if((f|0)>=(o|0))break;else a=a+4|0}}}k=(k<<16>>16)*7|0;n=j+1310736+(k+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=j+1310736+(k+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+q;n=j+1310736+(k+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+w;c[j+1310736+(k+-1<<2)>>2]=w;k=o;break}f=b[p+-2>>1]|0;if(f<<16>>16<=0){b[p>>1]=a;k=e*7|0;f=j+1310736+(k+-7<<2)|0;c[f>>2]=(c[f>>2]|0)+1;f=j+1310736+(k+-6<<2)|0;c[f>>2]=(c[f>>2]|0)+q;f=j+1310736+(k+-5<<2)|0;c[f>>2]=(c[f>>2]|0)+w;f=j+1310736+(k+-4<<2)|0;if((c[f>>2]|0)>(q|0))c[f>>2]=q;c[j+1310736+(k+-1<<2)>>2]=w;k=o;break}k=c[j+1179664+(e+-1<<2)>>2]|0;e=c[j+1179664+((f<<16>>16)+-1<<2)>>2]|0;if((k|0)>(e|0)){b[p>>1]=e;if((o|0)>0){f=0;a=m;while(1){if((c[a>>2]|0)==(k|0))c[a>>2]=e;f=f+1|0;if((f|0)>=(o|0)){k=e;break}else a=a+4|0}}else k=e}else{b[p>>1]=k;if((k|0)<(e|0)&(o|0)>0){f=0;a=m;while(1){if((c[a>>2]|0)==(e|0))c[a>>2]=k;f=f+1|0;if((f|0)>=(o|0))break;else a=a+4|0}}}k=(k<<16>>16)*7|0;n=j+1310736+(k+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=j+1310736+(k+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+q;k=j+1310736+(k+-5<<2)|0;c[k>>2]=(c[k>>2]|0)+w;k=o}while(0);q=q+1|0;l=l+4|0;f=p+2|0;if((q|0)>=(x|0))break;else{p=f;o=k}}}w=w+1|0;if((w|0)>=(y|0)){n=k;A=52;break a}else{l=l+r|0;f=f+4|0}}Me(3,3904,z);k=-1}else{n=0;A=52}while(0);if((A|0)==52){a=j+12|0;if((n|0)<1)l=1;else{f=1;l=1;while(1){k=c[m>>2]|0;if((k|0)==(f|0)){k=l;l=l+1|0}else k=c[j+1179664+(k+-1<<2)>>2]|0;c[m>>2]=k;if((f|0)<(n|0)){f=f+1|0;m=m+4|0}else break}}e=j+8|0;k=l+-1|0;c[e>>2]=k;if(k){ek(a|0,0,k<<2|0)|0;ek(j+655376|0,0,k<<4|0)|0;if((l|0)>1){k=0;do{A=k<<2;c[j+131084+(A<<2)>>2]=B;c[j+131084+((A|1)<<2)>>2]=0;c[j+131084+((A|2)<<2)>>2]=C;c[j+131084+((A|3)<<2)>>2]=0;k=k+1|0}while((k|0)<(c[e>>2]|0))}if((n|0)>0){a=0;do{m=(c[j+1179664+(a<<2)>>2]|0)+-1|0;f=a*7|0;k=j+12+(m<<2)|0;c[k>>2]=(c[k>>2]|0)+(c[j+1310736+(f<<2)>>2]|0);k=m<<1;l=j+655376+(k<<3)|0;h[l>>3]=+h[l>>3]+ +(c[j+1310736+(f+1<<2)>>2]|0);k=j+655376+((k|1)<<3)|0;h[k>>3]=+h[k>>3]+ +(c[j+1310736+(f+2<<2)>>2]|0);m=m<<2;k=j+131084+(m<<2)|0;l=c[j+1310736+(f+3<<2)>>2]|0;if((c[k>>2]|0)>(l|0))c[k>>2]=l;k=j+131084+((m|1)<<2)|0;l=c[j+1310736+(f+4<<2)>>2]|0;if((c[k>>2]|0)<(l|0))c[k>>2]=l;k=j+131084+((m|2)<<2)|0;l=c[j+1310736+(f+5<<2)>>2]|0;if((c[k>>2]|0)>(l|0))c[k>>2]=l;l=j+131084+((m|3)<<2)|0;k=c[j+1310736+(f+6<<2)>>2]|0;if((c[l>>2]|0)<(k|0))c[l>>2]=k;a=a+1|0}while((a|0)<(n|0))}if((c[e>>2]|0)>0){k=0;do{B=j+12+(k<<2)|0;C=k<<1;A=j+655376+(C<<3)|0;h[A>>3]=+h[A>>3]/+(c[B>>2]|0);C=j+655376+((C|1)<<3)|0;h[C>>3]=+h[C>>3]/+(c[B>>2]|0);k=k+1|0}while((k|0)<(c[e>>2]|0));k=0}else k=0}else k=0}i=D;return k|0}function vc(a,e,f,g,j){a=a|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;D=i;i=i+16|0;z=D;B=(e|0)/2|0;C=(f|0)/2|0;n=c[j>>2]|0;y=C+-1|0;if((e|0)>1){k=0;l=n;m=n+(($(y,B)|0)<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(B|0))break;else{l=l+2|0;m=m+2|0}}}x=B+-1|0;if((f|0)>1){k=0;l=n;m=n+(x<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(C|0))break;else{l=l+(B<<1)|0;m=m+(B<<1)|0}}}m=j+1179664|0;u=0-B|0;s=1-B|0;t=~B;r=(e<<1)+8|0;a:do if((y|0)>1){v=(x|0)>1;w=1;l=a+((e<<2)+4)|0;f=n+(B+1<<1)|0;k=0;b:while(1){if(v){q=1;p=f;o=k;while(1){do if((d[l>>0]|0|0)>(g|0)){b[p>>1]=0;k=o}else{k=b[p+(u<<1)>>1]|0;if(k<<16>>16>0){b[p>>1]=k;k=(k<<16>>16)*7|0;n=j+1310736+(k+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=j+1310736+(k+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+q;n=j+1310736+(k+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+w;c[j+1310736+(k+-1<<2)>>2]=w;k=o;break}a=b[p+(s<<1)>>1]|0;e=a<<16>>16;k=b[p+(t<<1)>>1]|0;n=k<<16>>16;f=k<<16>>16>0;if(a<<16>>16<=0){if(f){b[p>>1]=k;k=n*7|0;f=j+1310736+(k+-7<<2)|0;c[f>>2]=(c[f>>2]|0)+1;f=j+1310736+(k+-6<<2)|0;c[f>>2]=(c[f>>2]|0)+q;f=j+1310736+(k+-5<<2)|0;c[f>>2]=(c[f>>2]|0)+w;f=j+1310736+(k+-3<<2)|0;if((c[f>>2]|0)<(q|0))c[f>>2]=q;c[j+1310736+(k+-1<<2)>>2]=w;k=o;break}k=b[p+-2>>1]|0;if(k<<16>>16>0){b[p>>1]=k;k=(k<<16>>16)*7|0;n=j+1310736+(k+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=j+1310736+(k+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+q;n=j+1310736+(k+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+w;k=j+1310736+(k+-3<<2)|0;if((c[k>>2]|0)>=(q|0)){k=o;break}c[k>>2]=q;k=o;break}else{k=o+1|0;if((o|0)>32767)break b;b[p>>1]=k;c[j+1179664+(o<<2)>>2]=k<<16>>16;o=o*7|0;c[j+1310736+(o<<2)>>2]=1;c[j+1310736+(o+1<<2)>>2]=q;c[j+1310736+(o+2<<2)>>2]=w;c[j+1310736+(o+3<<2)>>2]=q;c[j+1310736+(o+4<<2)>>2]=q;c[j+1310736+(o+5<<2)>>2]=w;c[j+1310736+(o+6<<2)>>2]=w;break}}if(f){k=c[j+1179664+(e+-1<<2)>>2]|0;e=c[j+1179664+(n+-1<<2)>>2]|0;if((k|0)>(e|0)){b[p>>1]=e;if((o|0)>0){f=0;a=m;while(1){if((c[a>>2]|0)==(k|0))c[a>>2]=e;f=f+1|0;if((f|0)>=(o|0)){k=e;break}else a=a+4|0}}else k=e}else{b[p>>1]=k;if((k|0)<(e|0)&(o|0)>0){f=0;a=m;while(1){if((c[a>>2]|0)==(e|0))c[a>>2]=k;f=f+1|0;if((f|0)>=(o|0))break;else a=a+4|0}}}k=(k<<16>>16)*7|0;n=j+1310736+(k+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=j+1310736+(k+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+q;n=j+1310736+(k+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+w;c[j+1310736+(k+-1<<2)>>2]=w;k=o;break}f=b[p+-2>>1]|0;if(f<<16>>16<=0){b[p>>1]=a;k=e*7|0;f=j+1310736+(k+-7<<2)|0;c[f>>2]=(c[f>>2]|0)+1;f=j+1310736+(k+-6<<2)|0;c[f>>2]=(c[f>>2]|0)+q;f=j+1310736+(k+-5<<2)|0;c[f>>2]=(c[f>>2]|0)+w;f=j+1310736+(k+-4<<2)|0;if((c[f>>2]|0)>(q|0))c[f>>2]=q;c[j+1310736+(k+-1<<2)>>2]=w;k=o;break}k=c[j+1179664+(e+-1<<2)>>2]|0;e=c[j+1179664+((f<<16>>16)+-1<<2)>>2]|0;if((k|0)>(e|0)){b[p>>1]=e;if((o|0)>0){f=0;a=m;while(1){if((c[a>>2]|0)==(k|0))c[a>>2]=e;f=f+1|0;if((f|0)>=(o|0)){k=e;break}else a=a+4|0}}else k=e}else{b[p>>1]=k;if((k|0)<(e|0)&(o|0)>0){f=0;a=m;while(1){if((c[a>>2]|0)==(e|0))c[a>>2]=k;f=f+1|0;if((f|0)>=(o|0))break;else a=a+4|0}}}k=(k<<16>>16)*7|0;n=j+1310736+(k+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=j+1310736+(k+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+q;k=j+1310736+(k+-5<<2)|0;c[k>>2]=(c[k>>2]|0)+w;k=o}while(0);q=q+1|0;l=l+4|0;f=p+2|0;if((q|0)>=(x|0))break;else{p=f;o=k}}}w=w+1|0;if((w|0)>=(y|0)){n=k;A=52;break a}else{l=l+r|0;f=f+4|0}}Me(3,3904,z);k=-1}else{n=0;A=52}while(0);if((A|0)==52){a=j+12|0;if((n|0)<1)l=1;else{f=1;l=1;while(1){k=c[m>>2]|0;if((k|0)==(f|0)){k=l;l=l+1|0}else k=c[j+1179664+(k+-1<<2)>>2]|0;c[m>>2]=k;if((f|0)<(n|0)){f=f+1|0;m=m+4|0}else break}}e=j+8|0;k=l+-1|0;c[e>>2]=k;if(k){ek(a|0,0,k<<2|0)|0;ek(j+655376|0,0,k<<4|0)|0;if((l|0)>1){k=0;do{A=k<<2;c[j+131084+(A<<2)>>2]=B;c[j+131084+((A|1)<<2)>>2]=0;c[j+131084+((A|2)<<2)>>2]=C;c[j+131084+((A|3)<<2)>>2]=0;k=k+1|0}while((k|0)<(c[e>>2]|0))}if((n|0)>0){a=0;do{m=(c[j+1179664+(a<<2)>>2]|0)+-1|0;f=a*7|0;k=j+12+(m<<2)|0;c[k>>2]=(c[k>>2]|0)+(c[j+1310736+(f<<2)>>2]|0);k=m<<1;l=j+655376+(k<<3)|0;h[l>>3]=+h[l>>3]+ +(c[j+1310736+(f+1<<2)>>2]|0);k=j+655376+((k|1)<<3)|0;h[k>>3]=+h[k>>3]+ +(c[j+1310736+(f+2<<2)>>2]|0);m=m<<2;k=j+131084+(m<<2)|0;l=c[j+1310736+(f+3<<2)>>2]|0;if((c[k>>2]|0)>(l|0))c[k>>2]=l;k=j+131084+((m|1)<<2)|0;l=c[j+1310736+(f+4<<2)>>2]|0;if((c[k>>2]|0)<(l|0))c[k>>2]=l;k=j+131084+((m|2)<<2)|0;l=c[j+1310736+(f+5<<2)>>2]|0;if((c[k>>2]|0)>(l|0))c[k>>2]=l;l=j+131084+((m|3)<<2)|0;k=c[j+1310736+(f+6<<2)>>2]|0;if((c[l>>2]|0)<(k|0))c[l>>2]=k;a=a+1|0}while((a|0)<(n|0))}if((c[e>>2]|0)>0){k=0;do{B=j+12+(k<<2)|0;C=k<<1;A=j+655376+(C<<3)|0;h[A>>3]=+h[A>>3]/+(c[B>>2]|0);C=j+655376+((C|1)<<3)|0;h[C>>3]=+h[C>>3]/+(c[B>>2]|0);k=k+1|0}while((k|0)<(c[e>>2]|0));k=0}else k=0}else k=0}i=D;return k|0}function wc(a,e,f,g,j){a=a|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;C=i;i=i+16|0;A=C;n=c[j>>2]|0;z=f+-1|0;if((e|0)>0){k=0;l=n;m=n+(($(z,e)|0)<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(e|0))break;else{l=l+2|0;m=m+2|0}}}y=g*3|0;x=e+-1|0;if((f|0)>0){k=0;g=n;l=n+(x<<1)|0;while(1){b[l>>1]=0;b[g>>1]=0;k=k+1|0;if((k|0)>=(f|0))break;else{g=g+(e<<1)|0;l=l+(e<<1)|0}}}l=j+1179664|0;k=e+1|0;u=0-e|0;s=1-e|0;t=~e;a:do if((z|0)>1){v=(x|0)>1;w=1;g=a+(k*3|0)|0;m=n+(k<<1)|0;k=0;b:while(1){if(v){r=1;q=m;p=k;while(1){do if(((d[g+1>>0]|0)+(d[g>>0]|0)+(d[g+2>>0]|0)|0)>(y|0)){b[q>>1]=0;k=p}else{k=b[q+(u<<1)>>1]|0;if(k<<16>>16>0){b[q>>1]=k;k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=j+1310736+(k+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+w;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}a=b[q+(s<<1)>>1]|0;n=a<<16>>16;k=b[q+(t<<1)>>1]|0;o=k<<16>>16;m=k<<16>>16>0;if(a<<16>>16<=0){if(m){b[q>>1]=k;k=o*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+r;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+w;m=j+1310736+(k+-3<<2)|0;if((c[m>>2]|0)<(r|0))c[m>>2]=r;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}k=b[q+-2>>1]|0;if(k<<16>>16>0){b[q>>1]=k;k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=j+1310736+(k+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+w;k=j+1310736+(k+-3<<2)|0;if((c[k>>2]|0)>=(r|0)){k=p;break}c[k>>2]=r;k=p;break}else{k=p+1|0;if((p|0)>32767)break b;b[q>>1]=k;c[j+1179664+(p<<2)>>2]=k<<16>>16;p=p*7|0;c[j+1310736+(p<<2)>>2]=1;c[j+1310736+(p+1<<2)>>2]=r;c[j+1310736+(p+2<<2)>>2]=w;c[j+1310736+(p+3<<2)>>2]=r;c[j+1310736+(p+4<<2)>>2]=r;c[j+1310736+(p+5<<2)>>2]=w;c[j+1310736+(p+6<<2)>>2]=w;break}}if(m){k=c[j+1179664+(n+-1<<2)>>2]|0;n=c[j+1179664+(o+-1<<2)>>2]|0;if((k|0)>(n|0)){b[q>>1]=n;if((p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(k|0))c[a>>2]=n;m=m+1|0;if((m|0)>=(p|0)){k=n;break}else a=a+4|0}}else k=n}else{b[q>>1]=k;if((k|0)<(n|0)&(p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(n|0))c[a>>2]=k;m=m+1|0;if((m|0)>=(p|0))break;else a=a+4|0}}}k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=j+1310736+(k+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+w;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}m=b[q+-2>>1]|0;if(m<<16>>16<=0){b[q>>1]=a;k=n*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+r;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+w;m=j+1310736+(k+-4<<2)|0;if((c[m>>2]|0)>(r|0))c[m>>2]=r;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}k=c[j+1179664+(n+-1<<2)>>2]|0;n=c[j+1179664+((m<<16>>16)+-1<<2)>>2]|0;if((k|0)>(n|0)){b[q>>1]=n;if((p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(k|0))c[a>>2]=n;m=m+1|0;if((m|0)>=(p|0)){k=n;break}else a=a+4|0}}else k=n}else{b[q>>1]=k;if((k|0)<(n|0)&(p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(n|0))c[a>>2]=k;m=m+1|0;if((m|0)>=(p|0))break;else a=a+4|0}}}k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;k=j+1310736+(k+-5<<2)|0;c[k>>2]=(c[k>>2]|0)+w;k=p}while(0);r=r+1|0;g=g+3|0;m=q+2|0;if((r|0)>=(x|0))break;else{q=m;p=k}}}w=w+1|0;if((w|0)>=(z|0)){o=k;B=52;break a}else{g=g+6|0;m=m+4|0}}Me(3,3904,A);k=-1}else{o=0;B=52}while(0);if((B|0)==52){a=j+12|0;if((o|0)<1)g=1;else{m=1;g=1;while(1){k=c[l>>2]|0;if((k|0)==(m|0)){k=g;g=g+1|0}else k=c[j+1179664+(k+-1<<2)>>2]|0;c[l>>2]=k;if((m|0)<(o|0)){m=m+1|0;l=l+4|0}else break}}n=j+8|0;k=g+-1|0;c[n>>2]=k;if(k){ek(a|0,0,k<<2|0)|0;ek(j+655376|0,0,k<<4|0)|0;if((g|0)>1){k=0;do{B=k<<2;c[j+131084+(B<<2)>>2]=e;c[j+131084+((B|1)<<2)>>2]=0;c[j+131084+((B|2)<<2)>>2]=f;c[j+131084+((B|3)<<2)>>2]=0;k=k+1|0}while((k|0)<(c[n>>2]|0))}if((o|0)>0){a=0;do{l=(c[j+1179664+(a<<2)>>2]|0)+-1|0;m=a*7|0;k=j+12+(l<<2)|0;c[k>>2]=(c[k>>2]|0)+(c[j+1310736+(m<<2)>>2]|0);k=l<<1;g=j+655376+(k<<3)|0;h[g>>3]=+h[g>>3]+ +(c[j+1310736+(m+1<<2)>>2]|0);k=j+655376+((k|1)<<3)|0;h[k>>3]=+h[k>>3]+ +(c[j+1310736+(m+2<<2)>>2]|0);l=l<<2;k=j+131084+(l<<2)|0;g=c[j+1310736+(m+3<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;k=j+131084+((l|1)<<2)|0;g=c[j+1310736+(m+4<<2)>>2]|0;if((c[k>>2]|0)<(g|0))c[k>>2]=g;k=j+131084+((l|2)<<2)|0;g=c[j+1310736+(m+5<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;g=j+131084+((l|3)<<2)|0;k=c[j+1310736+(m+6<<2)>>2]|0;if((c[g>>2]|0)<(k|0))c[g>>2]=k;a=a+1|0}while((a|0)<(o|0))}if((c[n>>2]|0)>0){k=0;do{e=j+12+(k<<2)|0;f=k<<1;B=j+655376+(f<<3)|0;h[B>>3]=+h[B>>3]/+(c[e>>2]|0);f=j+655376+((f|1)<<3)|0;h[f>>3]=+h[f>>3]/+(c[e>>2]|0);k=k+1|0}while((k|0)<(c[n>>2]|0));k=0}else k=0}else k=0}i=C;return k|0}function xc(a,e,f,g,j){a=a|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;C=i;i=i+16|0;A=C;n=c[j>>2]|0;z=f+-1|0;if((e|0)>0){k=0;l=n;m=n+(($(z,e)|0)<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(e|0))break;else{l=l+2|0;m=m+2|0}}}y=g*3|0;x=e+-1|0;if((f|0)>0){k=0;g=n;l=n+(x<<1)|0;while(1){b[l>>1]=0;b[g>>1]=0;k=k+1|0;if((k|0)>=(f|0))break;else{g=g+(e<<1)|0;l=l+(e<<1)|0}}}l=j+1179664|0;k=e+1|0;u=0-e|0;s=1-e|0;t=~e;a:do if((z|0)>1){v=(x|0)>1;w=1;g=a+(k<<1)|0;m=n+(k<<1)|0;k=0;b:while(1){if(v){r=1;q=m;p=k;while(1){n=d[g>>0]|0;o=d[g+1>>0]|0;do if(((n&248)+10+(n<<5&224)+(o>>>3&28)+(o<<3&248)|0)>(y|0)){b[q>>1]=0;k=p}else{k=b[q+(u<<1)>>1]|0;if(k<<16>>16>0){b[q>>1]=k;k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=j+1310736+(k+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+w;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}a=b[q+(s<<1)>>1]|0;n=a<<16>>16;k=b[q+(t<<1)>>1]|0;o=k<<16>>16;m=k<<16>>16>0;if(a<<16>>16<=0){if(m){b[q>>1]=k;k=o*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+r;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+w;m=j+1310736+(k+-3<<2)|0;if((c[m>>2]|0)<(r|0))c[m>>2]=r;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}k=b[q+-2>>1]|0;if(k<<16>>16>0){b[q>>1]=k;k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=j+1310736+(k+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+w;k=j+1310736+(k+-3<<2)|0;if((c[k>>2]|0)>=(r|0)){k=p;break}c[k>>2]=r;k=p;break}else{k=p+1|0;if((p|0)>32767)break b;b[q>>1]=k;c[j+1179664+(p<<2)>>2]=k<<16>>16;p=p*7|0;c[j+1310736+(p<<2)>>2]=1;c[j+1310736+(p+1<<2)>>2]=r;c[j+1310736+(p+2<<2)>>2]=w;c[j+1310736+(p+3<<2)>>2]=r;c[j+1310736+(p+4<<2)>>2]=r;c[j+1310736+(p+5<<2)>>2]=w;c[j+1310736+(p+6<<2)>>2]=w;break}}if(m){k=c[j+1179664+(n+-1<<2)>>2]|0;n=c[j+1179664+(o+-1<<2)>>2]|0;if((k|0)>(n|0)){b[q>>1]=n;if((p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(k|0))c[a>>2]=n;m=m+1|0;if((m|0)>=(p|0)){k=n;break}else a=a+4|0}}else k=n}else{b[q>>1]=k;if((k|0)<(n|0)&(p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(n|0))c[a>>2]=k;m=m+1|0;if((m|0)>=(p|0))break;else a=a+4|0}}}k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=j+1310736+(k+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+w;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}m=b[q+-2>>1]|0;if(m<<16>>16<=0){b[q>>1]=a;k=n*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+r;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+w;m=j+1310736+(k+-4<<2)|0;if((c[m>>2]|0)>(r|0))c[m>>2]=r;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}k=c[j+1179664+(n+-1<<2)>>2]|0;n=c[j+1179664+((m<<16>>16)+-1<<2)>>2]|0;if((k|0)>(n|0)){b[q>>1]=n;if((p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(k|0))c[a>>2]=n;m=m+1|0;if((m|0)>=(p|0)){k=n;break}else a=a+4|0}}else k=n}else{b[q>>1]=k;if((k|0)<(n|0)&(p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(n|0))c[a>>2]=k;m=m+1|0;if((m|0)>=(p|0))break;else a=a+4|0}}}k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;k=j+1310736+(k+-5<<2)|0;c[k>>2]=(c[k>>2]|0)+w;k=p}while(0);r=r+1|0;g=g+2|0;m=q+2|0;if((r|0)>=(x|0))break;else{q=m;p=k}}}w=w+1|0;if((w|0)>=(z|0)){o=k;B=52;break a}else{g=g+4|0;m=m+4|0}}Me(3,3904,A);k=-1}else{o=0;B=52}while(0);if((B|0)==52){a=j+12|0;if((o|0)<1)g=1;else{m=1;g=1;while(1){k=c[l>>2]|0;if((k|0)==(m|0)){k=g;g=g+1|0}else k=c[j+1179664+(k+-1<<2)>>2]|0;c[l>>2]=k;if((m|0)<(o|0)){m=m+1|0;l=l+4|0}else break}}n=j+8|0;k=g+-1|0;c[n>>2]=k;if(k){ek(a|0,0,k<<2|0)|0;ek(j+655376|0,0,k<<4|0)|0;if((g|0)>1){k=0;do{B=k<<2;c[j+131084+(B<<2)>>2]=e;c[j+131084+((B|1)<<2)>>2]=0;c[j+131084+((B|2)<<2)>>2]=f;c[j+131084+((B|3)<<2)>>2]=0;k=k+1|0}while((k|0)<(c[n>>2]|0))}if((o|0)>0){a=0;do{l=(c[j+1179664+(a<<2)>>2]|0)+-1|0;m=a*7|0;k=j+12+(l<<2)|0;c[k>>2]=(c[k>>2]|0)+(c[j+1310736+(m<<2)>>2]|0);k=l<<1;g=j+655376+(k<<3)|0;h[g>>3]=+h[g>>3]+ +(c[j+1310736+(m+1<<2)>>2]|0);k=j+655376+((k|1)<<3)|0;h[k>>3]=+h[k>>3]+ +(c[j+1310736+(m+2<<2)>>2]|0);l=l<<2;k=j+131084+(l<<2)|0;g=c[j+1310736+(m+3<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;k=j+131084+((l|1)<<2)|0;g=c[j+1310736+(m+4<<2)>>2]|0;if((c[k>>2]|0)<(g|0))c[k>>2]=g;k=j+131084+((l|2)<<2)|0;g=c[j+1310736+(m+5<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;g=j+131084+((l|3)<<2)|0;k=c[j+1310736+(m+6<<2)>>2]|0;if((c[g>>2]|0)<(k|0))c[g>>2]=k;a=a+1|0}while((a|0)<(o|0))}if((c[n>>2]|0)>0){k=0;do{e=j+12+(k<<2)|0;f=k<<1;B=j+655376+(f<<3)|0;h[B>>3]=+h[B>>3]/+(c[e>>2]|0);f=j+655376+((f|1)<<3)|0;h[f>>3]=+h[f>>3]/+(c[e>>2]|0);k=k+1|0}while((k|0)<(c[n>>2]|0));k=0}else k=0}else k=0}i=C;return k|0}function yc(a,e,f,g,j){a=a|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;C=i;i=i+16|0;A=C;n=c[j>>2]|0;z=f+-1|0;if((e|0)>0){k=0;l=n;m=n+(($(z,e)|0)<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(e|0))break;else{l=l+2|0;m=m+2|0}}}y=g*3|0;x=e+-1|0;if((f|0)>0){k=0;g=n;l=n+(x<<1)|0;while(1){b[l>>1]=0;b[g>>1]=0;k=k+1|0;if((k|0)>=(f|0))break;else{g=g+(e<<1)|0;l=l+(e<<1)|0}}}l=j+1179664|0;k=e+1|0;u=0-e|0;s=1-e|0;t=~e;a:do if((z|0)>1){v=(x|0)>1;w=1;g=a+(k<<2)|0;m=n+(k<<1)|0;k=0;b:while(1){if(v){r=1;q=m;p=k;while(1){do if(((d[g+1>>0]|0)+(d[g>>0]|0)+(d[g+2>>0]|0)|0)>(y|0)){b[q>>1]=0;k=p}else{k=b[q+(u<<1)>>1]|0;if(k<<16>>16>0){b[q>>1]=k;k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=j+1310736+(k+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+w;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}a=b[q+(s<<1)>>1]|0;n=a<<16>>16;k=b[q+(t<<1)>>1]|0;o=k<<16>>16;m=k<<16>>16>0;if(a<<16>>16<=0){if(m){b[q>>1]=k;k=o*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+r;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+w;m=j+1310736+(k+-3<<2)|0;if((c[m>>2]|0)<(r|0))c[m>>2]=r;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}k=b[q+-2>>1]|0;if(k<<16>>16>0){b[q>>1]=k;k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=j+1310736+(k+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+w;k=j+1310736+(k+-3<<2)|0;if((c[k>>2]|0)>=(r|0)){k=p;break}c[k>>2]=r;k=p;break}else{k=p+1|0;if((p|0)>32767)break b;b[q>>1]=k;c[j+1179664+(p<<2)>>2]=k<<16>>16;p=p*7|0;c[j+1310736+(p<<2)>>2]=1;c[j+1310736+(p+1<<2)>>2]=r;c[j+1310736+(p+2<<2)>>2]=w;c[j+1310736+(p+3<<2)>>2]=r;c[j+1310736+(p+4<<2)>>2]=r;c[j+1310736+(p+5<<2)>>2]=w;c[j+1310736+(p+6<<2)>>2]=w;break}}if(m){k=c[j+1179664+(n+-1<<2)>>2]|0;n=c[j+1179664+(o+-1<<2)>>2]|0;if((k|0)>(n|0)){b[q>>1]=n;if((p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(k|0))c[a>>2]=n;m=m+1|0;if((m|0)>=(p|0)){k=n;break}else a=a+4|0}}else k=n}else{b[q>>1]=k;if((k|0)<(n|0)&(p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(n|0))c[a>>2]=k;m=m+1|0;if((m|0)>=(p|0))break;else a=a+4|0}}}k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=j+1310736+(k+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+w;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}m=b[q+-2>>1]|0;if(m<<16>>16<=0){b[q>>1]=a;k=n*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+r;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+w;m=j+1310736+(k+-4<<2)|0;if((c[m>>2]|0)>(r|0))c[m>>2]=r;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}k=c[j+1179664+(n+-1<<2)>>2]|0;n=c[j+1179664+((m<<16>>16)+-1<<2)>>2]|0;if((k|0)>(n|0)){b[q>>1]=n;if((p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(k|0))c[a>>2]=n;m=m+1|0;if((m|0)>=(p|0)){k=n;break}else a=a+4|0}}else k=n}else{b[q>>1]=k;if((k|0)<(n|0)&(p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(n|0))c[a>>2]=k;m=m+1|0;if((m|0)>=(p|0))break;else a=a+4|0}}}k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;k=j+1310736+(k+-5<<2)|0;c[k>>2]=(c[k>>2]|0)+w;k=p}while(0);r=r+1|0;g=g+4|0;m=q+2|0;if((r|0)>=(x|0))break;else{q=m;p=k}}}w=w+1|0;if((w|0)>=(z|0)){o=k;B=52;break a}else{g=g+8|0;m=m+4|0}}Me(3,3904,A);k=-1}else{o=0;B=52}while(0);if((B|0)==52){a=j+12|0;if((o|0)<1)g=1;else{m=1;g=1;while(1){k=c[l>>2]|0;if((k|0)==(m|0)){k=g;g=g+1|0}else k=c[j+1179664+(k+-1<<2)>>2]|0;c[l>>2]=k;if((m|0)<(o|0)){m=m+1|0;l=l+4|0}else break}}n=j+8|0;k=g+-1|0;c[n>>2]=k;if(k){ek(a|0,0,k<<2|0)|0;ek(j+655376|0,0,k<<4|0)|0;if((g|0)>1){k=0;do{B=k<<2;c[j+131084+(B<<2)>>2]=e;c[j+131084+((B|1)<<2)>>2]=0;c[j+131084+((B|2)<<2)>>2]=f;c[j+131084+((B|3)<<2)>>2]=0;k=k+1|0}while((k|0)<(c[n>>2]|0))}if((o|0)>0){a=0;do{l=(c[j+1179664+(a<<2)>>2]|0)+-1|0;m=a*7|0;k=j+12+(l<<2)|0;c[k>>2]=(c[k>>2]|0)+(c[j+1310736+(m<<2)>>2]|0);k=l<<1;g=j+655376+(k<<3)|0;h[g>>3]=+h[g>>3]+ +(c[j+1310736+(m+1<<2)>>2]|0);k=j+655376+((k|1)<<3)|0;h[k>>3]=+h[k>>3]+ +(c[j+1310736+(m+2<<2)>>2]|0);l=l<<2;k=j+131084+(l<<2)|0;g=c[j+1310736+(m+3<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;k=j+131084+((l|1)<<2)|0;g=c[j+1310736+(m+4<<2)>>2]|0;if((c[k>>2]|0)<(g|0))c[k>>2]=g;k=j+131084+((l|2)<<2)|0;g=c[j+1310736+(m+5<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;g=j+131084+((l|3)<<2)|0;k=c[j+1310736+(m+6<<2)>>2]|0;if((c[g>>2]|0)<(k|0))c[g>>2]=k;a=a+1|0}while((a|0)<(o|0))}if((c[n>>2]|0)>0){k=0;do{e=j+12+(k<<2)|0;f=k<<1;B=j+655376+(f<<3)|0;h[B>>3]=+h[B>>3]/+(c[e>>2]|0);f=j+655376+((f|1)<<3)|0;h[f>>3]=+h[f>>3]/+(c[e>>2]|0);k=k+1|0}while((k|0)<(c[n>>2]|0));k=0}else k=0}else k=0}i=C;return k|0}function zc(a,e,f,g,j){a=a|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;C=i;i=i+16|0;A=C;n=c[j>>2]|0;z=f+-1|0;if((e|0)>0){k=0;l=n;m=n+(($(z,e)|0)<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(e|0))break;else{l=l+2|0;m=m+2|0}}}y=g*3|0;x=e+-1|0;if((f|0)>0){k=0;g=n;l=n+(x<<1)|0;while(1){b[l>>1]=0;b[g>>1]=0;k=k+1|0;if((k|0)>=(f|0))break;else{g=g+(e<<1)|0;l=l+(e<<1)|0}}}l=j+1179664|0;k=e+1|0;u=0-e|0;s=1-e|0;t=~e;a:do if((z|0)>1){v=(x|0)>1;w=1;g=a+(k<<1)|0;m=n+(k<<1)|0;k=0;b:while(1){if(v){r=1;q=m;p=k;while(1){o=d[g>>0]|0;do if(((o&240)+24+(o<<4&240)+((d[g+1>>0]|0)&240)|0)>(y|0)){b[q>>1]=0;k=p}else{k=b[q+(u<<1)>>1]|0;if(k<<16>>16>0){b[q>>1]=k;k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=j+1310736+(k+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+w;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}a=b[q+(s<<1)>>1]|0;n=a<<16>>16;k=b[q+(t<<1)>>1]|0;o=k<<16>>16;m=k<<16>>16>0;if(a<<16>>16<=0){if(m){b[q>>1]=k;k=o*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+r;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+w;m=j+1310736+(k+-3<<2)|0;if((c[m>>2]|0)<(r|0))c[m>>2]=r;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}k=b[q+-2>>1]|0;if(k<<16>>16>0){b[q>>1]=k;k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=j+1310736+(k+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+w;k=j+1310736+(k+-3<<2)|0;if((c[k>>2]|0)>=(r|0)){k=p;break}c[k>>2]=r;k=p;break}else{k=p+1|0;if((p|0)>32767)break b;b[q>>1]=k;c[j+1179664+(p<<2)>>2]=k<<16>>16;p=p*7|0;c[j+1310736+(p<<2)>>2]=1;c[j+1310736+(p+1<<2)>>2]=r;c[j+1310736+(p+2<<2)>>2]=w;c[j+1310736+(p+3<<2)>>2]=r;c[j+1310736+(p+4<<2)>>2]=r;c[j+1310736+(p+5<<2)>>2]=w;c[j+1310736+(p+6<<2)>>2]=w;break}}if(m){k=c[j+1179664+(n+-1<<2)>>2]|0;n=c[j+1179664+(o+-1<<2)>>2]|0;if((k|0)>(n|0)){b[q>>1]=n;if((p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(k|0))c[a>>2]=n;m=m+1|0;if((m|0)>=(p|0)){k=n;break}else a=a+4|0}}else k=n}else{b[q>>1]=k;if((k|0)<(n|0)&(p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(n|0))c[a>>2]=k;m=m+1|0;if((m|0)>=(p|0))break;else a=a+4|0}}}k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=j+1310736+(k+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+w;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}m=b[q+-2>>1]|0;if(m<<16>>16<=0){b[q>>1]=a;k=n*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+r;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+w;m=j+1310736+(k+-4<<2)|0;if((c[m>>2]|0)>(r|0))c[m>>2]=r;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}k=c[j+1179664+(n+-1<<2)>>2]|0;n=c[j+1179664+((m<<16>>16)+-1<<2)>>2]|0;if((k|0)>(n|0)){b[q>>1]=n;if((p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(k|0))c[a>>2]=n;m=m+1|0;if((m|0)>=(p|0)){k=n;break}else a=a+4|0}}else k=n}else{b[q>>1]=k;if((k|0)<(n|0)&(p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(n|0))c[a>>2]=k;m=m+1|0;if((m|0)>=(p|0))break;else a=a+4|0}}}k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;k=j+1310736+(k+-5<<2)|0;c[k>>2]=(c[k>>2]|0)+w;k=p}while(0);r=r+1|0;g=g+2|0;m=q+2|0;if((r|0)>=(x|0))break;else{q=m;p=k}}}w=w+1|0;if((w|0)>=(z|0)){o=k;B=52;break a}else{g=g+4|0;m=m+4|0}}Me(3,3904,A);k=-1}else{o=0;B=52}while(0);if((B|0)==52){a=j+12|0;if((o|0)<1)g=1;else{m=1;g=1;while(1){k=c[l>>2]|0;if((k|0)==(m|0)){k=g;g=g+1|0}else k=c[j+1179664+(k+-1<<2)>>2]|0;c[l>>2]=k;if((m|0)<(o|0)){m=m+1|0;l=l+4|0}else break}}n=j+8|0;k=g+-1|0;c[n>>2]=k;if(k){ek(a|0,0,k<<2|0)|0;ek(j+655376|0,0,k<<4|0)|0;if((g|0)>1){k=0;do{B=k<<2;c[j+131084+(B<<2)>>2]=e;c[j+131084+((B|1)<<2)>>2]=0;c[j+131084+((B|2)<<2)>>2]=f;c[j+131084+((B|3)<<2)>>2]=0;k=k+1|0}while((k|0)<(c[n>>2]|0))}if((o|0)>0){a=0;do{l=(c[j+1179664+(a<<2)>>2]|0)+-1|0;m=a*7|0;k=j+12+(l<<2)|0;c[k>>2]=(c[k>>2]|0)+(c[j+1310736+(m<<2)>>2]|0);k=l<<1;g=j+655376+(k<<3)|0;h[g>>3]=+h[g>>3]+ +(c[j+1310736+(m+1<<2)>>2]|0);k=j+655376+((k|1)<<3)|0;h[k>>3]=+h[k>>3]+ +(c[j+1310736+(m+2<<2)>>2]|0);l=l<<2;k=j+131084+(l<<2)|0;g=c[j+1310736+(m+3<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;k=j+131084+((l|1)<<2)|0;g=c[j+1310736+(m+4<<2)>>2]|0;if((c[k>>2]|0)<(g|0))c[k>>2]=g;k=j+131084+((l|2)<<2)|0;g=c[j+1310736+(m+5<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;g=j+131084+((l|3)<<2)|0;k=c[j+1310736+(m+6<<2)>>2]|0;if((c[g>>2]|0)<(k|0))c[g>>2]=k;a=a+1|0}while((a|0)<(o|0))}if((c[n>>2]|0)>0){k=0;do{e=j+12+(k<<2)|0;f=k<<1;B=j+655376+(f<<3)|0;h[B>>3]=+h[B>>3]/+(c[e>>2]|0);f=j+655376+((f|1)<<3)|0;h[f>>3]=+h[f>>3]/+(c[e>>2]|0);k=k+1|0}while((k|0)<(c[n>>2]|0));k=0}else k=0}else k=0}i=C;return k|0}function Ac(a,e,f,g,j){a=a|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;C=i;i=i+16|0;A=C;n=c[j>>2]|0;z=f+-1|0;if((e|0)>0){k=0;l=n;m=n+(($(z,e)|0)<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(e|0))break;else{l=l+2|0;m=m+2|0}}}y=g*3|0;x=e+-1|0;if((f|0)>0){k=0;g=n;l=n+(x<<1)|0;while(1){b[l>>1]=0;b[g>>1]=0;k=k+1|0;if((k|0)>=(f|0))break;else{g=g+(e<<1)|0;l=l+(e<<1)|0}}}l=j+1179664|0;k=e+1|0;u=0-e|0;s=1-e|0;t=~e;a:do if((z|0)>1){v=(x|0)>1;w=1;g=a+(k<<1)|0;m=n+(k<<1)|0;k=0;b:while(1){if(v){r=1;q=m;p=k;while(1){n=d[g>>0]|0;o=d[g+1>>0]|0;do if(((n&248)+12+(n<<5&224)+(o>>>3&24)+(o<<2&248)|0)>(y|0)){b[q>>1]=0;k=p}else{k=b[q+(u<<1)>>1]|0;if(k<<16>>16>0){b[q>>1]=k;k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=j+1310736+(k+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+w;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}a=b[q+(s<<1)>>1]|0;n=a<<16>>16;k=b[q+(t<<1)>>1]|0;o=k<<16>>16;m=k<<16>>16>0;if(a<<16>>16<=0){if(m){b[q>>1]=k;k=o*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+r;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+w;m=j+1310736+(k+-3<<2)|0;if((c[m>>2]|0)<(r|0))c[m>>2]=r;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}k=b[q+-2>>1]|0;if(k<<16>>16>0){b[q>>1]=k;k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=j+1310736+(k+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+w;k=j+1310736+(k+-3<<2)|0;if((c[k>>2]|0)>=(r|0)){k=p;break}c[k>>2]=r;k=p;break}else{k=p+1|0;if((p|0)>32767)break b;b[q>>1]=k;c[j+1179664+(p<<2)>>2]=k<<16>>16;p=p*7|0;c[j+1310736+(p<<2)>>2]=1;c[j+1310736+(p+1<<2)>>2]=r;c[j+1310736+(p+2<<2)>>2]=w;c[j+1310736+(p+3<<2)>>2]=r;c[j+1310736+(p+4<<2)>>2]=r;c[j+1310736+(p+5<<2)>>2]=w;c[j+1310736+(p+6<<2)>>2]=w;break}}if(m){k=c[j+1179664+(n+-1<<2)>>2]|0;n=c[j+1179664+(o+-1<<2)>>2]|0;if((k|0)>(n|0)){b[q>>1]=n;if((p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(k|0))c[a>>2]=n;m=m+1|0;if((m|0)>=(p|0)){k=n;break}else a=a+4|0}}else k=n}else{b[q>>1]=k;if((k|0)<(n|0)&(p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(n|0))c[a>>2]=k;m=m+1|0;if((m|0)>=(p|0))break;else a=a+4|0}}}k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=j+1310736+(k+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+w;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}m=b[q+-2>>1]|0;if(m<<16>>16<=0){b[q>>1]=a;k=n*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+r;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+w;m=j+1310736+(k+-4<<2)|0;if((c[m>>2]|0)>(r|0))c[m>>2]=r;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}k=c[j+1179664+(n+-1<<2)>>2]|0;n=c[j+1179664+((m<<16>>16)+-1<<2)>>2]|0;if((k|0)>(n|0)){b[q>>1]=n;if((p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(k|0))c[a>>2]=n;m=m+1|0;if((m|0)>=(p|0)){k=n;break}else a=a+4|0}}else k=n}else{b[q>>1]=k;if((k|0)<(n|0)&(p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(n|0))c[a>>2]=k;m=m+1|0;if((m|0)>=(p|0))break;else a=a+4|0}}}k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;k=j+1310736+(k+-5<<2)|0;c[k>>2]=(c[k>>2]|0)+w;k=p}while(0);r=r+1|0;g=g+2|0;m=q+2|0;if((r|0)>=(x|0))break;else{q=m;p=k}}}w=w+1|0;if((w|0)>=(z|0)){o=k;B=52;break a}else{g=g+4|0;m=m+4|0}}Me(3,3904,A);k=-1}else{o=0;B=52}while(0);if((B|0)==52){a=j+12|0;if((o|0)<1)g=1;else{m=1;g=1;while(1){k=c[l>>2]|0;if((k|0)==(m|0)){k=g;g=g+1|0}else k=c[j+1179664+(k+-1<<2)>>2]|0;c[l>>2]=k;if((m|0)<(o|0)){m=m+1|0;l=l+4|0}else break}}n=j+8|0;k=g+-1|0;c[n>>2]=k;if(k){ek(a|0,0,k<<2|0)|0;ek(j+655376|0,0,k<<4|0)|0;if((g|0)>1){k=0;do{B=k<<2;c[j+131084+(B<<2)>>2]=e;c[j+131084+((B|1)<<2)>>2]=0;c[j+131084+((B|2)<<2)>>2]=f;c[j+131084+((B|3)<<2)>>2]=0;k=k+1|0}while((k|0)<(c[n>>2]|0))}if((o|0)>0){a=0;do{l=(c[j+1179664+(a<<2)>>2]|0)+-1|0;m=a*7|0;k=j+12+(l<<2)|0;c[k>>2]=(c[k>>2]|0)+(c[j+1310736+(m<<2)>>2]|0);k=l<<1;g=j+655376+(k<<3)|0;h[g>>3]=+h[g>>3]+ +(c[j+1310736+(m+1<<2)>>2]|0);k=j+655376+((k|1)<<3)|0;h[k>>3]=+h[k>>3]+ +(c[j+1310736+(m+2<<2)>>2]|0);l=l<<2;k=j+131084+(l<<2)|0;g=c[j+1310736+(m+3<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;k=j+131084+((l|1)<<2)|0;g=c[j+1310736+(m+4<<2)>>2]|0;if((c[k>>2]|0)<(g|0))c[k>>2]=g;k=j+131084+((l|2)<<2)|0;g=c[j+1310736+(m+5<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;g=j+131084+((l|3)<<2)|0;k=c[j+1310736+(m+6<<2)>>2]|0;if((c[g>>2]|0)<(k|0))c[g>>2]=k;a=a+1|0}while((a|0)<(o|0))}if((c[n>>2]|0)>0){k=0;do{e=j+12+(k<<2)|0;f=k<<1;B=j+655376+(f<<3)|0;h[B>>3]=+h[B>>3]/+(c[e>>2]|0);f=j+655376+((f|1)<<3)|0;h[f>>3]=+h[f>>3]/+(c[e>>2]|0);k=k+1|0}while((k|0)<(c[n>>2]|0));k=0}else k=0}else k=0}i=C;return k|0}function Bc(a,e,f,g,j){a=a|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;C=i;i=i+16|0;A=C;n=c[j>>2]|0;z=f+-1|0;if((e|0)>0){k=0;l=n;m=n+(($(z,e)|0)<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(e|0))break;else{l=l+2|0;m=m+2|0}}}y=g*3|0;x=e+-1|0;if((f|0)>0){k=0;g=n;l=n+(x<<1)|0;while(1){b[l>>1]=0;b[g>>1]=0;k=k+1|0;if((k|0)>=(f|0))break;else{g=g+(e<<1)|0;l=l+(e<<1)|0}}}l=j+1179664|0;k=e+1|0;u=0-e|0;s=1-e|0;t=~e;a:do if((z|0)>1){v=(x|0)>1;w=1;g=a+(k<<2)|0;m=n+(k<<1)|0;k=0;b:while(1){if(v){r=1;q=m;p=k;while(1){do if(((d[g+2>>0]|0)+(d[g+1>>0]|0)+(d[g+3>>0]|0)|0)>(y|0)){b[q>>1]=0;k=p}else{k=b[q+(u<<1)>>1]|0;if(k<<16>>16>0){b[q>>1]=k;k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=j+1310736+(k+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+w;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}a=b[q+(s<<1)>>1]|0;n=a<<16>>16;k=b[q+(t<<1)>>1]|0;o=k<<16>>16;m=k<<16>>16>0;if(a<<16>>16<=0){if(m){b[q>>1]=k;k=o*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+r;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+w;m=j+1310736+(k+-3<<2)|0;if((c[m>>2]|0)<(r|0))c[m>>2]=r;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}k=b[q+-2>>1]|0;if(k<<16>>16>0){b[q>>1]=k;k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=j+1310736+(k+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+w;k=j+1310736+(k+-3<<2)|0;if((c[k>>2]|0)>=(r|0)){k=p;break}c[k>>2]=r;k=p;break}else{k=p+1|0;if((p|0)>32767)break b;b[q>>1]=k;c[j+1179664+(p<<2)>>2]=k<<16>>16;p=p*7|0;c[j+1310736+(p<<2)>>2]=1;c[j+1310736+(p+1<<2)>>2]=r;c[j+1310736+(p+2<<2)>>2]=w;c[j+1310736+(p+3<<2)>>2]=r;c[j+1310736+(p+4<<2)>>2]=r;c[j+1310736+(p+5<<2)>>2]=w;c[j+1310736+(p+6<<2)>>2]=w;break}}if(m){k=c[j+1179664+(n+-1<<2)>>2]|0;n=c[j+1179664+(o+-1<<2)>>2]|0;if((k|0)>(n|0)){b[q>>1]=n;if((p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(k|0))c[a>>2]=n;m=m+1|0;if((m|0)>=(p|0)){k=n;break}else a=a+4|0}}else k=n}else{b[q>>1]=k;if((k|0)<(n|0)&(p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(n|0))c[a>>2]=k;m=m+1|0;if((m|0)>=(p|0))break;else a=a+4|0}}}k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=j+1310736+(k+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+w;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}m=b[q+-2>>1]|0;if(m<<16>>16<=0){b[q>>1]=a;k=n*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+r;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+w;m=j+1310736+(k+-4<<2)|0;if((c[m>>2]|0)>(r|0))c[m>>2]=r;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}k=c[j+1179664+(n+-1<<2)>>2]|0;n=c[j+1179664+((m<<16>>16)+-1<<2)>>2]|0;if((k|0)>(n|0)){b[q>>1]=n;if((p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(k|0))c[a>>2]=n;m=m+1|0;if((m|0)>=(p|0)){k=n;break}else a=a+4|0}}else k=n}else{b[q>>1]=k;if((k|0)<(n|0)&(p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(n|0))c[a>>2]=k;m=m+1|0;if((m|0)>=(p|0))break;else a=a+4|0}}}k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;k=j+1310736+(k+-5<<2)|0;c[k>>2]=(c[k>>2]|0)+w;k=p}while(0);r=r+1|0;g=g+4|0;m=q+2|0;if((r|0)>=(x|0))break;else{q=m;p=k}}}w=w+1|0;if((w|0)>=(z|0)){o=k;B=52;break a}else{g=g+8|0;m=m+4|0}}Me(3,3904,A);k=-1}else{o=0;B=52}while(0);if((B|0)==52){a=j+12|0;if((o|0)<1)g=1;else{m=1;g=1;while(1){k=c[l>>2]|0;if((k|0)==(m|0)){k=g;g=g+1|0}else k=c[j+1179664+(k+-1<<2)>>2]|0;c[l>>2]=k;if((m|0)<(o|0)){m=m+1|0;l=l+4|0}else break}}n=j+8|0;k=g+-1|0;c[n>>2]=k;if(k){ek(a|0,0,k<<2|0)|0;ek(j+655376|0,0,k<<4|0)|0;if((g|0)>1){k=0;do{B=k<<2;c[j+131084+(B<<2)>>2]=e;c[j+131084+((B|1)<<2)>>2]=0;c[j+131084+((B|2)<<2)>>2]=f;c[j+131084+((B|3)<<2)>>2]=0;k=k+1|0}while((k|0)<(c[n>>2]|0))}if((o|0)>0){a=0;do{l=(c[j+1179664+(a<<2)>>2]|0)+-1|0;m=a*7|0;k=j+12+(l<<2)|0;c[k>>2]=(c[k>>2]|0)+(c[j+1310736+(m<<2)>>2]|0);k=l<<1;g=j+655376+(k<<3)|0;h[g>>3]=+h[g>>3]+ +(c[j+1310736+(m+1<<2)>>2]|0);k=j+655376+((k|1)<<3)|0;h[k>>3]=+h[k>>3]+ +(c[j+1310736+(m+2<<2)>>2]|0);l=l<<2;k=j+131084+(l<<2)|0;g=c[j+1310736+(m+3<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;k=j+131084+((l|1)<<2)|0;g=c[j+1310736+(m+4<<2)>>2]|0;if((c[k>>2]|0)<(g|0))c[k>>2]=g;k=j+131084+((l|2)<<2)|0;g=c[j+1310736+(m+5<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;g=j+131084+((l|3)<<2)|0;k=c[j+1310736+(m+6<<2)>>2]|0;if((c[g>>2]|0)<(k|0))c[g>>2]=k;a=a+1|0}while((a|0)<(o|0))}if((c[n>>2]|0)>0){k=0;do{e=j+12+(k<<2)|0;f=k<<1;B=j+655376+(f<<3)|0;h[B>>3]=+h[B>>3]/+(c[e>>2]|0);f=j+655376+((f|1)<<3)|0;h[f>>3]=+h[f>>3]/+(c[e>>2]|0);k=k+1|0}while((k|0)<(c[n>>2]|0));k=0}else k=0}else k=0}i=C;return k|0}function Cc(a,e,f,g,j){a=a|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;C=i;i=i+16|0;A=C;n=c[j>>2]|0;z=f+-1|0;if((e|0)>0){k=0;l=n;m=n+(($(z,e)|0)<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(e|0))break;else{l=l+2|0;m=m+2|0}}}y=e+-1|0;if((f|0)>0){k=0;l=n;m=n+(y<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(f|0))break;else{l=l+(e<<1)|0;m=m+(e<<1)|0}}}m=j+1179664|0;k=e+1|0;v=0-e|0;t=1-e|0;u=~e;a:do if((z|0)>1){w=(y|0)>1;x=1;l=a+k|0;a=n+(k<<1)|0;k=0;b:while(1){if(w){s=1;r=a;q=k;while(1){do if((d[l>>0]|0|0)>(g|0)){b[r>>1]=0;k=q}else{k=b[r+(v<<1)>>1]|0;if(k<<16>>16>0){b[r>>1]=k;k=(k<<16>>16)*7|0;p=j+1310736+(k+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=j+1310736+(k+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=j+1310736+(k+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+x;c[j+1310736+(k+-1<<2)>>2]=x;k=q;break}n=b[r+(t<<1)>>1]|0;o=n<<16>>16;k=b[r+(u<<1)>>1]|0;p=k<<16>>16;a=k<<16>>16>0;if(n<<16>>16<=0){if(a){b[r>>1]=k;k=p*7|0;a=j+1310736+(k+-7<<2)|0;c[a>>2]=(c[a>>2]|0)+1;a=j+1310736+(k+-6<<2)|0;c[a>>2]=(c[a>>2]|0)+s;a=j+1310736+(k+-5<<2)|0;c[a>>2]=(c[a>>2]|0)+x;a=j+1310736+(k+-3<<2)|0;if((c[a>>2]|0)<(s|0))c[a>>2]=s;c[j+1310736+(k+-1<<2)>>2]=x;k=q;break}k=b[r+-2>>1]|0;if(k<<16>>16>0){b[r>>1]=k;k=(k<<16>>16)*7|0;p=j+1310736+(k+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=j+1310736+(k+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=j+1310736+(k+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+x;k=j+1310736+(k+-3<<2)|0;if((c[k>>2]|0)>=(s|0)){k=q;break}c[k>>2]=s;k=q;break}else{k=q+1|0;if((q|0)>32767)break b;b[r>>1]=k;c[j+1179664+(q<<2)>>2]=k<<16>>16;q=q*7|0;c[j+1310736+(q<<2)>>2]=1;c[j+1310736+(q+1<<2)>>2]=s;c[j+1310736+(q+2<<2)>>2]=x;c[j+1310736+(q+3<<2)>>2]=s;c[j+1310736+(q+4<<2)>>2]=s;c[j+1310736+(q+5<<2)>>2]=x;c[j+1310736+(q+6<<2)>>2]=x;break}}if(a){k=c[j+1179664+(o+-1<<2)>>2]|0;o=c[j+1179664+(p+-1<<2)>>2]|0;if((k|0)>(o|0)){b[r>>1]=o;if((q|0)>0){a=0;n=m;while(1){if((c[n>>2]|0)==(k|0))c[n>>2]=o;a=a+1|0;if((a|0)>=(q|0)){k=o;break}else n=n+4|0}}else k=o}else{b[r>>1]=k;if((k|0)<(o|0)&(q|0)>0){a=0;n=m;while(1){if((c[n>>2]|0)==(o|0))c[n>>2]=k;a=a+1|0;if((a|0)>=(q|0))break;else n=n+4|0}}}k=(k<<16>>16)*7|0;p=j+1310736+(k+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=j+1310736+(k+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=j+1310736+(k+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+x;c[j+1310736+(k+-1<<2)>>2]=x;k=q;break}k=b[r+-2>>1]|0;if(k<<16>>16<=0){b[r>>1]=n;k=o*7|0;a=j+1310736+(k+-7<<2)|0;c[a>>2]=(c[a>>2]|0)+1;a=j+1310736+(k+-6<<2)|0;c[a>>2]=(c[a>>2]|0)+s;a=j+1310736+(k+-5<<2)|0;c[a>>2]=(c[a>>2]|0)+x;a=j+1310736+(k+-4<<2)|0;if((c[a>>2]|0)>(s|0))c[a>>2]=s;c[j+1310736+(k+-1<<2)>>2]=x;k=q;break}o=c[j+1179664+(o+-1<<2)>>2]|0;k=c[j+1179664+((k<<16>>16)+-1<<2)>>2]|0;if((o|0)>(k|0)){b[r>>1]=k;if((q|0)>0){a=0;n=m;while(1){if((c[n>>2]|0)==(o|0))c[n>>2]=k;a=a+1|0;if((a|0)>=(q|0))break;else n=n+4|0}}}else{b[r>>1]=o;if((o|0)<(k|0)&(q|0)>0){a=0;n=m;while(1){if((c[n>>2]|0)==(k|0))c[n>>2]=o;a=a+1|0;if((a|0)>=(q|0)){k=o;break}else n=n+4|0}}else k=o}k=(k<<16>>16)*7|0;p=j+1310736+(k+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=j+1310736+(k+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;k=j+1310736+(k+-5<<2)|0;c[k>>2]=(c[k>>2]|0)+x;k=q}while(0);s=s+1|0;l=l+1|0;a=r+2|0;if((s|0)>=(y|0))break;else{r=a;q=k}}}x=x+1|0;if((x|0)>=(z|0)){p=k;B=52;break a}else{l=l+2|0;a=a+4|0}}Me(3,3904,A);k=-1}else{p=0;B=52}while(0);if((B|0)==52){n=j+12|0;if((p|0)<1)l=1;else{a=1;l=1;while(1){k=c[m>>2]|0;if((k|0)==(a|0)){k=l;l=l+1|0}else k=c[j+1179664+(k+-1<<2)>>2]|0;c[m>>2]=k;if((a|0)<(p|0)){a=a+1|0;m=m+4|0}else break}}o=j+8|0;k=l+-1|0;c[o>>2]=k;if(k){ek(n|0,0,k<<2|0)|0;ek(j+655376|0,0,k<<4|0)|0;if((l|0)>1){k=0;do{B=k<<2;c[j+131084+(B<<2)>>2]=e;c[j+131084+((B|1)<<2)>>2]=0;c[j+131084+((B|2)<<2)>>2]=f;c[j+131084+((B|3)<<2)>>2]=0;k=k+1|0}while((k|0)<(c[o>>2]|0))}if((p|0)>0){n=0;do{m=(c[j+1179664+(n<<2)>>2]|0)+-1|0;a=n*7|0;k=j+12+(m<<2)|0;c[k>>2]=(c[k>>2]|0)+(c[j+1310736+(a<<2)>>2]|0);k=m<<1;l=j+655376+(k<<3)|0;h[l>>3]=+h[l>>3]+ +(c[j+1310736+(a+1<<2)>>2]|0);k=j+655376+((k|1)<<3)|0;h[k>>3]=+h[k>>3]+ +(c[j+1310736+(a+2<<2)>>2]|0);m=m<<2;k=j+131084+(m<<2)|0;l=c[j+1310736+(a+3<<2)>>2]|0;if((c[k>>2]|0)>(l|0))c[k>>2]=l;k=j+131084+((m|1)<<2)|0;l=c[j+1310736+(a+4<<2)>>2]|0;if((c[k>>2]|0)<(l|0))c[k>>2]=l;k=j+131084+((m|2)<<2)|0;l=c[j+1310736+(a+5<<2)>>2]|0;if((c[k>>2]|0)>(l|0))c[k>>2]=l;l=j+131084+((m|3)<<2)|0;k=c[j+1310736+(a+6<<2)>>2]|0;if((c[l>>2]|0)<(k|0))c[l>>2]=k;n=n+1|0}while((n|0)<(p|0))}if((c[o>>2]|0)>0){k=0;do{e=j+12+(k<<2)|0;f=k<<1;B=j+655376+(f<<3)|0;h[B>>3]=+h[B>>3]/+(c[e>>2]|0);f=j+655376+((f|1)<<3)|0;h[f>>3]=+h[f>>3]/+(c[e>>2]|0);k=k+1|0}while((k|0)<(c[o>>2]|0));k=0}else k=0}else k=0}i=C;return k|0}function Dc(a,e,f,g,j){a=a|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;C=i;i=i+16|0;A=C;n=c[j>>2]|0;z=f+-1|0;if((e|0)>0){k=0;l=n;m=n+(($(z,e)|0)<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(e|0))break;else{l=l+2|0;m=m+2|0}}}y=e+-1|0;if((f|0)>0){k=0;l=n;m=n+(y<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(f|0))break;else{l=l+(e<<1)|0;m=m+(e<<1)|0}}}m=j+1179664|0;k=e+1|0;v=0-e|0;t=1-e|0;u=~e;a:do if((z|0)>1){w=(y|0)>1;x=1;l=a+(k<<1)|0;a=n+(k<<1)|0;k=0;b:while(1){if(w){s=1;r=a;q=k;while(1){do if((d[l+1>>0]|0|0)>(g|0)){b[r>>1]=0;k=q}else{k=b[r+(v<<1)>>1]|0;if(k<<16>>16>0){b[r>>1]=k;k=(k<<16>>16)*7|0;p=j+1310736+(k+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=j+1310736+(k+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=j+1310736+(k+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+x;c[j+1310736+(k+-1<<2)>>2]=x;k=q;break}n=b[r+(t<<1)>>1]|0;o=n<<16>>16;k=b[r+(u<<1)>>1]|0;p=k<<16>>16;a=k<<16>>16>0;if(n<<16>>16<=0){if(a){b[r>>1]=k;k=p*7|0;a=j+1310736+(k+-7<<2)|0;c[a>>2]=(c[a>>2]|0)+1;a=j+1310736+(k+-6<<2)|0;c[a>>2]=(c[a>>2]|0)+s;a=j+1310736+(k+-5<<2)|0;c[a>>2]=(c[a>>2]|0)+x;a=j+1310736+(k+-3<<2)|0;if((c[a>>2]|0)<(s|0))c[a>>2]=s;c[j+1310736+(k+-1<<2)>>2]=x;k=q;break}k=b[r+-2>>1]|0;if(k<<16>>16>0){b[r>>1]=k;k=(k<<16>>16)*7|0;p=j+1310736+(k+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=j+1310736+(k+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=j+1310736+(k+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+x;k=j+1310736+(k+-3<<2)|0;if((c[k>>2]|0)>=(s|0)){k=q;break}c[k>>2]=s;k=q;break}else{k=q+1|0;if((q|0)>32767)break b;b[r>>1]=k;c[j+1179664+(q<<2)>>2]=k<<16>>16;q=q*7|0;c[j+1310736+(q<<2)>>2]=1;c[j+1310736+(q+1<<2)>>2]=s;c[j+1310736+(q+2<<2)>>2]=x;c[j+1310736+(q+3<<2)>>2]=s;c[j+1310736+(q+4<<2)>>2]=s;c[j+1310736+(q+5<<2)>>2]=x;c[j+1310736+(q+6<<2)>>2]=x;break}}if(a){k=c[j+1179664+(o+-1<<2)>>2]|0;o=c[j+1179664+(p+-1<<2)>>2]|0;if((k|0)>(o|0)){b[r>>1]=o;if((q|0)>0){a=0;n=m;while(1){if((c[n>>2]|0)==(k|0))c[n>>2]=o;a=a+1|0;if((a|0)>=(q|0)){k=o;break}else n=n+4|0}}else k=o}else{b[r>>1]=k;if((k|0)<(o|0)&(q|0)>0){a=0;n=m;while(1){if((c[n>>2]|0)==(o|0))c[n>>2]=k;a=a+1|0;if((a|0)>=(q|0))break;else n=n+4|0}}}k=(k<<16>>16)*7|0;p=j+1310736+(k+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=j+1310736+(k+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=j+1310736+(k+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+x;c[j+1310736+(k+-1<<2)>>2]=x;k=q;break}a=b[r+-2>>1]|0;if(a<<16>>16<=0){b[r>>1]=n;k=o*7|0;a=j+1310736+(k+-7<<2)|0;c[a>>2]=(c[a>>2]|0)+1;a=j+1310736+(k+-6<<2)|0;c[a>>2]=(c[a>>2]|0)+s;a=j+1310736+(k+-5<<2)|0;c[a>>2]=(c[a>>2]|0)+x;a=j+1310736+(k+-4<<2)|0;if((c[a>>2]|0)>(s|0))c[a>>2]=s;c[j+1310736+(k+-1<<2)>>2]=x;k=q;break}k=c[j+1179664+(o+-1<<2)>>2]|0;o=c[j+1179664+((a<<16>>16)+-1<<2)>>2]|0;if((k|0)>(o|0)){b[r>>1]=o;if((q|0)>0){a=0;n=m;while(1){if((c[n>>2]|0)==(k|0))c[n>>2]=o;a=a+1|0;if((a|0)>=(q|0)){k=o;break}else n=n+4|0}}else k=o}else{b[r>>1]=k;if((k|0)<(o|0)&(q|0)>0){a=0;n=m;while(1){if((c[n>>2]|0)==(o|0))c[n>>2]=k;a=a+1|0;if((a|0)>=(q|0))break;else n=n+4|0}}}k=(k<<16>>16)*7|0;p=j+1310736+(k+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=j+1310736+(k+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;k=j+1310736+(k+-5<<2)|0;c[k>>2]=(c[k>>2]|0)+x;k=q}while(0);s=s+1|0;l=l+2|0;a=r+2|0;if((s|0)>=(y|0))break;else{r=a;q=k}}}x=x+1|0;if((x|0)>=(z|0)){p=k;B=52;break a}else{l=l+4|0;a=a+4|0}}Me(3,3904,A);k=-1}else{p=0;B=52}while(0);if((B|0)==52){n=j+12|0;if((p|0)<1)l=1;else{a=1;l=1;while(1){k=c[m>>2]|0;if((k|0)==(a|0)){k=l;l=l+1|0}else k=c[j+1179664+(k+-1<<2)>>2]|0;c[m>>2]=k;if((a|0)<(p|0)){a=a+1|0;m=m+4|0}else break}}o=j+8|0;k=l+-1|0;c[o>>2]=k;if(k){ek(n|0,0,k<<2|0)|0;ek(j+655376|0,0,k<<4|0)|0;if((l|0)>1){k=0;do{B=k<<2;c[j+131084+(B<<2)>>2]=e;c[j+131084+((B|1)<<2)>>2]=0;c[j+131084+((B|2)<<2)>>2]=f;c[j+131084+((B|3)<<2)>>2]=0;k=k+1|0}while((k|0)<(c[o>>2]|0))}if((p|0)>0){n=0;do{m=(c[j+1179664+(n<<2)>>2]|0)+-1|0;a=n*7|0;k=j+12+(m<<2)|0;c[k>>2]=(c[k>>2]|0)+(c[j+1310736+(a<<2)>>2]|0);k=m<<1;l=j+655376+(k<<3)|0;h[l>>3]=+h[l>>3]+ +(c[j+1310736+(a+1<<2)>>2]|0);k=j+655376+((k|1)<<3)|0;h[k>>3]=+h[k>>3]+ +(c[j+1310736+(a+2<<2)>>2]|0);m=m<<2;k=j+131084+(m<<2)|0;l=c[j+1310736+(a+3<<2)>>2]|0;if((c[k>>2]|0)>(l|0))c[k>>2]=l;k=j+131084+((m|1)<<2)|0;l=c[j+1310736+(a+4<<2)>>2]|0;if((c[k>>2]|0)<(l|0))c[k>>2]=l;k=j+131084+((m|2)<<2)|0;l=c[j+1310736+(a+5<<2)>>2]|0;if((c[k>>2]|0)>(l|0))c[k>>2]=l;l=j+131084+((m|3)<<2)|0;k=c[j+1310736+(a+6<<2)>>2]|0;if((c[l>>2]|0)<(k|0))c[l>>2]=k;n=n+1|0}while((n|0)<(p|0))}if((c[o>>2]|0)>0){k=0;do{e=j+12+(k<<2)|0;f=k<<1;B=j+655376+(f<<3)|0;h[B>>3]=+h[B>>3]/+(c[e>>2]|0);f=j+655376+((f|1)<<3)|0;h[f>>3]=+h[f>>3]/+(c[e>>2]|0);k=k+1|0}while((k|0)<(c[o>>2]|0));k=0}else k=0}else k=0}i=C;return k|0}function Ec(a,e,f,g,j){a=a|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;C=i;i=i+16|0;A=C;n=c[j>>2]|0;z=f+-1|0;if((e|0)>0){k=0;l=n;m=n+(($(z,e)|0)<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(e|0))break;else{l=l+2|0;m=m+2|0}}}y=e+-1|0;if((f|0)>0){k=0;l=n;m=n+(y<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(f|0))break;else{l=l+(e<<1)|0;m=m+(e<<1)|0}}}m=j+1179664|0;k=e+1|0;v=0-e|0;t=1-e|0;u=~e;a:do if((z|0)>1){w=(y|0)>1;x=1;l=a+(k<<1)|0;a=n+(k<<1)|0;k=0;b:while(1){if(w){s=1;r=a;q=k;while(1){do if((d[l>>0]|0|0)>(g|0)){b[r>>1]=0;k=q}else{k=b[r+(v<<1)>>1]|0;if(k<<16>>16>0){b[r>>1]=k;k=(k<<16>>16)*7|0;p=j+1310736+(k+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=j+1310736+(k+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=j+1310736+(k+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+x;c[j+1310736+(k+-1<<2)>>2]=x;k=q;break}n=b[r+(t<<1)>>1]|0;o=n<<16>>16;k=b[r+(u<<1)>>1]|0;p=k<<16>>16;a=k<<16>>16>0;if(n<<16>>16<=0){if(a){b[r>>1]=k;k=p*7|0;a=j+1310736+(k+-7<<2)|0;c[a>>2]=(c[a>>2]|0)+1;a=j+1310736+(k+-6<<2)|0;c[a>>2]=(c[a>>2]|0)+s;a=j+1310736+(k+-5<<2)|0;c[a>>2]=(c[a>>2]|0)+x;a=j+1310736+(k+-3<<2)|0;if((c[a>>2]|0)<(s|0))c[a>>2]=s;c[j+1310736+(k+-1<<2)>>2]=x;k=q;break}k=b[r+-2>>1]|0;if(k<<16>>16>0){b[r>>1]=k;k=(k<<16>>16)*7|0;p=j+1310736+(k+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=j+1310736+(k+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=j+1310736+(k+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+x;k=j+1310736+(k+-3<<2)|0;if((c[k>>2]|0)>=(s|0)){k=q;break}c[k>>2]=s;k=q;break}else{k=q+1|0;if((q|0)>32767)break b;b[r>>1]=k;c[j+1179664+(q<<2)>>2]=k<<16>>16;q=q*7|0;c[j+1310736+(q<<2)>>2]=1;c[j+1310736+(q+1<<2)>>2]=s;c[j+1310736+(q+2<<2)>>2]=x;c[j+1310736+(q+3<<2)>>2]=s;c[j+1310736+(q+4<<2)>>2]=s;c[j+1310736+(q+5<<2)>>2]=x;c[j+1310736+(q+6<<2)>>2]=x;break}}if(a){k=c[j+1179664+(o+-1<<2)>>2]|0;o=c[j+1179664+(p+-1<<2)>>2]|0;if((k|0)>(o|0)){b[r>>1]=o;if((q|0)>0){a=0;n=m;while(1){if((c[n>>2]|0)==(k|0))c[n>>2]=o;a=a+1|0;if((a|0)>=(q|0)){k=o;break}else n=n+4|0}}else k=o}else{b[r>>1]=k;if((k|0)<(o|0)&(q|0)>0){a=0;n=m;while(1){if((c[n>>2]|0)==(o|0))c[n>>2]=k;a=a+1|0;if((a|0)>=(q|0))break;else n=n+4|0}}}k=(k<<16>>16)*7|0;p=j+1310736+(k+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=j+1310736+(k+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=j+1310736+(k+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+x;c[j+1310736+(k+-1<<2)>>2]=x;k=q;break}k=b[r+-2>>1]|0;if(k<<16>>16<=0){b[r>>1]=n;k=o*7|0;a=j+1310736+(k+-7<<2)|0;c[a>>2]=(c[a>>2]|0)+1;a=j+1310736+(k+-6<<2)|0;c[a>>2]=(c[a>>2]|0)+s;a=j+1310736+(k+-5<<2)|0;c[a>>2]=(c[a>>2]|0)+x;a=j+1310736+(k+-4<<2)|0;if((c[a>>2]|0)>(s|0))c[a>>2]=s;c[j+1310736+(k+-1<<2)>>2]=x;k=q;break}o=c[j+1179664+(o+-1<<2)>>2]|0;k=c[j+1179664+((k<<16>>16)+-1<<2)>>2]|0;if((o|0)>(k|0)){b[r>>1]=k;if((q|0)>0){a=0;n=m;while(1){if((c[n>>2]|0)==(o|0))c[n>>2]=k;a=a+1|0;if((a|0)>=(q|0))break;else n=n+4|0}}}else{b[r>>1]=o;if((o|0)<(k|0)&(q|0)>0){a=0;n=m;while(1){if((c[n>>2]|0)==(k|0))c[n>>2]=o;a=a+1|0;if((a|0)>=(q|0)){k=o;break}else n=n+4|0}}else k=o}k=(k<<16>>16)*7|0;p=j+1310736+(k+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=j+1310736+(k+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;k=j+1310736+(k+-5<<2)|0;c[k>>2]=(c[k>>2]|0)+x;k=q}while(0);s=s+1|0;l=l+2|0;a=r+2|0;if((s|0)>=(y|0))break;else{r=a;q=k}}}x=x+1|0;if((x|0)>=(z|0)){p=k;B=52;break a}else{l=l+4|0;a=a+4|0}}Me(3,3904,A);k=-1}else{p=0;B=52}while(0);if((B|0)==52){n=j+12|0;if((p|0)<1)l=1;else{a=1;l=1;while(1){k=c[m>>2]|0;if((k|0)==(a|0)){k=l;l=l+1|0}else k=c[j+1179664+(k+-1<<2)>>2]|0;c[m>>2]=k;if((a|0)<(p|0)){a=a+1|0;m=m+4|0}else break}}o=j+8|0;k=l+-1|0;c[o>>2]=k;if(k){ek(n|0,0,k<<2|0)|0;ek(j+655376|0,0,k<<4|0)|0;if((l|0)>1){k=0;do{B=k<<2;c[j+131084+(B<<2)>>2]=e;c[j+131084+((B|1)<<2)>>2]=0;c[j+131084+((B|2)<<2)>>2]=f;c[j+131084+((B|3)<<2)>>2]=0;k=k+1|0}while((k|0)<(c[o>>2]|0))}if((p|0)>0){n=0;do{m=(c[j+1179664+(n<<2)>>2]|0)+-1|0;a=n*7|0;k=j+12+(m<<2)|0;c[k>>2]=(c[k>>2]|0)+(c[j+1310736+(a<<2)>>2]|0);k=m<<1;l=j+655376+(k<<3)|0;h[l>>3]=+h[l>>3]+ +(c[j+1310736+(a+1<<2)>>2]|0);k=j+655376+((k|1)<<3)|0;h[k>>3]=+h[k>>3]+ +(c[j+1310736+(a+2<<2)>>2]|0);m=m<<2;k=j+131084+(m<<2)|0;l=c[j+1310736+(a+3<<2)>>2]|0;if((c[k>>2]|0)>(l|0))c[k>>2]=l;k=j+131084+((m|1)<<2)|0;l=c[j+1310736+(a+4<<2)>>2]|0;if((c[k>>2]|0)<(l|0))c[k>>2]=l;k=j+131084+((m|2)<<2)|0;l=c[j+1310736+(a+5<<2)>>2]|0;if((c[k>>2]|0)>(l|0))c[k>>2]=l;l=j+131084+((m|3)<<2)|0;k=c[j+1310736+(a+6<<2)>>2]|0;if((c[l>>2]|0)<(k|0))c[l>>2]=k;n=n+1|0}while((n|0)<(p|0))}if((c[o>>2]|0)>0){k=0;do{e=j+12+(k<<2)|0;f=k<<1;B=j+655376+(f<<3)|0;h[B>>3]=+h[B>>3]/+(c[e>>2]|0);f=j+655376+((f|1)<<3)|0;h[f>>3]=+h[f>>3]/+(c[e>>2]|0);k=k+1|0}while((k|0)<(c[o>>2]|0));k=0}else k=0}else k=0}i=C;return k|0}function Fc(a,e,f,g,j){a=a|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;C=i;i=i+16|0;A=C;n=c[j>>2]|0;z=f+-1|0;if((e|0)>0){k=0;l=n;m=n+(($(z,e)|0)<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(e|0))break;else{l=l+2|0;m=m+2|0}}}y=e+-1|0;if((f|0)>0){k=0;l=n;m=n+(y<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(f|0))break;else{l=l+(e<<1)|0;m=m+(e<<1)|0}}}m=j+1179664|0;k=e+1|0;v=0-e|0;t=1-e|0;u=~e;a:do if((z|0)>1){w=(y|0)>1;x=1;l=a+k|0;a=n+(k<<1)|0;n=g+k|0;k=0;b:while(1){if(w){s=1;r=l;q=k;while(1){do if((d[r>>0]|0)>(d[n>>0]|0)){b[a>>1]=0;k=q}else{k=b[a+(v<<1)>>1]|0;if(k<<16>>16>0){b[a>>1]=k;k=(k<<16>>16)*7|0;p=j+1310736+(k+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=j+1310736+(k+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=j+1310736+(k+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+x;c[j+1310736+(k+-1<<2)>>2]=x;k=q;break}g=b[a+(t<<1)>>1]|0;o=g<<16>>16;k=b[a+(u<<1)>>1]|0;p=k<<16>>16;l=k<<16>>16>0;if(g<<16>>16<=0){if(l){b[a>>1]=k;k=p*7|0;l=j+1310736+(k+-7<<2)|0;c[l>>2]=(c[l>>2]|0)+1;l=j+1310736+(k+-6<<2)|0;c[l>>2]=(c[l>>2]|0)+s;l=j+1310736+(k+-5<<2)|0;c[l>>2]=(c[l>>2]|0)+x;l=j+1310736+(k+-3<<2)|0;if((c[l>>2]|0)<(s|0))c[l>>2]=s;c[j+1310736+(k+-1<<2)>>2]=x;k=q;break}k=b[a+-2>>1]|0;if(k<<16>>16>0){b[a>>1]=k;k=(k<<16>>16)*7|0;p=j+1310736+(k+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=j+1310736+(k+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=j+1310736+(k+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+x;k=j+1310736+(k+-3<<2)|0;if((c[k>>2]|0)>=(s|0)){k=q;break}c[k>>2]=s;k=q;break}else{k=q+1|0;if((q|0)>32767)break b;b[a>>1]=k;c[j+1179664+(q<<2)>>2]=k<<16>>16;q=q*7|0;c[j+1310736+(q<<2)>>2]=1;c[j+1310736+(q+1<<2)>>2]=s;c[j+1310736+(q+2<<2)>>2]=x;c[j+1310736+(q+3<<2)>>2]=s;c[j+1310736+(q+4<<2)>>2]=s;c[j+1310736+(q+5<<2)>>2]=x;c[j+1310736+(q+6<<2)>>2]=x;break}}if(l){k=c[j+1179664+(o+-1<<2)>>2]|0;o=c[j+1179664+(p+-1<<2)>>2]|0;if((k|0)>(o|0)){b[a>>1]=o;if((q|0)>0){l=0;g=m;while(1){if((c[g>>2]|0)==(k|0))c[g>>2]=o;l=l+1|0;if((l|0)>=(q|0)){k=o;break}else g=g+4|0}}else k=o}else{b[a>>1]=k;if((k|0)<(o|0)&(q|0)>0){l=0;g=m;while(1){if((c[g>>2]|0)==(o|0))c[g>>2]=k;l=l+1|0;if((l|0)>=(q|0))break;else g=g+4|0}}}k=(k<<16>>16)*7|0;p=j+1310736+(k+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=j+1310736+(k+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=j+1310736+(k+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+x;c[j+1310736+(k+-1<<2)>>2]=x;k=q;break}k=b[a+-2>>1]|0;if(k<<16>>16<=0){b[a>>1]=g;k=o*7|0;l=j+1310736+(k+-7<<2)|0;c[l>>2]=(c[l>>2]|0)+1;l=j+1310736+(k+-6<<2)|0;c[l>>2]=(c[l>>2]|0)+s;l=j+1310736+(k+-5<<2)|0;c[l>>2]=(c[l>>2]|0)+x;l=j+1310736+(k+-4<<2)|0;if((c[l>>2]|0)>(s|0))c[l>>2]=s;c[j+1310736+(k+-1<<2)>>2]=x;k=q;break}o=c[j+1179664+(o+-1<<2)>>2]|0;k=c[j+1179664+((k<<16>>16)+-1<<2)>>2]|0;if((o|0)>(k|0)){b[a>>1]=k;if((q|0)>0){l=0;g=m;while(1){if((c[g>>2]|0)==(o|0))c[g>>2]=k;l=l+1|0;if((l|0)>=(q|0))break;else g=g+4|0}}}else{b[a>>1]=o;if((o|0)<(k|0)&(q|0)>0){l=0;g=m;while(1){if((c[g>>2]|0)==(k|0))c[g>>2]=o;l=l+1|0;if((l|0)>=(q|0)){k=o;break}else g=g+4|0}}else k=o}k=(k<<16>>16)*7|0;p=j+1310736+(k+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=j+1310736+(k+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;k=j+1310736+(k+-5<<2)|0;c[k>>2]=(c[k>>2]|0)+x;k=q}while(0);s=s+1|0;l=r+1|0;n=n+1|0;a=a+2|0;if((s|0)>=(y|0))break;else{r=l;q=k}}}x=x+1|0;if((x|0)>=(z|0)){o=k;B=52;break a}else{l=l+2|0;a=a+4|0;n=n+2|0}}Me(3,3904,A);k=-1}else{o=0;B=52}while(0);if((B|0)==52){n=j+12|0;if((o|0)<1)l=1;else{a=1;l=1;while(1){k=c[m>>2]|0;if((k|0)==(a|0)){k=l;l=l+1|0}else k=c[j+1179664+(k+-1<<2)>>2]|0;c[m>>2]=k;if((a|0)<(o|0)){a=a+1|0;m=m+4|0}else break}}g=j+8|0;k=l+-1|0;c[g>>2]=k;if(k){ek(n|0,0,k<<2|0)|0;ek(j+655376|0,0,k<<4|0)|0;if((l|0)>1){k=0;do{B=k<<2;c[j+131084+(B<<2)>>2]=e;c[j+131084+((B|1)<<2)>>2]=0;c[j+131084+((B|2)<<2)>>2]=f;c[j+131084+((B|3)<<2)>>2]=0;k=k+1|0}while((k|0)<(c[g>>2]|0))}if((o|0)>0){n=0;do{m=(c[j+1179664+(n<<2)>>2]|0)+-1|0;a=n*7|0;k=j+12+(m<<2)|0;c[k>>2]=(c[k>>2]|0)+(c[j+1310736+(a<<2)>>2]|0);k=m<<1;l=j+655376+(k<<3)|0;h[l>>3]=+h[l>>3]+ +(c[j+1310736+(a+1<<2)>>2]|0);k=j+655376+((k|1)<<3)|0;h[k>>3]=+h[k>>3]+ +(c[j+1310736+(a+2<<2)>>2]|0);m=m<<2;k=j+131084+(m<<2)|0;l=c[j+1310736+(a+3<<2)>>2]|0;if((c[k>>2]|0)>(l|0))c[k>>2]=l;k=j+131084+((m|1)<<2)|0;l=c[j+1310736+(a+4<<2)>>2]|0;if((c[k>>2]|0)<(l|0))c[k>>2]=l;k=j+131084+((m|2)<<2)|0;l=c[j+1310736+(a+5<<2)>>2]|0;if((c[k>>2]|0)>(l|0))c[k>>2]=l;l=j+131084+((m|3)<<2)|0;k=c[j+1310736+(a+6<<2)>>2]|0;if((c[l>>2]|0)<(k|0))c[l>>2]=k;n=n+1|0}while((n|0)<(o|0))}if((c[g>>2]|0)>0){k=0;do{e=j+12+(k<<2)|0;f=k<<1;B=j+655376+(f<<3)|0;h[B>>3]=+h[B>>3]/+(c[e>>2]|0);f=j+655376+((f|1)<<3)|0;h[f>>3]=+h[f>>3]/+(c[e>>2]|0);k=k+1|0}while((k|0)<(c[g>>2]|0));k=0}else k=0}else k=0}i=C;return k|0}function Gc(a,e,f,g,j){a=a|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;D=i;i=i+16|0;z=D;B=(e|0)/2|0;C=(f|0)/2|0;n=c[j>>2]|0;y=C+-1|0;if((e|0)>1){k=0;l=n;m=n+(($(y,B)|0)<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(B|0))break;else{l=l+2|0;m=m+2|0}}}w=g*3|0;x=B+-1|0;if((f|0)>1){k=0;g=n;l=n+(x<<1)|0;while(1){b[l>>1]=0;b[g>>1]=0;k=k+1|0;if((k|0)>=(C|0))break;else{g=g+(B<<1)|0;l=l+(B<<1)|0}}}l=j+1179664|0;t=0-B|0;r=1-B|0;s=~B;q=(e*3|0)+12|0;a:do if((y|0)>1){u=(x|0)>1;v=1;g=a+((e*6|0)+6)|0;m=n+(B+1<<1)|0;k=0;b:while(1){if(u){p=1;o=m;n=k;while(1){do if(((d[g+1>>0]|0)+(d[g>>0]|0)+(d[g+2>>0]|0)|0)>(w|0)){k=b[o+(t<<1)>>1]|0;if(k<<16>>16>0){b[o>>1]=k;k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;e=j+1310736+(k+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+v;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}f=b[o+(r<<1)>>1]|0;a=f<<16>>16;k=b[o+(s<<1)>>1]|0;e=k<<16>>16;m=k<<16>>16>0;if(f<<16>>16<=0){if(m){b[o>>1]=k;k=e*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+p;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+v;m=j+1310736+(k+-3<<2)|0;if((c[m>>2]|0)<(p|0))c[m>>2]=p;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}k=b[o+-2>>1]|0;if(k<<16>>16>0){b[o>>1]=k;k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;e=j+1310736+(k+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+v;k=j+1310736+(k+-3<<2)|0;if((c[k>>2]|0)>=(p|0)){k=n;break}c[k>>2]=p;k=n;break}else{k=n+1|0;if((n|0)>32767)break b;b[o>>1]=k;c[j+1179664+(n<<2)>>2]=k<<16>>16;n=n*7|0;c[j+1310736+(n<<2)>>2]=1;c[j+1310736+(n+1<<2)>>2]=p;c[j+1310736+(n+2<<2)>>2]=v;c[j+1310736+(n+3<<2)>>2]=p;c[j+1310736+(n+4<<2)>>2]=p;c[j+1310736+(n+5<<2)>>2]=v;c[j+1310736+(n+6<<2)>>2]=v;break}}if(m){k=c[j+1179664+(a+-1<<2)>>2]|0;a=c[j+1179664+(e+-1<<2)>>2]|0;if((k|0)>(a|0)){b[o>>1]=a;if((n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(k|0))c[f>>2]=a;m=m+1|0;if((m|0)>=(n|0)){k=a;break}else f=f+4|0}}else k=a}else{b[o>>1]=k;if((k|0)<(a|0)&(n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(a|0))c[f>>2]=k;m=m+1|0;if((m|0)>=(n|0))break;else f=f+4|0}}}k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;e=j+1310736+(k+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+v;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}m=b[o+-2>>1]|0;if(m<<16>>16<=0){b[o>>1]=f;k=a*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+p;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+v;m=j+1310736+(k+-4<<2)|0;if((c[m>>2]|0)>(p|0))c[m>>2]=p;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}k=c[j+1179664+(a+-1<<2)>>2]|0;a=c[j+1179664+((m<<16>>16)+-1<<2)>>2]|0;if((k|0)>(a|0)){b[o>>1]=a;if((n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(k|0))c[f>>2]=a;m=m+1|0;if((m|0)>=(n|0)){k=a;break}else f=f+4|0}}else k=a}else{b[o>>1]=k;if((k|0)<(a|0)&(n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(a|0))c[f>>2]=k;m=m+1|0;if((m|0)>=(n|0))break;else f=f+4|0}}}k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;k=j+1310736+(k+-5<<2)|0;c[k>>2]=(c[k>>2]|0)+v;k=n}else{b[o>>1]=0;k=n}while(0);p=p+1|0;g=g+6|0;m=o+2|0;if((p|0)>=(x|0))break;else{o=m;n=k}}}v=v+1|0;if((v|0)>=(y|0)){e=k;A=52;break a}else{g=g+q|0;m=m+4|0}}Me(3,3904,z);k=-1}else{e=0;A=52}while(0);if((A|0)==52){f=j+12|0;if((e|0)<1)g=1;else{m=1;g=1;while(1){k=c[l>>2]|0;if((k|0)==(m|0)){k=g;g=g+1|0}else k=c[j+1179664+(k+-1<<2)>>2]|0;c[l>>2]=k;if((m|0)<(e|0)){m=m+1|0;l=l+4|0}else break}}a=j+8|0;k=g+-1|0;c[a>>2]=k;if(k){ek(f|0,0,k<<2|0)|0;ek(j+655376|0,0,k<<4|0)|0;if((g|0)>1){k=0;do{A=k<<2;c[j+131084+(A<<2)>>2]=B;c[j+131084+((A|1)<<2)>>2]=0;c[j+131084+((A|2)<<2)>>2]=C;c[j+131084+((A|3)<<2)>>2]=0;k=k+1|0}while((k|0)<(c[a>>2]|0))}if((e|0)>0){f=0;do{l=(c[j+1179664+(f<<2)>>2]|0)+-1|0;m=f*7|0;k=j+12+(l<<2)|0;c[k>>2]=(c[k>>2]|0)+(c[j+1310736+(m<<2)>>2]|0);k=l<<1;g=j+655376+(k<<3)|0;h[g>>3]=+h[g>>3]+ +(c[j+1310736+(m+1<<2)>>2]|0);k=j+655376+((k|1)<<3)|0;h[k>>3]=+h[k>>3]+ +(c[j+1310736+(m+2<<2)>>2]|0);l=l<<2;k=j+131084+(l<<2)|0;g=c[j+1310736+(m+3<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;k=j+131084+((l|1)<<2)|0;g=c[j+1310736+(m+4<<2)>>2]|0;if((c[k>>2]|0)<(g|0))c[k>>2]=g;k=j+131084+((l|2)<<2)|0;g=c[j+1310736+(m+5<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;g=j+131084+((l|3)<<2)|0;k=c[j+1310736+(m+6<<2)>>2]|0;if((c[g>>2]|0)<(k|0))c[g>>2]=k;f=f+1|0}while((f|0)<(e|0))}if((c[a>>2]|0)>0){k=0;do{B=j+12+(k<<2)|0;C=k<<1;A=j+655376+(C<<3)|0;h[A>>3]=+h[A>>3]/+(c[B>>2]|0);C=j+655376+((C|1)<<3)|0;h[C>>3]=+h[C>>3]/+(c[B>>2]|0);k=k+1|0}while((k|0)<(c[a>>2]|0));k=0}else k=0}else k=0}i=D;return k|0}function Hc(a,e,f,g,j){a=a|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;D=i;i=i+16|0;z=D;B=(e|0)/2|0;C=(f|0)/2|0;n=c[j>>2]|0;y=C+-1|0;if((e|0)>1){k=0;l=n;m=n+(($(y,B)|0)<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(B|0))break;else{l=l+2|0;m=m+2|0}}}w=g*3|0;x=B+-1|0;if((f|0)>1){k=0;g=n;l=n+(x<<1)|0;while(1){b[l>>1]=0;b[g>>1]=0;k=k+1|0;if((k|0)>=(C|0))break;else{g=g+(B<<1)|0;l=l+(B<<1)|0}}}l=j+1179664|0;t=0-B|0;r=1-B|0;s=~B;q=(e<<1)+8|0;a:do if((y|0)>1){u=(x|0)>1;v=1;g=a+((e<<2)+4)|0;m=n+(B+1<<1)|0;k=0;b:while(1){if(u){p=1;o=m;n=k;while(1){a=d[g>>0]|0;e=d[g+1>>0]|0;do if(((a&248)+10+(a<<5&224)+(e>>>3&28)+(e<<3&248)|0)>(w|0)){k=b[o+(t<<1)>>1]|0;if(k<<16>>16>0){b[o>>1]=k;k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;e=j+1310736+(k+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+v;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}f=b[o+(r<<1)>>1]|0;a=f<<16>>16;k=b[o+(s<<1)>>1]|0;e=k<<16>>16;m=k<<16>>16>0;if(f<<16>>16<=0){if(m){b[o>>1]=k;k=e*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+p;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+v;m=j+1310736+(k+-3<<2)|0;if((c[m>>2]|0)<(p|0))c[m>>2]=p;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}k=b[o+-2>>1]|0;if(k<<16>>16>0){b[o>>1]=k;k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;e=j+1310736+(k+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+v;k=j+1310736+(k+-3<<2)|0;if((c[k>>2]|0)>=(p|0)){k=n;break}c[k>>2]=p;k=n;break}else{k=n+1|0;if((n|0)>32767)break b;b[o>>1]=k;c[j+1179664+(n<<2)>>2]=k<<16>>16;n=n*7|0;c[j+1310736+(n<<2)>>2]=1;c[j+1310736+(n+1<<2)>>2]=p;c[j+1310736+(n+2<<2)>>2]=v;c[j+1310736+(n+3<<2)>>2]=p;c[j+1310736+(n+4<<2)>>2]=p;c[j+1310736+(n+5<<2)>>2]=v;c[j+1310736+(n+6<<2)>>2]=v;break}}if(m){k=c[j+1179664+(a+-1<<2)>>2]|0;a=c[j+1179664+(e+-1<<2)>>2]|0;if((k|0)>(a|0)){b[o>>1]=a;if((n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(k|0))c[f>>2]=a;m=m+1|0;if((m|0)>=(n|0)){k=a;break}else f=f+4|0}}else k=a}else{b[o>>1]=k;if((k|0)<(a|0)&(n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(a|0))c[f>>2]=k;m=m+1|0;if((m|0)>=(n|0))break;else f=f+4|0}}}k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;e=j+1310736+(k+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+v;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}m=b[o+-2>>1]|0;if(m<<16>>16<=0){b[o>>1]=f;k=a*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+p;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+v;m=j+1310736+(k+-4<<2)|0;if((c[m>>2]|0)>(p|0))c[m>>2]=p;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}k=c[j+1179664+(a+-1<<2)>>2]|0;a=c[j+1179664+((m<<16>>16)+-1<<2)>>2]|0;if((k|0)>(a|0)){b[o>>1]=a;if((n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(k|0))c[f>>2]=a;m=m+1|0;if((m|0)>=(n|0)){k=a;break}else f=f+4|0}}else k=a}else{b[o>>1]=k;if((k|0)<(a|0)&(n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(a|0))c[f>>2]=k;m=m+1|0;if((m|0)>=(n|0))break;else f=f+4|0}}}k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;k=j+1310736+(k+-5<<2)|0;c[k>>2]=(c[k>>2]|0)+v;k=n}else{b[o>>1]=0;k=n}while(0);p=p+1|0;g=g+4|0;m=o+2|0;if((p|0)>=(x|0))break;else{o=m;n=k}}}v=v+1|0;if((v|0)>=(y|0)){e=k;A=52;break a}else{g=g+q|0;m=m+4|0}}Me(3,3904,z);k=-1}else{e=0;A=52}while(0);if((A|0)==52){f=j+12|0;if((e|0)<1)g=1;else{m=1;g=1;while(1){k=c[l>>2]|0;if((k|0)==(m|0)){k=g;g=g+1|0}else k=c[j+1179664+(k+-1<<2)>>2]|0;c[l>>2]=k;if((m|0)<(e|0)){m=m+1|0;l=l+4|0}else break}}a=j+8|0;k=g+-1|0;c[a>>2]=k;if(k){ek(f|0,0,k<<2|0)|0;ek(j+655376|0,0,k<<4|0)|0;if((g|0)>1){k=0;do{A=k<<2;c[j+131084+(A<<2)>>2]=B;c[j+131084+((A|1)<<2)>>2]=0;c[j+131084+((A|2)<<2)>>2]=C;c[j+131084+((A|3)<<2)>>2]=0;k=k+1|0}while((k|0)<(c[a>>2]|0))}if((e|0)>0){f=0;do{l=(c[j+1179664+(f<<2)>>2]|0)+-1|0;m=f*7|0;k=j+12+(l<<2)|0;c[k>>2]=(c[k>>2]|0)+(c[j+1310736+(m<<2)>>2]|0);k=l<<1;g=j+655376+(k<<3)|0;h[g>>3]=+h[g>>3]+ +(c[j+1310736+(m+1<<2)>>2]|0);k=j+655376+((k|1)<<3)|0;h[k>>3]=+h[k>>3]+ +(c[j+1310736+(m+2<<2)>>2]|0);l=l<<2;k=j+131084+(l<<2)|0;g=c[j+1310736+(m+3<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;k=j+131084+((l|1)<<2)|0;g=c[j+1310736+(m+4<<2)>>2]|0;if((c[k>>2]|0)<(g|0))c[k>>2]=g;k=j+131084+((l|2)<<2)|0;g=c[j+1310736+(m+5<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;g=j+131084+((l|3)<<2)|0;k=c[j+1310736+(m+6<<2)>>2]|0;if((c[g>>2]|0)<(k|0))c[g>>2]=k;f=f+1|0}while((f|0)<(e|0))}if((c[a>>2]|0)>0){k=0;do{B=j+12+(k<<2)|0;C=k<<1;A=j+655376+(C<<3)|0;h[A>>3]=+h[A>>3]/+(c[B>>2]|0);C=j+655376+((C|1)<<3)|0;h[C>>3]=+h[C>>3]/+(c[B>>2]|0);k=k+1|0}while((k|0)<(c[a>>2]|0));k=0}else k=0}else k=0}i=D;return k|0}function Ic(a,e,f,g,j){a=a|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;D=i;i=i+16|0;z=D;B=(e|0)/2|0;C=(f|0)/2|0;n=c[j>>2]|0;y=C+-1|0;if((e|0)>1){k=0;l=n;m=n+(($(y,B)|0)<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(B|0))break;else{l=l+2|0;m=m+2|0}}}w=g*3|0;x=B+-1|0;if((f|0)>1){k=0;g=n;l=n+(x<<1)|0;while(1){b[l>>1]=0;b[g>>1]=0;k=k+1|0;if((k|0)>=(C|0))break;else{g=g+(B<<1)|0;l=l+(B<<1)|0}}}l=j+1179664|0;t=0-B|0;r=1-B|0;s=~B;q=(e<<2)+16|0;a:do if((y|0)>1){u=(x|0)>1;v=1;g=a+((e<<3)+8)|0;m=n+(B+1<<1)|0;k=0;b:while(1){if(u){p=1;o=m;n=k;while(1){do if(((d[g+1>>0]|0)+(d[g>>0]|0)+(d[g+2>>0]|0)|0)>(w|0)){k=b[o+(t<<1)>>1]|0;if(k<<16>>16>0){b[o>>1]=k;k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;e=j+1310736+(k+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+v;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}f=b[o+(r<<1)>>1]|0;a=f<<16>>16;k=b[o+(s<<1)>>1]|0;e=k<<16>>16;m=k<<16>>16>0;if(f<<16>>16<=0){if(m){b[o>>1]=k;k=e*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+p;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+v;m=j+1310736+(k+-3<<2)|0;if((c[m>>2]|0)<(p|0))c[m>>2]=p;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}k=b[o+-2>>1]|0;if(k<<16>>16>0){b[o>>1]=k;k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;e=j+1310736+(k+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+v;k=j+1310736+(k+-3<<2)|0;if((c[k>>2]|0)>=(p|0)){k=n;break}c[k>>2]=p;k=n;break}else{k=n+1|0;if((n|0)>32767)break b;b[o>>1]=k;c[j+1179664+(n<<2)>>2]=k<<16>>16;n=n*7|0;c[j+1310736+(n<<2)>>2]=1;c[j+1310736+(n+1<<2)>>2]=p;c[j+1310736+(n+2<<2)>>2]=v;c[j+1310736+(n+3<<2)>>2]=p;c[j+1310736+(n+4<<2)>>2]=p;c[j+1310736+(n+5<<2)>>2]=v;c[j+1310736+(n+6<<2)>>2]=v;break}}if(m){k=c[j+1179664+(a+-1<<2)>>2]|0;a=c[j+1179664+(e+-1<<2)>>2]|0;if((k|0)>(a|0)){b[o>>1]=a;if((n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(k|0))c[f>>2]=a;m=m+1|0;if((m|0)>=(n|0)){k=a;break}else f=f+4|0}}else k=a}else{b[o>>1]=k;if((k|0)<(a|0)&(n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(a|0))c[f>>2]=k;m=m+1|0;if((m|0)>=(n|0))break;else f=f+4|0}}}k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;e=j+1310736+(k+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+v;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}m=b[o+-2>>1]|0;if(m<<16>>16<=0){b[o>>1]=f;k=a*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+p;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+v;m=j+1310736+(k+-4<<2)|0;if((c[m>>2]|0)>(p|0))c[m>>2]=p;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}k=c[j+1179664+(a+-1<<2)>>2]|0;a=c[j+1179664+((m<<16>>16)+-1<<2)>>2]|0;if((k|0)>(a|0)){b[o>>1]=a;if((n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(k|0))c[f>>2]=a;m=m+1|0;if((m|0)>=(n|0)){k=a;break}else f=f+4|0}}else k=a}else{b[o>>1]=k;if((k|0)<(a|0)&(n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(a|0))c[f>>2]=k;m=m+1|0;if((m|0)>=(n|0))break;else f=f+4|0}}}k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;k=j+1310736+(k+-5<<2)|0;c[k>>2]=(c[k>>2]|0)+v;k=n}else{b[o>>1]=0;k=n}while(0);p=p+1|0;g=g+8|0;m=o+2|0;if((p|0)>=(x|0))break;else{o=m;n=k}}}v=v+1|0;if((v|0)>=(y|0)){e=k;A=52;break a}else{g=g+q|0;m=m+4|0}}Me(3,3904,z);k=-1}else{e=0;A=52}while(0);if((A|0)==52){f=j+12|0;if((e|0)<1)g=1;else{m=1;g=1;while(1){k=c[l>>2]|0;if((k|0)==(m|0)){k=g;g=g+1|0}else k=c[j+1179664+(k+-1<<2)>>2]|0;c[l>>2]=k;if((m|0)<(e|0)){m=m+1|0;l=l+4|0}else break}}a=j+8|0;k=g+-1|0;c[a>>2]=k;if(k){ek(f|0,0,k<<2|0)|0;ek(j+655376|0,0,k<<4|0)|0;if((g|0)>1){k=0;do{A=k<<2;c[j+131084+(A<<2)>>2]=B;c[j+131084+((A|1)<<2)>>2]=0;c[j+131084+((A|2)<<2)>>2]=C;c[j+131084+((A|3)<<2)>>2]=0;k=k+1|0}while((k|0)<(c[a>>2]|0))}if((e|0)>0){f=0;do{l=(c[j+1179664+(f<<2)>>2]|0)+-1|0;m=f*7|0;k=j+12+(l<<2)|0;c[k>>2]=(c[k>>2]|0)+(c[j+1310736+(m<<2)>>2]|0);k=l<<1;g=j+655376+(k<<3)|0;h[g>>3]=+h[g>>3]+ +(c[j+1310736+(m+1<<2)>>2]|0);k=j+655376+((k|1)<<3)|0;h[k>>3]=+h[k>>3]+ +(c[j+1310736+(m+2<<2)>>2]|0);l=l<<2;k=j+131084+(l<<2)|0;g=c[j+1310736+(m+3<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;k=j+131084+((l|1)<<2)|0;g=c[j+1310736+(m+4<<2)>>2]|0;if((c[k>>2]|0)<(g|0))c[k>>2]=g;k=j+131084+((l|2)<<2)|0;g=c[j+1310736+(m+5<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;g=j+131084+((l|3)<<2)|0;k=c[j+1310736+(m+6<<2)>>2]|0;if((c[g>>2]|0)<(k|0))c[g>>2]=k;f=f+1|0}while((f|0)<(e|0))}if((c[a>>2]|0)>0){k=0;do{B=j+12+(k<<2)|0;C=k<<1;A=j+655376+(C<<3)|0;h[A>>3]=+h[A>>3]/+(c[B>>2]|0);C=j+655376+((C|1)<<3)|0;h[C>>3]=+h[C>>3]/+(c[B>>2]|0);k=k+1|0}while((k|0)<(c[a>>2]|0));k=0}else k=0}else k=0}i=D;return k|0}
function Jc(a,e,f,g,j){a=a|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;D=i;i=i+16|0;z=D;B=(e|0)/2|0;C=(f|0)/2|0;n=c[j>>2]|0;y=C+-1|0;if((e|0)>1){k=0;l=n;m=n+(($(y,B)|0)<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(B|0))break;else{l=l+2|0;m=m+2|0}}}w=g*3|0;x=B+-1|0;if((f|0)>1){k=0;g=n;l=n+(x<<1)|0;while(1){b[l>>1]=0;b[g>>1]=0;k=k+1|0;if((k|0)>=(C|0))break;else{g=g+(B<<1)|0;l=l+(B<<1)|0}}}l=j+1179664|0;t=0-B|0;r=1-B|0;s=~B;q=(e<<1)+8|0;a:do if((y|0)>1){u=(x|0)>1;v=1;g=a+((e<<2)+4)|0;m=n+(B+1<<1)|0;k=0;b:while(1){if(u){p=1;o=m;n=k;while(1){e=d[g>>0]|0;do if(((e&240)+24+(e<<4&240)+((d[g+1>>0]|0)&240)|0)>(w|0)){k=b[o+(t<<1)>>1]|0;if(k<<16>>16>0){b[o>>1]=k;k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;e=j+1310736+(k+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+v;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}f=b[o+(r<<1)>>1]|0;a=f<<16>>16;k=b[o+(s<<1)>>1]|0;e=k<<16>>16;m=k<<16>>16>0;if(f<<16>>16<=0){if(m){b[o>>1]=k;k=e*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+p;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+v;m=j+1310736+(k+-3<<2)|0;if((c[m>>2]|0)<(p|0))c[m>>2]=p;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}k=b[o+-2>>1]|0;if(k<<16>>16>0){b[o>>1]=k;k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;e=j+1310736+(k+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+v;k=j+1310736+(k+-3<<2)|0;if((c[k>>2]|0)>=(p|0)){k=n;break}c[k>>2]=p;k=n;break}else{k=n+1|0;if((n|0)>32767)break b;b[o>>1]=k;c[j+1179664+(n<<2)>>2]=k<<16>>16;n=n*7|0;c[j+1310736+(n<<2)>>2]=1;c[j+1310736+(n+1<<2)>>2]=p;c[j+1310736+(n+2<<2)>>2]=v;c[j+1310736+(n+3<<2)>>2]=p;c[j+1310736+(n+4<<2)>>2]=p;c[j+1310736+(n+5<<2)>>2]=v;c[j+1310736+(n+6<<2)>>2]=v;break}}if(m){k=c[j+1179664+(a+-1<<2)>>2]|0;a=c[j+1179664+(e+-1<<2)>>2]|0;if((k|0)>(a|0)){b[o>>1]=a;if((n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(k|0))c[f>>2]=a;m=m+1|0;if((m|0)>=(n|0)){k=a;break}else f=f+4|0}}else k=a}else{b[o>>1]=k;if((k|0)<(a|0)&(n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(a|0))c[f>>2]=k;m=m+1|0;if((m|0)>=(n|0))break;else f=f+4|0}}}k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;e=j+1310736+(k+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+v;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}m=b[o+-2>>1]|0;if(m<<16>>16<=0){b[o>>1]=f;k=a*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+p;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+v;m=j+1310736+(k+-4<<2)|0;if((c[m>>2]|0)>(p|0))c[m>>2]=p;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}k=c[j+1179664+(a+-1<<2)>>2]|0;a=c[j+1179664+((m<<16>>16)+-1<<2)>>2]|0;if((k|0)>(a|0)){b[o>>1]=a;if((n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(k|0))c[f>>2]=a;m=m+1|0;if((m|0)>=(n|0)){k=a;break}else f=f+4|0}}else k=a}else{b[o>>1]=k;if((k|0)<(a|0)&(n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(a|0))c[f>>2]=k;m=m+1|0;if((m|0)>=(n|0))break;else f=f+4|0}}}k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;k=j+1310736+(k+-5<<2)|0;c[k>>2]=(c[k>>2]|0)+v;k=n}else{b[o>>1]=0;k=n}while(0);p=p+1|0;g=g+4|0;m=o+2|0;if((p|0)>=(x|0))break;else{o=m;n=k}}}v=v+1|0;if((v|0)>=(y|0)){e=k;A=52;break a}else{g=g+q|0;m=m+4|0}}Me(3,3904,z);k=-1}else{e=0;A=52}while(0);if((A|0)==52){f=j+12|0;if((e|0)<1)g=1;else{m=1;g=1;while(1){k=c[l>>2]|0;if((k|0)==(m|0)){k=g;g=g+1|0}else k=c[j+1179664+(k+-1<<2)>>2]|0;c[l>>2]=k;if((m|0)<(e|0)){m=m+1|0;l=l+4|0}else break}}a=j+8|0;k=g+-1|0;c[a>>2]=k;if(k){ek(f|0,0,k<<2|0)|0;ek(j+655376|0,0,k<<4|0)|0;if((g|0)>1){k=0;do{A=k<<2;c[j+131084+(A<<2)>>2]=B;c[j+131084+((A|1)<<2)>>2]=0;c[j+131084+((A|2)<<2)>>2]=C;c[j+131084+((A|3)<<2)>>2]=0;k=k+1|0}while((k|0)<(c[a>>2]|0))}if((e|0)>0){f=0;do{l=(c[j+1179664+(f<<2)>>2]|0)+-1|0;m=f*7|0;k=j+12+(l<<2)|0;c[k>>2]=(c[k>>2]|0)+(c[j+1310736+(m<<2)>>2]|0);k=l<<1;g=j+655376+(k<<3)|0;h[g>>3]=+h[g>>3]+ +(c[j+1310736+(m+1<<2)>>2]|0);k=j+655376+((k|1)<<3)|0;h[k>>3]=+h[k>>3]+ +(c[j+1310736+(m+2<<2)>>2]|0);l=l<<2;k=j+131084+(l<<2)|0;g=c[j+1310736+(m+3<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;k=j+131084+((l|1)<<2)|0;g=c[j+1310736+(m+4<<2)>>2]|0;if((c[k>>2]|0)<(g|0))c[k>>2]=g;k=j+131084+((l|2)<<2)|0;g=c[j+1310736+(m+5<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;g=j+131084+((l|3)<<2)|0;k=c[j+1310736+(m+6<<2)>>2]|0;if((c[g>>2]|0)<(k|0))c[g>>2]=k;f=f+1|0}while((f|0)<(e|0))}if((c[a>>2]|0)>0){k=0;do{B=j+12+(k<<2)|0;C=k<<1;A=j+655376+(C<<3)|0;h[A>>3]=+h[A>>3]/+(c[B>>2]|0);C=j+655376+((C|1)<<3)|0;h[C>>3]=+h[C>>3]/+(c[B>>2]|0);k=k+1|0}while((k|0)<(c[a>>2]|0));k=0}else k=0}else k=0}i=D;return k|0}function Kc(a,e,f,g,j){a=a|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;D=i;i=i+16|0;z=D;B=(e|0)/2|0;C=(f|0)/2|0;n=c[j>>2]|0;y=C+-1|0;if((e|0)>1){k=0;l=n;m=n+(($(y,B)|0)<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(B|0))break;else{l=l+2|0;m=m+2|0}}}w=g*3|0;x=B+-1|0;if((f|0)>1){k=0;g=n;l=n+(x<<1)|0;while(1){b[l>>1]=0;b[g>>1]=0;k=k+1|0;if((k|0)>=(C|0))break;else{g=g+(B<<1)|0;l=l+(B<<1)|0}}}l=j+1179664|0;t=0-B|0;r=1-B|0;s=~B;q=(e<<1)+8|0;a:do if((y|0)>1){u=(x|0)>1;v=1;g=a+((e<<2)+4)|0;m=n+(B+1<<1)|0;k=0;b:while(1){if(u){p=1;o=m;n=k;while(1){a=d[g>>0]|0;e=d[g+1>>0]|0;do if(((a&248)+12+(a<<5&224)+(e>>>3&24)+(e<<2&248)|0)>(w|0)){k=b[o+(t<<1)>>1]|0;if(k<<16>>16>0){b[o>>1]=k;k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;e=j+1310736+(k+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+v;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}f=b[o+(r<<1)>>1]|0;a=f<<16>>16;k=b[o+(s<<1)>>1]|0;e=k<<16>>16;m=k<<16>>16>0;if(f<<16>>16<=0){if(m){b[o>>1]=k;k=e*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+p;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+v;m=j+1310736+(k+-3<<2)|0;if((c[m>>2]|0)<(p|0))c[m>>2]=p;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}k=b[o+-2>>1]|0;if(k<<16>>16>0){b[o>>1]=k;k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;e=j+1310736+(k+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+v;k=j+1310736+(k+-3<<2)|0;if((c[k>>2]|0)>=(p|0)){k=n;break}c[k>>2]=p;k=n;break}else{k=n+1|0;if((n|0)>32767)break b;b[o>>1]=k;c[j+1179664+(n<<2)>>2]=k<<16>>16;n=n*7|0;c[j+1310736+(n<<2)>>2]=1;c[j+1310736+(n+1<<2)>>2]=p;c[j+1310736+(n+2<<2)>>2]=v;c[j+1310736+(n+3<<2)>>2]=p;c[j+1310736+(n+4<<2)>>2]=p;c[j+1310736+(n+5<<2)>>2]=v;c[j+1310736+(n+6<<2)>>2]=v;break}}if(m){k=c[j+1179664+(a+-1<<2)>>2]|0;a=c[j+1179664+(e+-1<<2)>>2]|0;if((k|0)>(a|0)){b[o>>1]=a;if((n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(k|0))c[f>>2]=a;m=m+1|0;if((m|0)>=(n|0)){k=a;break}else f=f+4|0}}else k=a}else{b[o>>1]=k;if((k|0)<(a|0)&(n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(a|0))c[f>>2]=k;m=m+1|0;if((m|0)>=(n|0))break;else f=f+4|0}}}k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;e=j+1310736+(k+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+v;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}m=b[o+-2>>1]|0;if(m<<16>>16<=0){b[o>>1]=f;k=a*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+p;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+v;m=j+1310736+(k+-4<<2)|0;if((c[m>>2]|0)>(p|0))c[m>>2]=p;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}k=c[j+1179664+(a+-1<<2)>>2]|0;a=c[j+1179664+((m<<16>>16)+-1<<2)>>2]|0;if((k|0)>(a|0)){b[o>>1]=a;if((n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(k|0))c[f>>2]=a;m=m+1|0;if((m|0)>=(n|0)){k=a;break}else f=f+4|0}}else k=a}else{b[o>>1]=k;if((k|0)<(a|0)&(n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(a|0))c[f>>2]=k;m=m+1|0;if((m|0)>=(n|0))break;else f=f+4|0}}}k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;k=j+1310736+(k+-5<<2)|0;c[k>>2]=(c[k>>2]|0)+v;k=n}else{b[o>>1]=0;k=n}while(0);p=p+1|0;g=g+4|0;m=o+2|0;if((p|0)>=(x|0))break;else{o=m;n=k}}}v=v+1|0;if((v|0)>=(y|0)){e=k;A=52;break a}else{g=g+q|0;m=m+4|0}}Me(3,3904,z);k=-1}else{e=0;A=52}while(0);if((A|0)==52){f=j+12|0;if((e|0)<1)g=1;else{m=1;g=1;while(1){k=c[l>>2]|0;if((k|0)==(m|0)){k=g;g=g+1|0}else k=c[j+1179664+(k+-1<<2)>>2]|0;c[l>>2]=k;if((m|0)<(e|0)){m=m+1|0;l=l+4|0}else break}}a=j+8|0;k=g+-1|0;c[a>>2]=k;if(k){ek(f|0,0,k<<2|0)|0;ek(j+655376|0,0,k<<4|0)|0;if((g|0)>1){k=0;do{A=k<<2;c[j+131084+(A<<2)>>2]=B;c[j+131084+((A|1)<<2)>>2]=0;c[j+131084+((A|2)<<2)>>2]=C;c[j+131084+((A|3)<<2)>>2]=0;k=k+1|0}while((k|0)<(c[a>>2]|0))}if((e|0)>0){f=0;do{l=(c[j+1179664+(f<<2)>>2]|0)+-1|0;m=f*7|0;k=j+12+(l<<2)|0;c[k>>2]=(c[k>>2]|0)+(c[j+1310736+(m<<2)>>2]|0);k=l<<1;g=j+655376+(k<<3)|0;h[g>>3]=+h[g>>3]+ +(c[j+1310736+(m+1<<2)>>2]|0);k=j+655376+((k|1)<<3)|0;h[k>>3]=+h[k>>3]+ +(c[j+1310736+(m+2<<2)>>2]|0);l=l<<2;k=j+131084+(l<<2)|0;g=c[j+1310736+(m+3<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;k=j+131084+((l|1)<<2)|0;g=c[j+1310736+(m+4<<2)>>2]|0;if((c[k>>2]|0)<(g|0))c[k>>2]=g;k=j+131084+((l|2)<<2)|0;g=c[j+1310736+(m+5<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;g=j+131084+((l|3)<<2)|0;k=c[j+1310736+(m+6<<2)>>2]|0;if((c[g>>2]|0)<(k|0))c[g>>2]=k;f=f+1|0}while((f|0)<(e|0))}if((c[a>>2]|0)>0){k=0;do{B=j+12+(k<<2)|0;C=k<<1;A=j+655376+(C<<3)|0;h[A>>3]=+h[A>>3]/+(c[B>>2]|0);C=j+655376+((C|1)<<3)|0;h[C>>3]=+h[C>>3]/+(c[B>>2]|0);k=k+1|0}while((k|0)<(c[a>>2]|0));k=0}else k=0}else k=0}i=D;return k|0}function Lc(a,e,f,g,j){a=a|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;D=i;i=i+16|0;z=D;B=(e|0)/2|0;C=(f|0)/2|0;n=c[j>>2]|0;y=C+-1|0;if((e|0)>1){k=0;l=n;m=n+(($(y,B)|0)<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(B|0))break;else{l=l+2|0;m=m+2|0}}}w=g*3|0;x=B+-1|0;if((f|0)>1){k=0;g=n;l=n+(x<<1)|0;while(1){b[l>>1]=0;b[g>>1]=0;k=k+1|0;if((k|0)>=(C|0))break;else{g=g+(B<<1)|0;l=l+(B<<1)|0}}}l=j+1179664|0;t=0-B|0;r=1-B|0;s=~B;q=(e<<2)+16|0;a:do if((y|0)>1){u=(x|0)>1;v=1;g=a+((e<<3)+8)|0;m=n+(B+1<<1)|0;k=0;b:while(1){if(u){p=1;o=m;n=k;while(1){do if(((d[g+2>>0]|0)+(d[g+1>>0]|0)+(d[g+3>>0]|0)|0)>(w|0)){k=b[o+(t<<1)>>1]|0;if(k<<16>>16>0){b[o>>1]=k;k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;e=j+1310736+(k+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+v;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}f=b[o+(r<<1)>>1]|0;a=f<<16>>16;k=b[o+(s<<1)>>1]|0;e=k<<16>>16;m=k<<16>>16>0;if(f<<16>>16<=0){if(m){b[o>>1]=k;k=e*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+p;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+v;m=j+1310736+(k+-3<<2)|0;if((c[m>>2]|0)<(p|0))c[m>>2]=p;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}k=b[o+-2>>1]|0;if(k<<16>>16>0){b[o>>1]=k;k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;e=j+1310736+(k+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+v;k=j+1310736+(k+-3<<2)|0;if((c[k>>2]|0)>=(p|0)){k=n;break}c[k>>2]=p;k=n;break}else{k=n+1|0;if((n|0)>32767)break b;b[o>>1]=k;c[j+1179664+(n<<2)>>2]=k<<16>>16;n=n*7|0;c[j+1310736+(n<<2)>>2]=1;c[j+1310736+(n+1<<2)>>2]=p;c[j+1310736+(n+2<<2)>>2]=v;c[j+1310736+(n+3<<2)>>2]=p;c[j+1310736+(n+4<<2)>>2]=p;c[j+1310736+(n+5<<2)>>2]=v;c[j+1310736+(n+6<<2)>>2]=v;break}}if(m){k=c[j+1179664+(a+-1<<2)>>2]|0;a=c[j+1179664+(e+-1<<2)>>2]|0;if((k|0)>(a|0)){b[o>>1]=a;if((n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(k|0))c[f>>2]=a;m=m+1|0;if((m|0)>=(n|0)){k=a;break}else f=f+4|0}}else k=a}else{b[o>>1]=k;if((k|0)<(a|0)&(n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(a|0))c[f>>2]=k;m=m+1|0;if((m|0)>=(n|0))break;else f=f+4|0}}}k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;e=j+1310736+(k+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+v;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}m=b[o+-2>>1]|0;if(m<<16>>16<=0){b[o>>1]=f;k=a*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+p;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+v;m=j+1310736+(k+-4<<2)|0;if((c[m>>2]|0)>(p|0))c[m>>2]=p;c[j+1310736+(k+-1<<2)>>2]=v;k=n;break}k=c[j+1179664+(a+-1<<2)>>2]|0;a=c[j+1179664+((m<<16>>16)+-1<<2)>>2]|0;if((k|0)>(a|0)){b[o>>1]=a;if((n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(k|0))c[f>>2]=a;m=m+1|0;if((m|0)>=(n|0)){k=a;break}else f=f+4|0}}else k=a}else{b[o>>1]=k;if((k|0)<(a|0)&(n|0)>0){m=0;f=l;while(1){if((c[f>>2]|0)==(a|0))c[f>>2]=k;m=m+1|0;if((m|0)>=(n|0))break;else f=f+4|0}}}k=(k<<16>>16)*7|0;e=j+1310736+(k+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=j+1310736+(k+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+p;k=j+1310736+(k+-5<<2)|0;c[k>>2]=(c[k>>2]|0)+v;k=n}else{b[o>>1]=0;k=n}while(0);p=p+1|0;g=g+8|0;m=o+2|0;if((p|0)>=(x|0))break;else{o=m;n=k}}}v=v+1|0;if((v|0)>=(y|0)){e=k;A=52;break a}else{g=g+q|0;m=m+4|0}}Me(3,3904,z);k=-1}else{e=0;A=52}while(0);if((A|0)==52){f=j+12|0;if((e|0)<1)g=1;else{m=1;g=1;while(1){k=c[l>>2]|0;if((k|0)==(m|0)){k=g;g=g+1|0}else k=c[j+1179664+(k+-1<<2)>>2]|0;c[l>>2]=k;if((m|0)<(e|0)){m=m+1|0;l=l+4|0}else break}}a=j+8|0;k=g+-1|0;c[a>>2]=k;if(k){ek(f|0,0,k<<2|0)|0;ek(j+655376|0,0,k<<4|0)|0;if((g|0)>1){k=0;do{A=k<<2;c[j+131084+(A<<2)>>2]=B;c[j+131084+((A|1)<<2)>>2]=0;c[j+131084+((A|2)<<2)>>2]=C;c[j+131084+((A|3)<<2)>>2]=0;k=k+1|0}while((k|0)<(c[a>>2]|0))}if((e|0)>0){f=0;do{l=(c[j+1179664+(f<<2)>>2]|0)+-1|0;m=f*7|0;k=j+12+(l<<2)|0;c[k>>2]=(c[k>>2]|0)+(c[j+1310736+(m<<2)>>2]|0);k=l<<1;g=j+655376+(k<<3)|0;h[g>>3]=+h[g>>3]+ +(c[j+1310736+(m+1<<2)>>2]|0);k=j+655376+((k|1)<<3)|0;h[k>>3]=+h[k>>3]+ +(c[j+1310736+(m+2<<2)>>2]|0);l=l<<2;k=j+131084+(l<<2)|0;g=c[j+1310736+(m+3<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;k=j+131084+((l|1)<<2)|0;g=c[j+1310736+(m+4<<2)>>2]|0;if((c[k>>2]|0)<(g|0))c[k>>2]=g;k=j+131084+((l|2)<<2)|0;g=c[j+1310736+(m+5<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;g=j+131084+((l|3)<<2)|0;k=c[j+1310736+(m+6<<2)>>2]|0;if((c[g>>2]|0)<(k|0))c[g>>2]=k;f=f+1|0}while((f|0)<(e|0))}if((c[a>>2]|0)>0){k=0;do{B=j+12+(k<<2)|0;C=k<<1;A=j+655376+(C<<3)|0;h[A>>3]=+h[A>>3]/+(c[B>>2]|0);C=j+655376+((C|1)<<3)|0;h[C>>3]=+h[C>>3]/+(c[B>>2]|0);k=k+1|0}while((k|0)<(c[a>>2]|0));k=0}else k=0}else k=0}i=D;return k|0}function Mc(a,e,f,g,j){a=a|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;D=i;i=i+16|0;z=D;B=(e|0)/2|0;C=(f|0)/2|0;n=c[j>>2]|0;y=C+-1|0;if((e|0)>1){k=0;l=n;m=n+(($(y,B)|0)<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(B|0))break;else{l=l+2|0;m=m+2|0}}}x=B+-1|0;if((f|0)>1){k=0;l=n;m=n+(x<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(C|0))break;else{l=l+(B<<1)|0;m=m+(B<<1)|0}}}m=j+1179664|0;u=0-B|0;s=1-B|0;t=~B;r=e+4|0;a:do if((y|0)>1){v=(x|0)>1;w=1;l=a+((e<<1)+2)|0;f=n+(B+1<<1)|0;k=0;b:while(1){if(v){q=1;p=f;o=k;while(1){do if((d[l>>0]|0|0)>(g|0)){k=b[p+(u<<1)>>1]|0;if(k<<16>>16>0){b[p>>1]=k;k=(k<<16>>16)*7|0;n=j+1310736+(k+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=j+1310736+(k+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+q;n=j+1310736+(k+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+w;c[j+1310736+(k+-1<<2)>>2]=w;k=o;break}a=b[p+(s<<1)>>1]|0;e=a<<16>>16;k=b[p+(t<<1)>>1]|0;n=k<<16>>16;f=k<<16>>16>0;if(a<<16>>16<=0){if(f){b[p>>1]=k;k=n*7|0;f=j+1310736+(k+-7<<2)|0;c[f>>2]=(c[f>>2]|0)+1;f=j+1310736+(k+-6<<2)|0;c[f>>2]=(c[f>>2]|0)+q;f=j+1310736+(k+-5<<2)|0;c[f>>2]=(c[f>>2]|0)+w;f=j+1310736+(k+-3<<2)|0;if((c[f>>2]|0)<(q|0))c[f>>2]=q;c[j+1310736+(k+-1<<2)>>2]=w;k=o;break}k=b[p+-2>>1]|0;if(k<<16>>16>0){b[p>>1]=k;k=(k<<16>>16)*7|0;n=j+1310736+(k+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=j+1310736+(k+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+q;n=j+1310736+(k+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+w;k=j+1310736+(k+-3<<2)|0;if((c[k>>2]|0)>=(q|0)){k=o;break}c[k>>2]=q;k=o;break}else{k=o+1|0;if((o|0)>32767)break b;b[p>>1]=k;c[j+1179664+(o<<2)>>2]=k<<16>>16;o=o*7|0;c[j+1310736+(o<<2)>>2]=1;c[j+1310736+(o+1<<2)>>2]=q;c[j+1310736+(o+2<<2)>>2]=w;c[j+1310736+(o+3<<2)>>2]=q;c[j+1310736+(o+4<<2)>>2]=q;c[j+1310736+(o+5<<2)>>2]=w;c[j+1310736+(o+6<<2)>>2]=w;break}}if(f){k=c[j+1179664+(e+-1<<2)>>2]|0;e=c[j+1179664+(n+-1<<2)>>2]|0;if((k|0)>(e|0)){b[p>>1]=e;if((o|0)>0){f=0;a=m;while(1){if((c[a>>2]|0)==(k|0))c[a>>2]=e;f=f+1|0;if((f|0)>=(o|0)){k=e;break}else a=a+4|0}}else k=e}else{b[p>>1]=k;if((k|0)<(e|0)&(o|0)>0){f=0;a=m;while(1){if((c[a>>2]|0)==(e|0))c[a>>2]=k;f=f+1|0;if((f|0)>=(o|0))break;else a=a+4|0}}}k=(k<<16>>16)*7|0;n=j+1310736+(k+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=j+1310736+(k+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+q;n=j+1310736+(k+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+w;c[j+1310736+(k+-1<<2)>>2]=w;k=o;break}f=b[p+-2>>1]|0;if(f<<16>>16<=0){b[p>>1]=a;k=e*7|0;f=j+1310736+(k+-7<<2)|0;c[f>>2]=(c[f>>2]|0)+1;f=j+1310736+(k+-6<<2)|0;c[f>>2]=(c[f>>2]|0)+q;f=j+1310736+(k+-5<<2)|0;c[f>>2]=(c[f>>2]|0)+w;f=j+1310736+(k+-4<<2)|0;if((c[f>>2]|0)>(q|0))c[f>>2]=q;c[j+1310736+(k+-1<<2)>>2]=w;k=o;break}k=c[j+1179664+(e+-1<<2)>>2]|0;e=c[j+1179664+((f<<16>>16)+-1<<2)>>2]|0;if((k|0)>(e|0)){b[p>>1]=e;if((o|0)>0){f=0;a=m;while(1){if((c[a>>2]|0)==(k|0))c[a>>2]=e;f=f+1|0;if((f|0)>=(o|0)){k=e;break}else a=a+4|0}}else k=e}else{b[p>>1]=k;if((k|0)<(e|0)&(o|0)>0){f=0;a=m;while(1){if((c[a>>2]|0)==(e|0))c[a>>2]=k;f=f+1|0;if((f|0)>=(o|0))break;else a=a+4|0}}}k=(k<<16>>16)*7|0;n=j+1310736+(k+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=j+1310736+(k+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+q;k=j+1310736+(k+-5<<2)|0;c[k>>2]=(c[k>>2]|0)+w;k=o}else{b[p>>1]=0;k=o}while(0);q=q+1|0;l=l+2|0;f=p+2|0;if((q|0)>=(x|0))break;else{p=f;o=k}}}w=w+1|0;if((w|0)>=(y|0)){n=k;A=52;break a}else{l=l+r|0;f=f+4|0}}Me(3,3904,z);k=-1}else{n=0;A=52}while(0);if((A|0)==52){a=j+12|0;if((n|0)<1)l=1;else{f=1;l=1;while(1){k=c[m>>2]|0;if((k|0)==(f|0)){k=l;l=l+1|0}else k=c[j+1179664+(k+-1<<2)>>2]|0;c[m>>2]=k;if((f|0)<(n|0)){f=f+1|0;m=m+4|0}else break}}e=j+8|0;k=l+-1|0;c[e>>2]=k;if(k){ek(a|0,0,k<<2|0)|0;ek(j+655376|0,0,k<<4|0)|0;if((l|0)>1){k=0;do{A=k<<2;c[j+131084+(A<<2)>>2]=B;c[j+131084+((A|1)<<2)>>2]=0;c[j+131084+((A|2)<<2)>>2]=C;c[j+131084+((A|3)<<2)>>2]=0;k=k+1|0}while((k|0)<(c[e>>2]|0))}if((n|0)>0){a=0;do{m=(c[j+1179664+(a<<2)>>2]|0)+-1|0;f=a*7|0;k=j+12+(m<<2)|0;c[k>>2]=(c[k>>2]|0)+(c[j+1310736+(f<<2)>>2]|0);k=m<<1;l=j+655376+(k<<3)|0;h[l>>3]=+h[l>>3]+ +(c[j+1310736+(f+1<<2)>>2]|0);k=j+655376+((k|1)<<3)|0;h[k>>3]=+h[k>>3]+ +(c[j+1310736+(f+2<<2)>>2]|0);m=m<<2;k=j+131084+(m<<2)|0;l=c[j+1310736+(f+3<<2)>>2]|0;if((c[k>>2]|0)>(l|0))c[k>>2]=l;k=j+131084+((m|1)<<2)|0;l=c[j+1310736+(f+4<<2)>>2]|0;if((c[k>>2]|0)<(l|0))c[k>>2]=l;k=j+131084+((m|2)<<2)|0;l=c[j+1310736+(f+5<<2)>>2]|0;if((c[k>>2]|0)>(l|0))c[k>>2]=l;l=j+131084+((m|3)<<2)|0;k=c[j+1310736+(f+6<<2)>>2]|0;if((c[l>>2]|0)<(k|0))c[l>>2]=k;a=a+1|0}while((a|0)<(n|0))}if((c[e>>2]|0)>0){k=0;do{B=j+12+(k<<2)|0;C=k<<1;A=j+655376+(C<<3)|0;h[A>>3]=+h[A>>3]/+(c[B>>2]|0);C=j+655376+((C|1)<<3)|0;h[C>>3]=+h[C>>3]/+(c[B>>2]|0);k=k+1|0}while((k|0)<(c[e>>2]|0));k=0}else k=0}else k=0}i=D;return k|0}function Nc(a,e,f,g,j){a=a|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;D=i;i=i+16|0;z=D;B=(e|0)/2|0;C=(f|0)/2|0;n=c[j>>2]|0;y=C+-1|0;if((e|0)>1){k=0;l=n;m=n+(($(y,B)|0)<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(B|0))break;else{l=l+2|0;m=m+2|0}}}x=B+-1|0;if((f|0)>1){k=0;l=n;m=n+(x<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(C|0))break;else{l=l+(B<<1)|0;m=m+(B<<1)|0}}}m=j+1179664|0;u=0-B|0;s=1-B|0;t=~B;r=(e<<1)+8|0;a:do if((y|0)>1){v=(x|0)>1;w=1;l=a+((e<<2)+4)|0;f=n+(B+1<<1)|0;k=0;b:while(1){if(v){q=1;p=f;o=k;while(1){do if((d[l+1>>0]|0|0)>(g|0)){k=b[p+(u<<1)>>1]|0;if(k<<16>>16>0){b[p>>1]=k;k=(k<<16>>16)*7|0;n=j+1310736+(k+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=j+1310736+(k+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+q;n=j+1310736+(k+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+w;c[j+1310736+(k+-1<<2)>>2]=w;k=o;break}a=b[p+(s<<1)>>1]|0;e=a<<16>>16;k=b[p+(t<<1)>>1]|0;n=k<<16>>16;f=k<<16>>16>0;if(a<<16>>16<=0){if(f){b[p>>1]=k;k=n*7|0;f=j+1310736+(k+-7<<2)|0;c[f>>2]=(c[f>>2]|0)+1;f=j+1310736+(k+-6<<2)|0;c[f>>2]=(c[f>>2]|0)+q;f=j+1310736+(k+-5<<2)|0;c[f>>2]=(c[f>>2]|0)+w;f=j+1310736+(k+-3<<2)|0;if((c[f>>2]|0)<(q|0))c[f>>2]=q;c[j+1310736+(k+-1<<2)>>2]=w;k=o;break}k=b[p+-2>>1]|0;if(k<<16>>16>0){b[p>>1]=k;k=(k<<16>>16)*7|0;n=j+1310736+(k+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=j+1310736+(k+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+q;n=j+1310736+(k+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+w;k=j+1310736+(k+-3<<2)|0;if((c[k>>2]|0)>=(q|0)){k=o;break}c[k>>2]=q;k=o;break}else{k=o+1|0;if((o|0)>32767)break b;b[p>>1]=k;c[j+1179664+(o<<2)>>2]=k<<16>>16;o=o*7|0;c[j+1310736+(o<<2)>>2]=1;c[j+1310736+(o+1<<2)>>2]=q;c[j+1310736+(o+2<<2)>>2]=w;c[j+1310736+(o+3<<2)>>2]=q;c[j+1310736+(o+4<<2)>>2]=q;c[j+1310736+(o+5<<2)>>2]=w;c[j+1310736+(o+6<<2)>>2]=w;break}}if(f){k=c[j+1179664+(e+-1<<2)>>2]|0;e=c[j+1179664+(n+-1<<2)>>2]|0;if((k|0)>(e|0)){b[p>>1]=e;if((o|0)>0){f=0;a=m;while(1){if((c[a>>2]|0)==(k|0))c[a>>2]=e;f=f+1|0;if((f|0)>=(o|0)){k=e;break}else a=a+4|0}}else k=e}else{b[p>>1]=k;if((k|0)<(e|0)&(o|0)>0){f=0;a=m;while(1){if((c[a>>2]|0)==(e|0))c[a>>2]=k;f=f+1|0;if((f|0)>=(o|0))break;else a=a+4|0}}}k=(k<<16>>16)*7|0;n=j+1310736+(k+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=j+1310736+(k+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+q;n=j+1310736+(k+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+w;c[j+1310736+(k+-1<<2)>>2]=w;k=o;break}f=b[p+-2>>1]|0;if(f<<16>>16<=0){b[p>>1]=a;k=e*7|0;f=j+1310736+(k+-7<<2)|0;c[f>>2]=(c[f>>2]|0)+1;f=j+1310736+(k+-6<<2)|0;c[f>>2]=(c[f>>2]|0)+q;f=j+1310736+(k+-5<<2)|0;c[f>>2]=(c[f>>2]|0)+w;f=j+1310736+(k+-4<<2)|0;if((c[f>>2]|0)>(q|0))c[f>>2]=q;c[j+1310736+(k+-1<<2)>>2]=w;k=o;break}k=c[j+1179664+(e+-1<<2)>>2]|0;e=c[j+1179664+((f<<16>>16)+-1<<2)>>2]|0;if((k|0)>(e|0)){b[p>>1]=e;if((o|0)>0){f=0;a=m;while(1){if((c[a>>2]|0)==(k|0))c[a>>2]=e;f=f+1|0;if((f|0)>=(o|0)){k=e;break}else a=a+4|0}}else k=e}else{b[p>>1]=k;if((k|0)<(e|0)&(o|0)>0){f=0;a=m;while(1){if((c[a>>2]|0)==(e|0))c[a>>2]=k;f=f+1|0;if((f|0)>=(o|0))break;else a=a+4|0}}}k=(k<<16>>16)*7|0;n=j+1310736+(k+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=j+1310736+(k+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+q;k=j+1310736+(k+-5<<2)|0;c[k>>2]=(c[k>>2]|0)+w;k=o}else{b[p>>1]=0;k=o}while(0);q=q+1|0;l=l+4|0;f=p+2|0;if((q|0)>=(x|0))break;else{p=f;o=k}}}w=w+1|0;if((w|0)>=(y|0)){n=k;A=52;break a}else{l=l+r|0;f=f+4|0}}Me(3,3904,z);k=-1}else{n=0;A=52}while(0);if((A|0)==52){a=j+12|0;if((n|0)<1)l=1;else{f=1;l=1;while(1){k=c[m>>2]|0;if((k|0)==(f|0)){k=l;l=l+1|0}else k=c[j+1179664+(k+-1<<2)>>2]|0;c[m>>2]=k;if((f|0)<(n|0)){f=f+1|0;m=m+4|0}else break}}e=j+8|0;k=l+-1|0;c[e>>2]=k;if(k){ek(a|0,0,k<<2|0)|0;ek(j+655376|0,0,k<<4|0)|0;if((l|0)>1){k=0;do{A=k<<2;c[j+131084+(A<<2)>>2]=B;c[j+131084+((A|1)<<2)>>2]=0;c[j+131084+((A|2)<<2)>>2]=C;c[j+131084+((A|3)<<2)>>2]=0;k=k+1|0}while((k|0)<(c[e>>2]|0))}if((n|0)>0){a=0;do{m=(c[j+1179664+(a<<2)>>2]|0)+-1|0;f=a*7|0;k=j+12+(m<<2)|0;c[k>>2]=(c[k>>2]|0)+(c[j+1310736+(f<<2)>>2]|0);k=m<<1;l=j+655376+(k<<3)|0;h[l>>3]=+h[l>>3]+ +(c[j+1310736+(f+1<<2)>>2]|0);k=j+655376+((k|1)<<3)|0;h[k>>3]=+h[k>>3]+ +(c[j+1310736+(f+2<<2)>>2]|0);m=m<<2;k=j+131084+(m<<2)|0;l=c[j+1310736+(f+3<<2)>>2]|0;if((c[k>>2]|0)>(l|0))c[k>>2]=l;k=j+131084+((m|1)<<2)|0;l=c[j+1310736+(f+4<<2)>>2]|0;if((c[k>>2]|0)<(l|0))c[k>>2]=l;k=j+131084+((m|2)<<2)|0;l=c[j+1310736+(f+5<<2)>>2]|0;if((c[k>>2]|0)>(l|0))c[k>>2]=l;l=j+131084+((m|3)<<2)|0;k=c[j+1310736+(f+6<<2)>>2]|0;if((c[l>>2]|0)<(k|0))c[l>>2]=k;a=a+1|0}while((a|0)<(n|0))}if((c[e>>2]|0)>0){k=0;do{B=j+12+(k<<2)|0;C=k<<1;A=j+655376+(C<<3)|0;h[A>>3]=+h[A>>3]/+(c[B>>2]|0);C=j+655376+((C|1)<<3)|0;h[C>>3]=+h[C>>3]/+(c[B>>2]|0);k=k+1|0}while((k|0)<(c[e>>2]|0));k=0}else k=0}else k=0}i=D;return k|0}function Oc(a,e,f,g,j){a=a|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;D=i;i=i+16|0;z=D;B=(e|0)/2|0;C=(f|0)/2|0;n=c[j>>2]|0;y=C+-1|0;if((e|0)>1){k=0;l=n;m=n+(($(y,B)|0)<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(B|0))break;else{l=l+2|0;m=m+2|0}}}x=B+-1|0;if((f|0)>1){k=0;l=n;m=n+(x<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(C|0))break;else{l=l+(B<<1)|0;m=m+(B<<1)|0}}}m=j+1179664|0;u=0-B|0;s=1-B|0;t=~B;r=(e<<1)+8|0;a:do if((y|0)>1){v=(x|0)>1;w=1;l=a+((e<<2)+4)|0;f=n+(B+1<<1)|0;k=0;b:while(1){if(v){q=1;p=f;o=k;while(1){do if((d[l>>0]|0|0)>(g|0)){k=b[p+(u<<1)>>1]|0;if(k<<16>>16>0){b[p>>1]=k;k=(k<<16>>16)*7|0;n=j+1310736+(k+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=j+1310736+(k+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+q;n=j+1310736+(k+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+w;c[j+1310736+(k+-1<<2)>>2]=w;k=o;break}a=b[p+(s<<1)>>1]|0;e=a<<16>>16;k=b[p+(t<<1)>>1]|0;n=k<<16>>16;f=k<<16>>16>0;if(a<<16>>16<=0){if(f){b[p>>1]=k;k=n*7|0;f=j+1310736+(k+-7<<2)|0;c[f>>2]=(c[f>>2]|0)+1;f=j+1310736+(k+-6<<2)|0;c[f>>2]=(c[f>>2]|0)+q;f=j+1310736+(k+-5<<2)|0;c[f>>2]=(c[f>>2]|0)+w;f=j+1310736+(k+-3<<2)|0;if((c[f>>2]|0)<(q|0))c[f>>2]=q;c[j+1310736+(k+-1<<2)>>2]=w;k=o;break}k=b[p+-2>>1]|0;if(k<<16>>16>0){b[p>>1]=k;k=(k<<16>>16)*7|0;n=j+1310736+(k+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=j+1310736+(k+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+q;n=j+1310736+(k+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+w;k=j+1310736+(k+-3<<2)|0;if((c[k>>2]|0)>=(q|0)){k=o;break}c[k>>2]=q;k=o;break}else{k=o+1|0;if((o|0)>32767)break b;b[p>>1]=k;c[j+1179664+(o<<2)>>2]=k<<16>>16;o=o*7|0;c[j+1310736+(o<<2)>>2]=1;c[j+1310736+(o+1<<2)>>2]=q;c[j+1310736+(o+2<<2)>>2]=w;c[j+1310736+(o+3<<2)>>2]=q;c[j+1310736+(o+4<<2)>>2]=q;c[j+1310736+(o+5<<2)>>2]=w;c[j+1310736+(o+6<<2)>>2]=w;break}}if(f){k=c[j+1179664+(e+-1<<2)>>2]|0;e=c[j+1179664+(n+-1<<2)>>2]|0;if((k|0)>(e|0)){b[p>>1]=e;if((o|0)>0){f=0;a=m;while(1){if((c[a>>2]|0)==(k|0))c[a>>2]=e;f=f+1|0;if((f|0)>=(o|0)){k=e;break}else a=a+4|0}}else k=e}else{b[p>>1]=k;if((k|0)<(e|0)&(o|0)>0){f=0;a=m;while(1){if((c[a>>2]|0)==(e|0))c[a>>2]=k;f=f+1|0;if((f|0)>=(o|0))break;else a=a+4|0}}}k=(k<<16>>16)*7|0;n=j+1310736+(k+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=j+1310736+(k+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+q;n=j+1310736+(k+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+w;c[j+1310736+(k+-1<<2)>>2]=w;k=o;break}f=b[p+-2>>1]|0;if(f<<16>>16<=0){b[p>>1]=a;k=e*7|0;f=j+1310736+(k+-7<<2)|0;c[f>>2]=(c[f>>2]|0)+1;f=j+1310736+(k+-6<<2)|0;c[f>>2]=(c[f>>2]|0)+q;f=j+1310736+(k+-5<<2)|0;c[f>>2]=(c[f>>2]|0)+w;f=j+1310736+(k+-4<<2)|0;if((c[f>>2]|0)>(q|0))c[f>>2]=q;c[j+1310736+(k+-1<<2)>>2]=w;k=o;break}k=c[j+1179664+(e+-1<<2)>>2]|0;e=c[j+1179664+((f<<16>>16)+-1<<2)>>2]|0;if((k|0)>(e|0)){b[p>>1]=e;if((o|0)>0){f=0;a=m;while(1){if((c[a>>2]|0)==(k|0))c[a>>2]=e;f=f+1|0;if((f|0)>=(o|0)){k=e;break}else a=a+4|0}}else k=e}else{b[p>>1]=k;if((k|0)<(e|0)&(o|0)>0){f=0;a=m;while(1){if((c[a>>2]|0)==(e|0))c[a>>2]=k;f=f+1|0;if((f|0)>=(o|0))break;else a=a+4|0}}}k=(k<<16>>16)*7|0;n=j+1310736+(k+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=j+1310736+(k+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+q;k=j+1310736+(k+-5<<2)|0;c[k>>2]=(c[k>>2]|0)+w;k=o}else{b[p>>1]=0;k=o}while(0);q=q+1|0;l=l+4|0;f=p+2|0;if((q|0)>=(x|0))break;else{p=f;o=k}}}w=w+1|0;if((w|0)>=(y|0)){n=k;A=52;break a}else{l=l+r|0;f=f+4|0}}Me(3,3904,z);k=-1}else{n=0;A=52}while(0);if((A|0)==52){a=j+12|0;if((n|0)<1)l=1;else{f=1;l=1;while(1){k=c[m>>2]|0;if((k|0)==(f|0)){k=l;l=l+1|0}else k=c[j+1179664+(k+-1<<2)>>2]|0;c[m>>2]=k;if((f|0)<(n|0)){f=f+1|0;m=m+4|0}else break}}e=j+8|0;k=l+-1|0;c[e>>2]=k;if(k){ek(a|0,0,k<<2|0)|0;ek(j+655376|0,0,k<<4|0)|0;if((l|0)>1){k=0;do{A=k<<2;c[j+131084+(A<<2)>>2]=B;c[j+131084+((A|1)<<2)>>2]=0;c[j+131084+((A|2)<<2)>>2]=C;c[j+131084+((A|3)<<2)>>2]=0;k=k+1|0}while((k|0)<(c[e>>2]|0))}if((n|0)>0){a=0;do{m=(c[j+1179664+(a<<2)>>2]|0)+-1|0;f=a*7|0;k=j+12+(m<<2)|0;c[k>>2]=(c[k>>2]|0)+(c[j+1310736+(f<<2)>>2]|0);k=m<<1;l=j+655376+(k<<3)|0;h[l>>3]=+h[l>>3]+ +(c[j+1310736+(f+1<<2)>>2]|0);k=j+655376+((k|1)<<3)|0;h[k>>3]=+h[k>>3]+ +(c[j+1310736+(f+2<<2)>>2]|0);m=m<<2;k=j+131084+(m<<2)|0;l=c[j+1310736+(f+3<<2)>>2]|0;if((c[k>>2]|0)>(l|0))c[k>>2]=l;k=j+131084+((m|1)<<2)|0;l=c[j+1310736+(f+4<<2)>>2]|0;if((c[k>>2]|0)<(l|0))c[k>>2]=l;k=j+131084+((m|2)<<2)|0;l=c[j+1310736+(f+5<<2)>>2]|0;if((c[k>>2]|0)>(l|0))c[k>>2]=l;l=j+131084+((m|3)<<2)|0;k=c[j+1310736+(f+6<<2)>>2]|0;if((c[l>>2]|0)<(k|0))c[l>>2]=k;a=a+1|0}while((a|0)<(n|0))}if((c[e>>2]|0)>0){k=0;do{B=j+12+(k<<2)|0;C=k<<1;A=j+655376+(C<<3)|0;h[A>>3]=+h[A>>3]/+(c[B>>2]|0);C=j+655376+((C|1)<<3)|0;h[C>>3]=+h[C>>3]/+(c[B>>2]|0);k=k+1|0}while((k|0)<(c[e>>2]|0));k=0}else k=0}else k=0}i=D;return k|0}function Pc(a,e,f,g,j){a=a|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;C=i;i=i+16|0;A=C;n=c[j>>2]|0;z=f+-1|0;if((e|0)>0){k=0;l=n;m=n+(($(z,e)|0)<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(e|0))break;else{l=l+2|0;m=m+2|0}}}y=g*3|0;x=e+-1|0;if((f|0)>0){k=0;g=n;l=n+(x<<1)|0;while(1){b[l>>1]=0;b[g>>1]=0;k=k+1|0;if((k|0)>=(f|0))break;else{g=g+(e<<1)|0;l=l+(e<<1)|0}}}l=j+1179664|0;k=e+1|0;u=0-e|0;s=1-e|0;t=~e;a:do if((z|0)>1){v=(x|0)>1;w=1;g=a+(k*3|0)|0;m=n+(k<<1)|0;k=0;b:while(1){if(v){r=1;q=m;p=k;while(1){do if(((d[g+1>>0]|0)+(d[g>>0]|0)+(d[g+2>>0]|0)|0)>(y|0)){k=b[q+(u<<1)>>1]|0;if(k<<16>>16>0){b[q>>1]=k;k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=j+1310736+(k+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+w;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}a=b[q+(s<<1)>>1]|0;n=a<<16>>16;k=b[q+(t<<1)>>1]|0;o=k<<16>>16;m=k<<16>>16>0;if(a<<16>>16<=0){if(m){b[q>>1]=k;k=o*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+r;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+w;m=j+1310736+(k+-3<<2)|0;if((c[m>>2]|0)<(r|0))c[m>>2]=r;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}k=b[q+-2>>1]|0;if(k<<16>>16>0){b[q>>1]=k;k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=j+1310736+(k+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+w;k=j+1310736+(k+-3<<2)|0;if((c[k>>2]|0)>=(r|0)){k=p;break}c[k>>2]=r;k=p;break}else{k=p+1|0;if((p|0)>32767)break b;b[q>>1]=k;c[j+1179664+(p<<2)>>2]=k<<16>>16;p=p*7|0;c[j+1310736+(p<<2)>>2]=1;c[j+1310736+(p+1<<2)>>2]=r;c[j+1310736+(p+2<<2)>>2]=w;c[j+1310736+(p+3<<2)>>2]=r;c[j+1310736+(p+4<<2)>>2]=r;c[j+1310736+(p+5<<2)>>2]=w;c[j+1310736+(p+6<<2)>>2]=w;break}}if(m){k=c[j+1179664+(n+-1<<2)>>2]|0;n=c[j+1179664+(o+-1<<2)>>2]|0;if((k|0)>(n|0)){b[q>>1]=n;if((p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(k|0))c[a>>2]=n;m=m+1|0;if((m|0)>=(p|0)){k=n;break}else a=a+4|0}}else k=n}else{b[q>>1]=k;if((k|0)<(n|0)&(p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(n|0))c[a>>2]=k;m=m+1|0;if((m|0)>=(p|0))break;else a=a+4|0}}}k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=j+1310736+(k+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+w;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}m=b[q+-2>>1]|0;if(m<<16>>16<=0){b[q>>1]=a;k=n*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+r;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+w;m=j+1310736+(k+-4<<2)|0;if((c[m>>2]|0)>(r|0))c[m>>2]=r;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}k=c[j+1179664+(n+-1<<2)>>2]|0;n=c[j+1179664+((m<<16>>16)+-1<<2)>>2]|0;if((k|0)>(n|0)){b[q>>1]=n;if((p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(k|0))c[a>>2]=n;m=m+1|0;if((m|0)>=(p|0)){k=n;break}else a=a+4|0}}else k=n}else{b[q>>1]=k;if((k|0)<(n|0)&(p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(n|0))c[a>>2]=k;m=m+1|0;if((m|0)>=(p|0))break;else a=a+4|0}}}k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;k=j+1310736+(k+-5<<2)|0;c[k>>2]=(c[k>>2]|0)+w;k=p}else{b[q>>1]=0;k=p}while(0);r=r+1|0;g=g+3|0;m=q+2|0;if((r|0)>=(x|0))break;else{q=m;p=k}}}w=w+1|0;if((w|0)>=(z|0)){o=k;B=52;break a}else{g=g+6|0;m=m+4|0}}Me(3,3904,A);k=-1}else{o=0;B=52}while(0);if((B|0)==52){a=j+12|0;if((o|0)<1)g=1;else{m=1;g=1;while(1){k=c[l>>2]|0;if((k|0)==(m|0)){k=g;g=g+1|0}else k=c[j+1179664+(k+-1<<2)>>2]|0;c[l>>2]=k;if((m|0)<(o|0)){m=m+1|0;l=l+4|0}else break}}n=j+8|0;k=g+-1|0;c[n>>2]=k;if(k){ek(a|0,0,k<<2|0)|0;ek(j+655376|0,0,k<<4|0)|0;if((g|0)>1){k=0;do{B=k<<2;c[j+131084+(B<<2)>>2]=e;c[j+131084+((B|1)<<2)>>2]=0;c[j+131084+((B|2)<<2)>>2]=f;c[j+131084+((B|3)<<2)>>2]=0;k=k+1|0}while((k|0)<(c[n>>2]|0))}if((o|0)>0){a=0;do{l=(c[j+1179664+(a<<2)>>2]|0)+-1|0;m=a*7|0;k=j+12+(l<<2)|0;c[k>>2]=(c[k>>2]|0)+(c[j+1310736+(m<<2)>>2]|0);k=l<<1;g=j+655376+(k<<3)|0;h[g>>3]=+h[g>>3]+ +(c[j+1310736+(m+1<<2)>>2]|0);k=j+655376+((k|1)<<3)|0;h[k>>3]=+h[k>>3]+ +(c[j+1310736+(m+2<<2)>>2]|0);l=l<<2;k=j+131084+(l<<2)|0;g=c[j+1310736+(m+3<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;k=j+131084+((l|1)<<2)|0;g=c[j+1310736+(m+4<<2)>>2]|0;if((c[k>>2]|0)<(g|0))c[k>>2]=g;k=j+131084+((l|2)<<2)|0;g=c[j+1310736+(m+5<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;g=j+131084+((l|3)<<2)|0;k=c[j+1310736+(m+6<<2)>>2]|0;if((c[g>>2]|0)<(k|0))c[g>>2]=k;a=a+1|0}while((a|0)<(o|0))}if((c[n>>2]|0)>0){k=0;do{e=j+12+(k<<2)|0;f=k<<1;B=j+655376+(f<<3)|0;h[B>>3]=+h[B>>3]/+(c[e>>2]|0);f=j+655376+((f|1)<<3)|0;h[f>>3]=+h[f>>3]/+(c[e>>2]|0);k=k+1|0}while((k|0)<(c[n>>2]|0));k=0}else k=0}else k=0}i=C;return k|0}function Qc(a,e,f,g,j){a=a|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;C=i;i=i+16|0;A=C;n=c[j>>2]|0;z=f+-1|0;if((e|0)>0){k=0;l=n;m=n+(($(z,e)|0)<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(e|0))break;else{l=l+2|0;m=m+2|0}}}y=g*3|0;x=e+-1|0;if((f|0)>0){k=0;g=n;l=n+(x<<1)|0;while(1){b[l>>1]=0;b[g>>1]=0;k=k+1|0;if((k|0)>=(f|0))break;else{g=g+(e<<1)|0;l=l+(e<<1)|0}}}l=j+1179664|0;k=e+1|0;u=0-e|0;s=1-e|0;t=~e;a:do if((z|0)>1){v=(x|0)>1;w=1;g=a+(k<<1)|0;m=n+(k<<1)|0;k=0;b:while(1){if(v){r=1;q=m;p=k;while(1){n=d[g>>0]|0;o=d[g+1>>0]|0;do if(((n&248)+10+(n<<5&224)+(o>>>3&28)+(o<<3&248)|0)>(y|0)){k=b[q+(u<<1)>>1]|0;if(k<<16>>16>0){b[q>>1]=k;k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=j+1310736+(k+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+w;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}a=b[q+(s<<1)>>1]|0;n=a<<16>>16;k=b[q+(t<<1)>>1]|0;o=k<<16>>16;m=k<<16>>16>0;if(a<<16>>16<=0){if(m){b[q>>1]=k;k=o*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+r;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+w;m=j+1310736+(k+-3<<2)|0;if((c[m>>2]|0)<(r|0))c[m>>2]=r;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}k=b[q+-2>>1]|0;if(k<<16>>16>0){b[q>>1]=k;k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=j+1310736+(k+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+w;k=j+1310736+(k+-3<<2)|0;if((c[k>>2]|0)>=(r|0)){k=p;break}c[k>>2]=r;k=p;break}else{k=p+1|0;if((p|0)>32767)break b;b[q>>1]=k;c[j+1179664+(p<<2)>>2]=k<<16>>16;p=p*7|0;c[j+1310736+(p<<2)>>2]=1;c[j+1310736+(p+1<<2)>>2]=r;c[j+1310736+(p+2<<2)>>2]=w;c[j+1310736+(p+3<<2)>>2]=r;c[j+1310736+(p+4<<2)>>2]=r;c[j+1310736+(p+5<<2)>>2]=w;c[j+1310736+(p+6<<2)>>2]=w;break}}if(m){k=c[j+1179664+(n+-1<<2)>>2]|0;n=c[j+1179664+(o+-1<<2)>>2]|0;if((k|0)>(n|0)){b[q>>1]=n;if((p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(k|0))c[a>>2]=n;m=m+1|0;if((m|0)>=(p|0)){k=n;break}else a=a+4|0}}else k=n}else{b[q>>1]=k;if((k|0)<(n|0)&(p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(n|0))c[a>>2]=k;m=m+1|0;if((m|0)>=(p|0))break;else a=a+4|0}}}k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=j+1310736+(k+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+w;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}m=b[q+-2>>1]|0;if(m<<16>>16<=0){b[q>>1]=a;k=n*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+r;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+w;m=j+1310736+(k+-4<<2)|0;if((c[m>>2]|0)>(r|0))c[m>>2]=r;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}k=c[j+1179664+(n+-1<<2)>>2]|0;n=c[j+1179664+((m<<16>>16)+-1<<2)>>2]|0;if((k|0)>(n|0)){b[q>>1]=n;if((p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(k|0))c[a>>2]=n;m=m+1|0;if((m|0)>=(p|0)){k=n;break}else a=a+4|0}}else k=n}else{b[q>>1]=k;if((k|0)<(n|0)&(p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(n|0))c[a>>2]=k;m=m+1|0;if((m|0)>=(p|0))break;else a=a+4|0}}}k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;k=j+1310736+(k+-5<<2)|0;c[k>>2]=(c[k>>2]|0)+w;k=p}else{b[q>>1]=0;k=p}while(0);r=r+1|0;g=g+2|0;m=q+2|0;if((r|0)>=(x|0))break;else{q=m;p=k}}}w=w+1|0;if((w|0)>=(z|0)){o=k;B=52;break a}else{g=g+4|0;m=m+4|0}}Me(3,3904,A);k=-1}else{o=0;B=52}while(0);if((B|0)==52){a=j+12|0;if((o|0)<1)g=1;else{m=1;g=1;while(1){k=c[l>>2]|0;if((k|0)==(m|0)){k=g;g=g+1|0}else k=c[j+1179664+(k+-1<<2)>>2]|0;c[l>>2]=k;if((m|0)<(o|0)){m=m+1|0;l=l+4|0}else break}}n=j+8|0;k=g+-1|0;c[n>>2]=k;if(k){ek(a|0,0,k<<2|0)|0;ek(j+655376|0,0,k<<4|0)|0;if((g|0)>1){k=0;do{B=k<<2;c[j+131084+(B<<2)>>2]=e;c[j+131084+((B|1)<<2)>>2]=0;c[j+131084+((B|2)<<2)>>2]=f;c[j+131084+((B|3)<<2)>>2]=0;k=k+1|0}while((k|0)<(c[n>>2]|0))}if((o|0)>0){a=0;do{l=(c[j+1179664+(a<<2)>>2]|0)+-1|0;m=a*7|0;k=j+12+(l<<2)|0;c[k>>2]=(c[k>>2]|0)+(c[j+1310736+(m<<2)>>2]|0);k=l<<1;g=j+655376+(k<<3)|0;h[g>>3]=+h[g>>3]+ +(c[j+1310736+(m+1<<2)>>2]|0);k=j+655376+((k|1)<<3)|0;h[k>>3]=+h[k>>3]+ +(c[j+1310736+(m+2<<2)>>2]|0);l=l<<2;k=j+131084+(l<<2)|0;g=c[j+1310736+(m+3<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;k=j+131084+((l|1)<<2)|0;g=c[j+1310736+(m+4<<2)>>2]|0;if((c[k>>2]|0)<(g|0))c[k>>2]=g;k=j+131084+((l|2)<<2)|0;g=c[j+1310736+(m+5<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;g=j+131084+((l|3)<<2)|0;k=c[j+1310736+(m+6<<2)>>2]|0;if((c[g>>2]|0)<(k|0))c[g>>2]=k;a=a+1|0}while((a|0)<(o|0))}if((c[n>>2]|0)>0){k=0;do{e=j+12+(k<<2)|0;f=k<<1;B=j+655376+(f<<3)|0;h[B>>3]=+h[B>>3]/+(c[e>>2]|0);f=j+655376+((f|1)<<3)|0;h[f>>3]=+h[f>>3]/+(c[e>>2]|0);k=k+1|0}while((k|0)<(c[n>>2]|0));k=0}else k=0}else k=0}i=C;return k|0}function Rc(a,e,f,g,j){a=a|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;C=i;i=i+16|0;A=C;n=c[j>>2]|0;z=f+-1|0;if((e|0)>0){k=0;l=n;m=n+(($(z,e)|0)<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(e|0))break;else{l=l+2|0;m=m+2|0}}}y=g*3|0;x=e+-1|0;if((f|0)>0){k=0;g=n;l=n+(x<<1)|0;while(1){b[l>>1]=0;b[g>>1]=0;k=k+1|0;if((k|0)>=(f|0))break;else{g=g+(e<<1)|0;l=l+(e<<1)|0}}}l=j+1179664|0;k=e+1|0;u=0-e|0;s=1-e|0;t=~e;a:do if((z|0)>1){v=(x|0)>1;w=1;g=a+(k<<2)|0;m=n+(k<<1)|0;k=0;b:while(1){if(v){r=1;q=m;p=k;while(1){do if(((d[g+1>>0]|0)+(d[g>>0]|0)+(d[g+2>>0]|0)|0)>(y|0)){k=b[q+(u<<1)>>1]|0;if(k<<16>>16>0){b[q>>1]=k;k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=j+1310736+(k+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+w;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}a=b[q+(s<<1)>>1]|0;n=a<<16>>16;k=b[q+(t<<1)>>1]|0;o=k<<16>>16;m=k<<16>>16>0;if(a<<16>>16<=0){if(m){b[q>>1]=k;k=o*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+r;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+w;m=j+1310736+(k+-3<<2)|0;if((c[m>>2]|0)<(r|0))c[m>>2]=r;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}k=b[q+-2>>1]|0;if(k<<16>>16>0){b[q>>1]=k;k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=j+1310736+(k+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+w;k=j+1310736+(k+-3<<2)|0;if((c[k>>2]|0)>=(r|0)){k=p;break}c[k>>2]=r;k=p;break}else{k=p+1|0;if((p|0)>32767)break b;b[q>>1]=k;c[j+1179664+(p<<2)>>2]=k<<16>>16;p=p*7|0;c[j+1310736+(p<<2)>>2]=1;c[j+1310736+(p+1<<2)>>2]=r;c[j+1310736+(p+2<<2)>>2]=w;c[j+1310736+(p+3<<2)>>2]=r;c[j+1310736+(p+4<<2)>>2]=r;c[j+1310736+(p+5<<2)>>2]=w;c[j+1310736+(p+6<<2)>>2]=w;break}}if(m){k=c[j+1179664+(n+-1<<2)>>2]|0;n=c[j+1179664+(o+-1<<2)>>2]|0;if((k|0)>(n|0)){b[q>>1]=n;if((p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(k|0))c[a>>2]=n;m=m+1|0;if((m|0)>=(p|0)){k=n;break}else a=a+4|0}}else k=n}else{b[q>>1]=k;if((k|0)<(n|0)&(p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(n|0))c[a>>2]=k;m=m+1|0;if((m|0)>=(p|0))break;else a=a+4|0}}}k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=j+1310736+(k+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+w;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}m=b[q+-2>>1]|0;if(m<<16>>16<=0){b[q>>1]=a;k=n*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+r;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+w;m=j+1310736+(k+-4<<2)|0;if((c[m>>2]|0)>(r|0))c[m>>2]=r;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}k=c[j+1179664+(n+-1<<2)>>2]|0;n=c[j+1179664+((m<<16>>16)+-1<<2)>>2]|0;if((k|0)>(n|0)){b[q>>1]=n;if((p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(k|0))c[a>>2]=n;m=m+1|0;if((m|0)>=(p|0)){k=n;break}else a=a+4|0}}else k=n}else{b[q>>1]=k;if((k|0)<(n|0)&(p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(n|0))c[a>>2]=k;m=m+1|0;if((m|0)>=(p|0))break;else a=a+4|0}}}k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;k=j+1310736+(k+-5<<2)|0;c[k>>2]=(c[k>>2]|0)+w;k=p}else{b[q>>1]=0;k=p}while(0);r=r+1|0;g=g+4|0;m=q+2|0;if((r|0)>=(x|0))break;else{q=m;p=k}}}w=w+1|0;if((w|0)>=(z|0)){o=k;B=52;break a}else{g=g+8|0;m=m+4|0}}Me(3,3904,A);k=-1}else{o=0;B=52}while(0);if((B|0)==52){a=j+12|0;if((o|0)<1)g=1;else{m=1;g=1;while(1){k=c[l>>2]|0;if((k|0)==(m|0)){k=g;g=g+1|0}else k=c[j+1179664+(k+-1<<2)>>2]|0;c[l>>2]=k;if((m|0)<(o|0)){m=m+1|0;l=l+4|0}else break}}n=j+8|0;k=g+-1|0;c[n>>2]=k;if(k){ek(a|0,0,k<<2|0)|0;ek(j+655376|0,0,k<<4|0)|0;if((g|0)>1){k=0;do{B=k<<2;c[j+131084+(B<<2)>>2]=e;c[j+131084+((B|1)<<2)>>2]=0;c[j+131084+((B|2)<<2)>>2]=f;c[j+131084+((B|3)<<2)>>2]=0;k=k+1|0}while((k|0)<(c[n>>2]|0))}if((o|0)>0){a=0;do{l=(c[j+1179664+(a<<2)>>2]|0)+-1|0;m=a*7|0;k=j+12+(l<<2)|0;c[k>>2]=(c[k>>2]|0)+(c[j+1310736+(m<<2)>>2]|0);k=l<<1;g=j+655376+(k<<3)|0;h[g>>3]=+h[g>>3]+ +(c[j+1310736+(m+1<<2)>>2]|0);k=j+655376+((k|1)<<3)|0;h[k>>3]=+h[k>>3]+ +(c[j+1310736+(m+2<<2)>>2]|0);l=l<<2;k=j+131084+(l<<2)|0;g=c[j+1310736+(m+3<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;k=j+131084+((l|1)<<2)|0;g=c[j+1310736+(m+4<<2)>>2]|0;if((c[k>>2]|0)<(g|0))c[k>>2]=g;k=j+131084+((l|2)<<2)|0;g=c[j+1310736+(m+5<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;g=j+131084+((l|3)<<2)|0;k=c[j+1310736+(m+6<<2)>>2]|0;if((c[g>>2]|0)<(k|0))c[g>>2]=k;a=a+1|0}while((a|0)<(o|0))}if((c[n>>2]|0)>0){k=0;do{e=j+12+(k<<2)|0;f=k<<1;B=j+655376+(f<<3)|0;h[B>>3]=+h[B>>3]/+(c[e>>2]|0);f=j+655376+((f|1)<<3)|0;h[f>>3]=+h[f>>3]/+(c[e>>2]|0);k=k+1|0}while((k|0)<(c[n>>2]|0));k=0}else k=0}else k=0}i=C;return k|0}function Sc(a,e,f,g,j){a=a|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;C=i;i=i+16|0;A=C;n=c[j>>2]|0;z=f+-1|0;if((e|0)>0){k=0;l=n;m=n+(($(z,e)|0)<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(e|0))break;else{l=l+2|0;m=m+2|0}}}y=g*3|0;x=e+-1|0;if((f|0)>0){k=0;g=n;l=n+(x<<1)|0;while(1){b[l>>1]=0;b[g>>1]=0;k=k+1|0;if((k|0)>=(f|0))break;else{g=g+(e<<1)|0;l=l+(e<<1)|0}}}l=j+1179664|0;k=e+1|0;u=0-e|0;s=1-e|0;t=~e;a:do if((z|0)>1){v=(x|0)>1;w=1;g=a+(k<<1)|0;m=n+(k<<1)|0;k=0;b:while(1){if(v){r=1;q=m;p=k;while(1){o=d[g>>0]|0;do if(((o&240)+24+(o<<4&240)+((d[g+1>>0]|0)&240)|0)>(y|0)){k=b[q+(u<<1)>>1]|0;if(k<<16>>16>0){b[q>>1]=k;k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=j+1310736+(k+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+w;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}a=b[q+(s<<1)>>1]|0;n=a<<16>>16;k=b[q+(t<<1)>>1]|0;o=k<<16>>16;m=k<<16>>16>0;if(a<<16>>16<=0){if(m){b[q>>1]=k;k=o*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+r;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+w;m=j+1310736+(k+-3<<2)|0;if((c[m>>2]|0)<(r|0))c[m>>2]=r;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}k=b[q+-2>>1]|0;if(k<<16>>16>0){b[q>>1]=k;k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=j+1310736+(k+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+w;k=j+1310736+(k+-3<<2)|0;if((c[k>>2]|0)>=(r|0)){k=p;break}c[k>>2]=r;k=p;break}else{k=p+1|0;if((p|0)>32767)break b;b[q>>1]=k;c[j+1179664+(p<<2)>>2]=k<<16>>16;p=p*7|0;c[j+1310736+(p<<2)>>2]=1;c[j+1310736+(p+1<<2)>>2]=r;c[j+1310736+(p+2<<2)>>2]=w;c[j+1310736+(p+3<<2)>>2]=r;c[j+1310736+(p+4<<2)>>2]=r;c[j+1310736+(p+5<<2)>>2]=w;c[j+1310736+(p+6<<2)>>2]=w;break}}if(m){k=c[j+1179664+(n+-1<<2)>>2]|0;n=c[j+1179664+(o+-1<<2)>>2]|0;if((k|0)>(n|0)){b[q>>1]=n;if((p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(k|0))c[a>>2]=n;m=m+1|0;if((m|0)>=(p|0)){k=n;break}else a=a+4|0}}else k=n}else{b[q>>1]=k;if((k|0)<(n|0)&(p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(n|0))c[a>>2]=k;m=m+1|0;if((m|0)>=(p|0))break;else a=a+4|0}}}k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=j+1310736+(k+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+w;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}m=b[q+-2>>1]|0;if(m<<16>>16<=0){b[q>>1]=a;k=n*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+r;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+w;m=j+1310736+(k+-4<<2)|0;if((c[m>>2]|0)>(r|0))c[m>>2]=r;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}k=c[j+1179664+(n+-1<<2)>>2]|0;n=c[j+1179664+((m<<16>>16)+-1<<2)>>2]|0;if((k|0)>(n|0)){b[q>>1]=n;if((p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(k|0))c[a>>2]=n;m=m+1|0;if((m|0)>=(p|0)){k=n;break}else a=a+4|0}}else k=n}else{b[q>>1]=k;if((k|0)<(n|0)&(p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(n|0))c[a>>2]=k;m=m+1|0;if((m|0)>=(p|0))break;else a=a+4|0}}}k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;k=j+1310736+(k+-5<<2)|0;c[k>>2]=(c[k>>2]|0)+w;k=p}else{b[q>>1]=0;k=p}while(0);r=r+1|0;g=g+2|0;m=q+2|0;if((r|0)>=(x|0))break;else{q=m;p=k}}}w=w+1|0;if((w|0)>=(z|0)){o=k;B=52;break a}else{g=g+4|0;m=m+4|0}}Me(3,3904,A);k=-1}else{o=0;B=52}while(0);if((B|0)==52){a=j+12|0;if((o|0)<1)g=1;else{m=1;g=1;while(1){k=c[l>>2]|0;if((k|0)==(m|0)){k=g;g=g+1|0}else k=c[j+1179664+(k+-1<<2)>>2]|0;c[l>>2]=k;if((m|0)<(o|0)){m=m+1|0;l=l+4|0}else break}}n=j+8|0;k=g+-1|0;c[n>>2]=k;if(k){ek(a|0,0,k<<2|0)|0;ek(j+655376|0,0,k<<4|0)|0;if((g|0)>1){k=0;do{B=k<<2;c[j+131084+(B<<2)>>2]=e;c[j+131084+((B|1)<<2)>>2]=0;c[j+131084+((B|2)<<2)>>2]=f;c[j+131084+((B|3)<<2)>>2]=0;k=k+1|0}while((k|0)<(c[n>>2]|0))}if((o|0)>0){a=0;do{l=(c[j+1179664+(a<<2)>>2]|0)+-1|0;m=a*7|0;k=j+12+(l<<2)|0;c[k>>2]=(c[k>>2]|0)+(c[j+1310736+(m<<2)>>2]|0);k=l<<1;g=j+655376+(k<<3)|0;h[g>>3]=+h[g>>3]+ +(c[j+1310736+(m+1<<2)>>2]|0);k=j+655376+((k|1)<<3)|0;h[k>>3]=+h[k>>3]+ +(c[j+1310736+(m+2<<2)>>2]|0);l=l<<2;k=j+131084+(l<<2)|0;g=c[j+1310736+(m+3<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;k=j+131084+((l|1)<<2)|0;g=c[j+1310736+(m+4<<2)>>2]|0;if((c[k>>2]|0)<(g|0))c[k>>2]=g;k=j+131084+((l|2)<<2)|0;g=c[j+1310736+(m+5<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;g=j+131084+((l|3)<<2)|0;k=c[j+1310736+(m+6<<2)>>2]|0;if((c[g>>2]|0)<(k|0))c[g>>2]=k;a=a+1|0}while((a|0)<(o|0))}if((c[n>>2]|0)>0){k=0;do{e=j+12+(k<<2)|0;f=k<<1;B=j+655376+(f<<3)|0;h[B>>3]=+h[B>>3]/+(c[e>>2]|0);f=j+655376+((f|1)<<3)|0;h[f>>3]=+h[f>>3]/+(c[e>>2]|0);k=k+1|0}while((k|0)<(c[n>>2]|0));k=0}else k=0}else k=0}i=C;return k|0}function Tc(a,e,f,g,j){a=a|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;C=i;i=i+16|0;A=C;n=c[j>>2]|0;z=f+-1|0;if((e|0)>0){k=0;l=n;m=n+(($(z,e)|0)<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(e|0))break;else{l=l+2|0;m=m+2|0}}}y=g*3|0;x=e+-1|0;if((f|0)>0){k=0;g=n;l=n+(x<<1)|0;while(1){b[l>>1]=0;b[g>>1]=0;k=k+1|0;if((k|0)>=(f|0))break;else{g=g+(e<<1)|0;l=l+(e<<1)|0}}}l=j+1179664|0;k=e+1|0;u=0-e|0;s=1-e|0;t=~e;a:do if((z|0)>1){v=(x|0)>1;w=1;g=a+(k<<1)|0;m=n+(k<<1)|0;k=0;b:while(1){if(v){r=1;q=m;p=k;while(1){n=d[g>>0]|0;o=d[g+1>>0]|0;do if(((n&248)+12+(n<<5&224)+(o>>>3&24)+(o<<2&248)|0)>(y|0)){k=b[q+(u<<1)>>1]|0;if(k<<16>>16>0){b[q>>1]=k;k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=j+1310736+(k+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+w;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}a=b[q+(s<<1)>>1]|0;n=a<<16>>16;k=b[q+(t<<1)>>1]|0;o=k<<16>>16;m=k<<16>>16>0;if(a<<16>>16<=0){if(m){b[q>>1]=k;k=o*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+r;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+w;m=j+1310736+(k+-3<<2)|0;if((c[m>>2]|0)<(r|0))c[m>>2]=r;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}k=b[q+-2>>1]|0;if(k<<16>>16>0){b[q>>1]=k;k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=j+1310736+(k+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+w;k=j+1310736+(k+-3<<2)|0;if((c[k>>2]|0)>=(r|0)){k=p;break}c[k>>2]=r;k=p;break}else{k=p+1|0;if((p|0)>32767)break b;b[q>>1]=k;c[j+1179664+(p<<2)>>2]=k<<16>>16;p=p*7|0;c[j+1310736+(p<<2)>>2]=1;c[j+1310736+(p+1<<2)>>2]=r;c[j+1310736+(p+2<<2)>>2]=w;c[j+1310736+(p+3<<2)>>2]=r;c[j+1310736+(p+4<<2)>>2]=r;c[j+1310736+(p+5<<2)>>2]=w;c[j+1310736+(p+6<<2)>>2]=w;break}}if(m){k=c[j+1179664+(n+-1<<2)>>2]|0;n=c[j+1179664+(o+-1<<2)>>2]|0;if((k|0)>(n|0)){b[q>>1]=n;if((p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(k|0))c[a>>2]=n;m=m+1|0;if((m|0)>=(p|0)){k=n;break}else a=a+4|0}}else k=n}else{b[q>>1]=k;if((k|0)<(n|0)&(p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(n|0))c[a>>2]=k;m=m+1|0;if((m|0)>=(p|0))break;else a=a+4|0}}}k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=j+1310736+(k+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+w;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}m=b[q+-2>>1]|0;if(m<<16>>16<=0){b[q>>1]=a;k=n*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+r;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+w;m=j+1310736+(k+-4<<2)|0;if((c[m>>2]|0)>(r|0))c[m>>2]=r;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}k=c[j+1179664+(n+-1<<2)>>2]|0;n=c[j+1179664+((m<<16>>16)+-1<<2)>>2]|0;if((k|0)>(n|0)){b[q>>1]=n;if((p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(k|0))c[a>>2]=n;m=m+1|0;if((m|0)>=(p|0)){k=n;break}else a=a+4|0}}else k=n}else{b[q>>1]=k;if((k|0)<(n|0)&(p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(n|0))c[a>>2]=k;m=m+1|0;if((m|0)>=(p|0))break;else a=a+4|0}}}k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;k=j+1310736+(k+-5<<2)|0;c[k>>2]=(c[k>>2]|0)+w;k=p}else{b[q>>1]=0;k=p}while(0);r=r+1|0;g=g+2|0;m=q+2|0;if((r|0)>=(x|0))break;else{q=m;p=k}}}w=w+1|0;if((w|0)>=(z|0)){o=k;B=52;break a}else{g=g+4|0;m=m+4|0}}Me(3,3904,A);k=-1}else{o=0;B=52}while(0);if((B|0)==52){a=j+12|0;if((o|0)<1)g=1;else{m=1;g=1;while(1){k=c[l>>2]|0;if((k|0)==(m|0)){k=g;g=g+1|0}else k=c[j+1179664+(k+-1<<2)>>2]|0;c[l>>2]=k;if((m|0)<(o|0)){m=m+1|0;l=l+4|0}else break}}n=j+8|0;k=g+-1|0;c[n>>2]=k;if(k){ek(a|0,0,k<<2|0)|0;ek(j+655376|0,0,k<<4|0)|0;if((g|0)>1){k=0;do{B=k<<2;c[j+131084+(B<<2)>>2]=e;c[j+131084+((B|1)<<2)>>2]=0;c[j+131084+((B|2)<<2)>>2]=f;c[j+131084+((B|3)<<2)>>2]=0;k=k+1|0}while((k|0)<(c[n>>2]|0))}if((o|0)>0){a=0;do{l=(c[j+1179664+(a<<2)>>2]|0)+-1|0;m=a*7|0;k=j+12+(l<<2)|0;c[k>>2]=(c[k>>2]|0)+(c[j+1310736+(m<<2)>>2]|0);k=l<<1;g=j+655376+(k<<3)|0;h[g>>3]=+h[g>>3]+ +(c[j+1310736+(m+1<<2)>>2]|0);k=j+655376+((k|1)<<3)|0;h[k>>3]=+h[k>>3]+ +(c[j+1310736+(m+2<<2)>>2]|0);l=l<<2;k=j+131084+(l<<2)|0;g=c[j+1310736+(m+3<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;k=j+131084+((l|1)<<2)|0;g=c[j+1310736+(m+4<<2)>>2]|0;if((c[k>>2]|0)<(g|0))c[k>>2]=g;k=j+131084+((l|2)<<2)|0;g=c[j+1310736+(m+5<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;g=j+131084+((l|3)<<2)|0;k=c[j+1310736+(m+6<<2)>>2]|0;if((c[g>>2]|0)<(k|0))c[g>>2]=k;a=a+1|0}while((a|0)<(o|0))}if((c[n>>2]|0)>0){k=0;do{e=j+12+(k<<2)|0;f=k<<1;B=j+655376+(f<<3)|0;h[B>>3]=+h[B>>3]/+(c[e>>2]|0);f=j+655376+((f|1)<<3)|0;h[f>>3]=+h[f>>3]/+(c[e>>2]|0);k=k+1|0}while((k|0)<(c[n>>2]|0));k=0}else k=0}else k=0}i=C;return k|0}function Uc(a,e,f,g,j){a=a|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;C=i;i=i+16|0;A=C;n=c[j>>2]|0;z=f+-1|0;if((e|0)>0){k=0;l=n;m=n+(($(z,e)|0)<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(e|0))break;else{l=l+2|0;m=m+2|0}}}y=g*3|0;x=e+-1|0;if((f|0)>0){k=0;g=n;l=n+(x<<1)|0;while(1){b[l>>1]=0;b[g>>1]=0;k=k+1|0;if((k|0)>=(f|0))break;else{g=g+(e<<1)|0;l=l+(e<<1)|0}}}l=j+1179664|0;k=e+1|0;u=0-e|0;s=1-e|0;t=~e;a:do if((z|0)>1){v=(x|0)>1;w=1;g=a+(k<<2)|0;m=n+(k<<1)|0;k=0;b:while(1){if(v){r=1;q=m;p=k;while(1){do if(((d[g+2>>0]|0)+(d[g+1>>0]|0)+(d[g+3>>0]|0)|0)>(y|0)){k=b[q+(u<<1)>>1]|0;if(k<<16>>16>0){b[q>>1]=k;k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=j+1310736+(k+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+w;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}a=b[q+(s<<1)>>1]|0;n=a<<16>>16;k=b[q+(t<<1)>>1]|0;o=k<<16>>16;m=k<<16>>16>0;if(a<<16>>16<=0){if(m){b[q>>1]=k;k=o*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+r;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+w;m=j+1310736+(k+-3<<2)|0;if((c[m>>2]|0)<(r|0))c[m>>2]=r;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}k=b[q+-2>>1]|0;if(k<<16>>16>0){b[q>>1]=k;k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=j+1310736+(k+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+w;k=j+1310736+(k+-3<<2)|0;if((c[k>>2]|0)>=(r|0)){k=p;break}c[k>>2]=r;k=p;break}else{k=p+1|0;if((p|0)>32767)break b;b[q>>1]=k;c[j+1179664+(p<<2)>>2]=k<<16>>16;p=p*7|0;c[j+1310736+(p<<2)>>2]=1;c[j+1310736+(p+1<<2)>>2]=r;c[j+1310736+(p+2<<2)>>2]=w;c[j+1310736+(p+3<<2)>>2]=r;c[j+1310736+(p+4<<2)>>2]=r;c[j+1310736+(p+5<<2)>>2]=w;c[j+1310736+(p+6<<2)>>2]=w;break}}if(m){k=c[j+1179664+(n+-1<<2)>>2]|0;n=c[j+1179664+(o+-1<<2)>>2]|0;if((k|0)>(n|0)){b[q>>1]=n;if((p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(k|0))c[a>>2]=n;m=m+1|0;if((m|0)>=(p|0)){k=n;break}else a=a+4|0}}else k=n}else{b[q>>1]=k;if((k|0)<(n|0)&(p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(n|0))c[a>>2]=k;m=m+1|0;if((m|0)>=(p|0))break;else a=a+4|0}}}k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=j+1310736+(k+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+w;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}m=b[q+-2>>1]|0;if(m<<16>>16<=0){b[q>>1]=a;k=n*7|0;m=j+1310736+(k+-7<<2)|0;c[m>>2]=(c[m>>2]|0)+1;m=j+1310736+(k+-6<<2)|0;c[m>>2]=(c[m>>2]|0)+r;m=j+1310736+(k+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+w;m=j+1310736+(k+-4<<2)|0;if((c[m>>2]|0)>(r|0))c[m>>2]=r;c[j+1310736+(k+-1<<2)>>2]=w;k=p;break}k=c[j+1179664+(n+-1<<2)>>2]|0;n=c[j+1179664+((m<<16>>16)+-1<<2)>>2]|0;if((k|0)>(n|0)){b[q>>1]=n;if((p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(k|0))c[a>>2]=n;m=m+1|0;if((m|0)>=(p|0)){k=n;break}else a=a+4|0}}else k=n}else{b[q>>1]=k;if((k|0)<(n|0)&(p|0)>0){m=0;a=l;while(1){if((c[a>>2]|0)==(n|0))c[a>>2]=k;m=m+1|0;if((m|0)>=(p|0))break;else a=a+4|0}}}k=(k<<16>>16)*7|0;o=j+1310736+(k+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=j+1310736+(k+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;k=j+1310736+(k+-5<<2)|0;c[k>>2]=(c[k>>2]|0)+w;k=p}else{b[q>>1]=0;k=p}while(0);r=r+1|0;g=g+4|0;m=q+2|0;if((r|0)>=(x|0))break;else{q=m;p=k}}}w=w+1|0;if((w|0)>=(z|0)){o=k;B=52;break a}else{g=g+8|0;m=m+4|0}}Me(3,3904,A);k=-1}else{o=0;B=52}while(0);if((B|0)==52){a=j+12|0;if((o|0)<1)g=1;else{m=1;g=1;while(1){k=c[l>>2]|0;if((k|0)==(m|0)){k=g;g=g+1|0}else k=c[j+1179664+(k+-1<<2)>>2]|0;c[l>>2]=k;if((m|0)<(o|0)){m=m+1|0;l=l+4|0}else break}}n=j+8|0;k=g+-1|0;c[n>>2]=k;if(k){ek(a|0,0,k<<2|0)|0;ek(j+655376|0,0,k<<4|0)|0;if((g|0)>1){k=0;do{B=k<<2;c[j+131084+(B<<2)>>2]=e;c[j+131084+((B|1)<<2)>>2]=0;c[j+131084+((B|2)<<2)>>2]=f;c[j+131084+((B|3)<<2)>>2]=0;k=k+1|0}while((k|0)<(c[n>>2]|0))}if((o|0)>0){a=0;do{l=(c[j+1179664+(a<<2)>>2]|0)+-1|0;m=a*7|0;k=j+12+(l<<2)|0;c[k>>2]=(c[k>>2]|0)+(c[j+1310736+(m<<2)>>2]|0);k=l<<1;g=j+655376+(k<<3)|0;h[g>>3]=+h[g>>3]+ +(c[j+1310736+(m+1<<2)>>2]|0);k=j+655376+((k|1)<<3)|0;h[k>>3]=+h[k>>3]+ +(c[j+1310736+(m+2<<2)>>2]|0);l=l<<2;k=j+131084+(l<<2)|0;g=c[j+1310736+(m+3<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;k=j+131084+((l|1)<<2)|0;g=c[j+1310736+(m+4<<2)>>2]|0;if((c[k>>2]|0)<(g|0))c[k>>2]=g;k=j+131084+((l|2)<<2)|0;g=c[j+1310736+(m+5<<2)>>2]|0;if((c[k>>2]|0)>(g|0))c[k>>2]=g;g=j+131084+((l|3)<<2)|0;k=c[j+1310736+(m+6<<2)>>2]|0;if((c[g>>2]|0)<(k|0))c[g>>2]=k;a=a+1|0}while((a|0)<(o|0))}if((c[n>>2]|0)>0){k=0;do{e=j+12+(k<<2)|0;f=k<<1;B=j+655376+(f<<3)|0;h[B>>3]=+h[B>>3]/+(c[e>>2]|0);f=j+655376+((f|1)<<3)|0;h[f>>3]=+h[f>>3]/+(c[e>>2]|0);k=k+1|0}while((k|0)<(c[n>>2]|0));k=0}else k=0}else k=0}i=C;return k|0}function Vc(a,e,f,g,j){a=a|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;C=i;i=i+16|0;A=C;n=c[j>>2]|0;z=f+-1|0;if((e|0)>0){k=0;l=n;m=n+(($(z,e)|0)<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(e|0))break;else{l=l+2|0;m=m+2|0}}}y=e+-1|0;if((f|0)>0){k=0;l=n;m=n+(y<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(f|0))break;else{l=l+(e<<1)|0;m=m+(e<<1)|0}}}m=j+1179664|0;k=e+1|0;v=0-e|0;t=1-e|0;u=~e;a:do if((z|0)>1){w=(y|0)>1;x=1;l=a+k|0;a=n+(k<<1)|0;k=0;b:while(1){if(w){s=1;r=a;q=k;while(1){do if((d[l>>0]|0|0)>(g|0)){k=b[r+(v<<1)>>1]|0;if(k<<16>>16>0){b[r>>1]=k;k=(k<<16>>16)*7|0;p=j+1310736+(k+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=j+1310736+(k+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=j+1310736+(k+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+x;c[j+1310736+(k+-1<<2)>>2]=x;k=q;break}n=b[r+(t<<1)>>1]|0;o=n<<16>>16;k=b[r+(u<<1)>>1]|0;p=k<<16>>16;a=k<<16>>16>0;if(n<<16>>16<=0){if(a){b[r>>1]=k;k=p*7|0;a=j+1310736+(k+-7<<2)|0;c[a>>2]=(c[a>>2]|0)+1;a=j+1310736+(k+-6<<2)|0;c[a>>2]=(c[a>>2]|0)+s;a=j+1310736+(k+-5<<2)|0;c[a>>2]=(c[a>>2]|0)+x;a=j+1310736+(k+-3<<2)|0;if((c[a>>2]|0)<(s|0))c[a>>2]=s;c[j+1310736+(k+-1<<2)>>2]=x;k=q;break}k=b[r+-2>>1]|0;if(k<<16>>16>0){b[r>>1]=k;k=(k<<16>>16)*7|0;p=j+1310736+(k+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=j+1310736+(k+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=j+1310736+(k+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+x;k=j+1310736+(k+-3<<2)|0;if((c[k>>2]|0)>=(s|0)){k=q;break}c[k>>2]=s;k=q;break}else{k=q+1|0;if((q|0)>32767)break b;b[r>>1]=k;c[j+1179664+(q<<2)>>2]=k<<16>>16;q=q*7|0;c[j+1310736+(q<<2)>>2]=1;c[j+1310736+(q+1<<2)>>2]=s;c[j+1310736+(q+2<<2)>>2]=x;c[j+1310736+(q+3<<2)>>2]=s;c[j+1310736+(q+4<<2)>>2]=s;c[j+1310736+(q+5<<2)>>2]=x;c[j+1310736+(q+6<<2)>>2]=x;break}}if(a){k=c[j+1179664+(o+-1<<2)>>2]|0;o=c[j+1179664+(p+-1<<2)>>2]|0;if((k|0)>(o|0)){b[r>>1]=o;if((q|0)>0){a=0;n=m;while(1){if((c[n>>2]|0)==(k|0))c[n>>2]=o;a=a+1|0;if((a|0)>=(q|0)){k=o;break}else n=n+4|0}}else k=o}else{b[r>>1]=k;if((k|0)<(o|0)&(q|0)>0){a=0;n=m;while(1){if((c[n>>2]|0)==(o|0))c[n>>2]=k;a=a+1|0;if((a|0)>=(q|0))break;else n=n+4|0}}}k=(k<<16>>16)*7|0;p=j+1310736+(k+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=j+1310736+(k+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=j+1310736+(k+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+x;c[j+1310736+(k+-1<<2)>>2]=x;k=q;break}k=b[r+-2>>1]|0;if(k<<16>>16<=0){b[r>>1]=n;k=o*7|0;a=j+1310736+(k+-7<<2)|0;c[a>>2]=(c[a>>2]|0)+1;a=j+1310736+(k+-6<<2)|0;c[a>>2]=(c[a>>2]|0)+s;a=j+1310736+(k+-5<<2)|0;c[a>>2]=(c[a>>2]|0)+x;a=j+1310736+(k+-4<<2)|0;if((c[a>>2]|0)>(s|0))c[a>>2]=s;c[j+1310736+(k+-1<<2)>>2]=x;k=q;break}o=c[j+1179664+(o+-1<<2)>>2]|0;k=c[j+1179664+((k<<16>>16)+-1<<2)>>2]|0;if((o|0)>(k|0)){b[r>>1]=k;if((q|0)>0){a=0;n=m;while(1){if((c[n>>2]|0)==(o|0))c[n>>2]=k;a=a+1|0;if((a|0)>=(q|0))break;else n=n+4|0}}}else{b[r>>1]=o;if((o|0)<(k|0)&(q|0)>0){a=0;n=m;while(1){if((c[n>>2]|0)==(k|0))c[n>>2]=o;a=a+1|0;if((a|0)>=(q|0)){k=o;break}else n=n+4|0}}else k=o}k=(k<<16>>16)*7|0;p=j+1310736+(k+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=j+1310736+(k+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;k=j+1310736+(k+-5<<2)|0;c[k>>2]=(c[k>>2]|0)+x;k=q}else{b[r>>1]=0;k=q}while(0);s=s+1|0;l=l+1|0;a=r+2|0;if((s|0)>=(y|0))break;else{r=a;q=k}}}x=x+1|0;if((x|0)>=(z|0)){p=k;B=52;break a}else{l=l+2|0;a=a+4|0}}Me(3,3904,A);k=-1}else{p=0;B=52}while(0);if((B|0)==52){n=j+12|0;if((p|0)<1)l=1;else{a=1;l=1;while(1){k=c[m>>2]|0;if((k|0)==(a|0)){k=l;l=l+1|0}else k=c[j+1179664+(k+-1<<2)>>2]|0;c[m>>2]=k;if((a|0)<(p|0)){a=a+1|0;m=m+4|0}else break}}o=j+8|0;k=l+-1|0;c[o>>2]=k;if(k){ek(n|0,0,k<<2|0)|0;ek(j+655376|0,0,k<<4|0)|0;if((l|0)>1){k=0;do{B=k<<2;c[j+131084+(B<<2)>>2]=e;c[j+131084+((B|1)<<2)>>2]=0;c[j+131084+((B|2)<<2)>>2]=f;c[j+131084+((B|3)<<2)>>2]=0;k=k+1|0}while((k|0)<(c[o>>2]|0))}if((p|0)>0){n=0;do{m=(c[j+1179664+(n<<2)>>2]|0)+-1|0;a=n*7|0;k=j+12+(m<<2)|0;c[k>>2]=(c[k>>2]|0)+(c[j+1310736+(a<<2)>>2]|0);k=m<<1;l=j+655376+(k<<3)|0;h[l>>3]=+h[l>>3]+ +(c[j+1310736+(a+1<<2)>>2]|0);k=j+655376+((k|1)<<3)|0;h[k>>3]=+h[k>>3]+ +(c[j+1310736+(a+2<<2)>>2]|0);m=m<<2;k=j+131084+(m<<2)|0;l=c[j+1310736+(a+3<<2)>>2]|0;if((c[k>>2]|0)>(l|0))c[k>>2]=l;k=j+131084+((m|1)<<2)|0;l=c[j+1310736+(a+4<<2)>>2]|0;if((c[k>>2]|0)<(l|0))c[k>>2]=l;k=j+131084+((m|2)<<2)|0;l=c[j+1310736+(a+5<<2)>>2]|0;if((c[k>>2]|0)>(l|0))c[k>>2]=l;l=j+131084+((m|3)<<2)|0;k=c[j+1310736+(a+6<<2)>>2]|0;if((c[l>>2]|0)<(k|0))c[l>>2]=k;n=n+1|0}while((n|0)<(p|0))}if((c[o>>2]|0)>0){k=0;do{e=j+12+(k<<2)|0;f=k<<1;B=j+655376+(f<<3)|0;h[B>>3]=+h[B>>3]/+(c[e>>2]|0);f=j+655376+((f|1)<<3)|0;h[f>>3]=+h[f>>3]/+(c[e>>2]|0);k=k+1|0}while((k|0)<(c[o>>2]|0));k=0}else k=0}else k=0}i=C;return k|0}function Wc(a,e,f,g,j){a=a|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;C=i;i=i+16|0;A=C;n=c[j>>2]|0;z=f+-1|0;if((e|0)>0){k=0;l=n;m=n+(($(z,e)|0)<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(e|0))break;else{l=l+2|0;m=m+2|0}}}y=e+-1|0;if((f|0)>0){k=0;l=n;m=n+(y<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(f|0))break;else{l=l+(e<<1)|0;m=m+(e<<1)|0}}}m=j+1179664|0;k=e+1|0;v=0-e|0;t=1-e|0;u=~e;a:do if((z|0)>1){w=(y|0)>1;x=1;l=a+(k<<1)|0;a=n+(k<<1)|0;k=0;b:while(1){if(w){s=1;r=a;q=k;while(1){do if((d[l+1>>0]|0|0)>(g|0)){k=b[r+(v<<1)>>1]|0;if(k<<16>>16>0){b[r>>1]=k;k=(k<<16>>16)*7|0;p=j+1310736+(k+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=j+1310736+(k+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=j+1310736+(k+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+x;c[j+1310736+(k+-1<<2)>>2]=x;k=q;break}n=b[r+(t<<1)>>1]|0;o=n<<16>>16;k=b[r+(u<<1)>>1]|0;p=k<<16>>16;a=k<<16>>16>0;if(n<<16>>16<=0){if(a){b[r>>1]=k;k=p*7|0;a=j+1310736+(k+-7<<2)|0;c[a>>2]=(c[a>>2]|0)+1;a=j+1310736+(k+-6<<2)|0;c[a>>2]=(c[a>>2]|0)+s;a=j+1310736+(k+-5<<2)|0;c[a>>2]=(c[a>>2]|0)+x;a=j+1310736+(k+-3<<2)|0;if((c[a>>2]|0)<(s|0))c[a>>2]=s;c[j+1310736+(k+-1<<2)>>2]=x;k=q;break}k=b[r+-2>>1]|0;if(k<<16>>16>0){b[r>>1]=k;k=(k<<16>>16)*7|0;p=j+1310736+(k+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=j+1310736+(k+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=j+1310736+(k+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+x;k=j+1310736+(k+-3<<2)|0;if((c[k>>2]|0)>=(s|0)){k=q;break}c[k>>2]=s;k=q;break}else{k=q+1|0;if((q|0)>32767)break b;b[r>>1]=k;c[j+1179664+(q<<2)>>2]=k<<16>>16;q=q*7|0;c[j+1310736+(q<<2)>>2]=1;c[j+1310736+(q+1<<2)>>2]=s;c[j+1310736+(q+2<<2)>>2]=x;c[j+1310736+(q+3<<2)>>2]=s;c[j+1310736+(q+4<<2)>>2]=s;c[j+1310736+(q+5<<2)>>2]=x;c[j+1310736+(q+6<<2)>>2]=x;break}}if(a){k=c[j+1179664+(o+-1<<2)>>2]|0;o=c[j+1179664+(p+-1<<2)>>2]|0;if((k|0)>(o|0)){b[r>>1]=o;if((q|0)>0){a=0;n=m;while(1){if((c[n>>2]|0)==(k|0))c[n>>2]=o;a=a+1|0;if((a|0)>=(q|0)){k=o;break}else n=n+4|0}}else k=o}else{b[r>>1]=k;if((k|0)<(o|0)&(q|0)>0){a=0;n=m;while(1){if((c[n>>2]|0)==(o|0))c[n>>2]=k;a=a+1|0;if((a|0)>=(q|0))break;else n=n+4|0}}}k=(k<<16>>16)*7|0;p=j+1310736+(k+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=j+1310736+(k+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=j+1310736+(k+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+x;c[j+1310736+(k+-1<<2)>>2]=x;k=q;break}a=b[r+-2>>1]|0;if(a<<16>>16<=0){b[r>>1]=n;k=o*7|0;a=j+1310736+(k+-7<<2)|0;c[a>>2]=(c[a>>2]|0)+1;a=j+1310736+(k+-6<<2)|0;c[a>>2]=(c[a>>2]|0)+s;a=j+1310736+(k+-5<<2)|0;c[a>>2]=(c[a>>2]|0)+x;a=j+1310736+(k+-4<<2)|0;if((c[a>>2]|0)>(s|0))c[a>>2]=s;c[j+1310736+(k+-1<<2)>>2]=x;k=q;break}k=c[j+1179664+(o+-1<<2)>>2]|0;o=c[j+1179664+((a<<16>>16)+-1<<2)>>2]|0;if((k|0)>(o|0)){b[r>>1]=o;if((q|0)>0){a=0;n=m;while(1){if((c[n>>2]|0)==(k|0))c[n>>2]=o;a=a+1|0;if((a|0)>=(q|0)){k=o;break}else n=n+4|0}}else k=o}else{b[r>>1]=k;if((k|0)<(o|0)&(q|0)>0){a=0;n=m;while(1){if((c[n>>2]|0)==(o|0))c[n>>2]=k;a=a+1|0;if((a|0)>=(q|0))break;else n=n+4|0}}}k=(k<<16>>16)*7|0;p=j+1310736+(k+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=j+1310736+(k+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;k=j+1310736+(k+-5<<2)|0;c[k>>2]=(c[k>>2]|0)+x;k=q}else{b[r>>1]=0;k=q}while(0);s=s+1|0;l=l+2|0;a=r+2|0;if((s|0)>=(y|0))break;else{r=a;q=k}}}x=x+1|0;if((x|0)>=(z|0)){p=k;B=52;break a}else{l=l+4|0;a=a+4|0}}Me(3,3904,A);k=-1}else{p=0;B=52}while(0);if((B|0)==52){n=j+12|0;if((p|0)<1)l=1;else{a=1;l=1;while(1){k=c[m>>2]|0;if((k|0)==(a|0)){k=l;l=l+1|0}else k=c[j+1179664+(k+-1<<2)>>2]|0;c[m>>2]=k;if((a|0)<(p|0)){a=a+1|0;m=m+4|0}else break}}o=j+8|0;k=l+-1|0;c[o>>2]=k;if(k){ek(n|0,0,k<<2|0)|0;ek(j+655376|0,0,k<<4|0)|0;if((l|0)>1){k=0;do{B=k<<2;c[j+131084+(B<<2)>>2]=e;c[j+131084+((B|1)<<2)>>2]=0;c[j+131084+((B|2)<<2)>>2]=f;c[j+131084+((B|3)<<2)>>2]=0;k=k+1|0}while((k|0)<(c[o>>2]|0))}if((p|0)>0){n=0;do{m=(c[j+1179664+(n<<2)>>2]|0)+-1|0;a=n*7|0;k=j+12+(m<<2)|0;c[k>>2]=(c[k>>2]|0)+(c[j+1310736+(a<<2)>>2]|0);k=m<<1;l=j+655376+(k<<3)|0;h[l>>3]=+h[l>>3]+ +(c[j+1310736+(a+1<<2)>>2]|0);k=j+655376+((k|1)<<3)|0;h[k>>3]=+h[k>>3]+ +(c[j+1310736+(a+2<<2)>>2]|0);m=m<<2;k=j+131084+(m<<2)|0;l=c[j+1310736+(a+3<<2)>>2]|0;if((c[k>>2]|0)>(l|0))c[k>>2]=l;k=j+131084+((m|1)<<2)|0;l=c[j+1310736+(a+4<<2)>>2]|0;if((c[k>>2]|0)<(l|0))c[k>>2]=l;k=j+131084+((m|2)<<2)|0;l=c[j+1310736+(a+5<<2)>>2]|0;if((c[k>>2]|0)>(l|0))c[k>>2]=l;l=j+131084+((m|3)<<2)|0;k=c[j+1310736+(a+6<<2)>>2]|0;if((c[l>>2]|0)<(k|0))c[l>>2]=k;n=n+1|0}while((n|0)<(p|0))}if((c[o>>2]|0)>0){k=0;do{e=j+12+(k<<2)|0;f=k<<1;B=j+655376+(f<<3)|0;h[B>>3]=+h[B>>3]/+(c[e>>2]|0);f=j+655376+((f|1)<<3)|0;h[f>>3]=+h[f>>3]/+(c[e>>2]|0);k=k+1|0}while((k|0)<(c[o>>2]|0));k=0}else k=0}else k=0}i=C;return k|0}function Xc(a,e,f,g,j){a=a|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;C=i;i=i+16|0;A=C;n=c[j>>2]|0;z=f+-1|0;if((e|0)>0){k=0;l=n;m=n+(($(z,e)|0)<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(e|0))break;else{l=l+2|0;m=m+2|0}}}y=e+-1|0;if((f|0)>0){k=0;l=n;m=n+(y<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(f|0))break;else{l=l+(e<<1)|0;m=m+(e<<1)|0}}}m=j+1179664|0;k=e+1|0;v=0-e|0;t=1-e|0;u=~e;a:do if((z|0)>1){w=(y|0)>1;x=1;l=a+(k<<1)|0;a=n+(k<<1)|0;k=0;b:while(1){if(w){s=1;r=a;q=k;while(1){do if((d[l>>0]|0|0)>(g|0)){k=b[r+(v<<1)>>1]|0;if(k<<16>>16>0){b[r>>1]=k;k=(k<<16>>16)*7|0;p=j+1310736+(k+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=j+1310736+(k+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=j+1310736+(k+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+x;c[j+1310736+(k+-1<<2)>>2]=x;k=q;break}n=b[r+(t<<1)>>1]|0;o=n<<16>>16;k=b[r+(u<<1)>>1]|0;p=k<<16>>16;a=k<<16>>16>0;if(n<<16>>16<=0){if(a){b[r>>1]=k;k=p*7|0;a=j+1310736+(k+-7<<2)|0;c[a>>2]=(c[a>>2]|0)+1;a=j+1310736+(k+-6<<2)|0;c[a>>2]=(c[a>>2]|0)+s;a=j+1310736+(k+-5<<2)|0;c[a>>2]=(c[a>>2]|0)+x;a=j+1310736+(k+-3<<2)|0;if((c[a>>2]|0)<(s|0))c[a>>2]=s;c[j+1310736+(k+-1<<2)>>2]=x;k=q;break}k=b[r+-2>>1]|0;if(k<<16>>16>0){b[r>>1]=k;k=(k<<16>>16)*7|0;p=j+1310736+(k+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=j+1310736+(k+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=j+1310736+(k+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+x;k=j+1310736+(k+-3<<2)|0;if((c[k>>2]|0)>=(s|0)){k=q;break}c[k>>2]=s;k=q;break}else{k=q+1|0;if((q|0)>32767)break b;b[r>>1]=k;c[j+1179664+(q<<2)>>2]=k<<16>>16;q=q*7|0;c[j+1310736+(q<<2)>>2]=1;c[j+1310736+(q+1<<2)>>2]=s;c[j+1310736+(q+2<<2)>>2]=x;c[j+1310736+(q+3<<2)>>2]=s;c[j+1310736+(q+4<<2)>>2]=s;c[j+1310736+(q+5<<2)>>2]=x;c[j+1310736+(q+6<<2)>>2]=x;break}}if(a){k=c[j+1179664+(o+-1<<2)>>2]|0;o=c[j+1179664+(p+-1<<2)>>2]|0;if((k|0)>(o|0)){b[r>>1]=o;if((q|0)>0){a=0;n=m;while(1){if((c[n>>2]|0)==(k|0))c[n>>2]=o;a=a+1|0;if((a|0)>=(q|0)){k=o;break}else n=n+4|0}}else k=o}else{b[r>>1]=k;if((k|0)<(o|0)&(q|0)>0){a=0;n=m;while(1){if((c[n>>2]|0)==(o|0))c[n>>2]=k;a=a+1|0;if((a|0)>=(q|0))break;else n=n+4|0}}}k=(k<<16>>16)*7|0;p=j+1310736+(k+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=j+1310736+(k+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=j+1310736+(k+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+x;c[j+1310736+(k+-1<<2)>>2]=x;k=q;break}k=b[r+-2>>1]|0;if(k<<16>>16<=0){b[r>>1]=n;k=o*7|0;a=j+1310736+(k+-7<<2)|0;c[a>>2]=(c[a>>2]|0)+1;a=j+1310736+(k+-6<<2)|0;c[a>>2]=(c[a>>2]|0)+s;a=j+1310736+(k+-5<<2)|0;c[a>>2]=(c[a>>2]|0)+x;a=j+1310736+(k+-4<<2)|0;if((c[a>>2]|0)>(s|0))c[a>>2]=s;c[j+1310736+(k+-1<<2)>>2]=x;k=q;break}o=c[j+1179664+(o+-1<<2)>>2]|0;k=c[j+1179664+((k<<16>>16)+-1<<2)>>2]|0;if((o|0)>(k|0)){b[r>>1]=k;if((q|0)>0){a=0;n=m;while(1){if((c[n>>2]|0)==(o|0))c[n>>2]=k;a=a+1|0;if((a|0)>=(q|0))break;else n=n+4|0}}}else{b[r>>1]=o;if((o|0)<(k|0)&(q|0)>0){a=0;n=m;while(1){if((c[n>>2]|0)==(k|0))c[n>>2]=o;a=a+1|0;if((a|0)>=(q|0)){k=o;break}else n=n+4|0}}else k=o}k=(k<<16>>16)*7|0;p=j+1310736+(k+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=j+1310736+(k+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;k=j+1310736+(k+-5<<2)|0;c[k>>2]=(c[k>>2]|0)+x;k=q}else{b[r>>1]=0;k=q}while(0);s=s+1|0;l=l+2|0;a=r+2|0;if((s|0)>=(y|0))break;else{r=a;q=k}}}x=x+1|0;if((x|0)>=(z|0)){p=k;B=52;break a}else{l=l+4|0;a=a+4|0}}Me(3,3904,A);k=-1}else{p=0;B=52}while(0);if((B|0)==52){n=j+12|0;if((p|0)<1)l=1;else{a=1;l=1;while(1){k=c[m>>2]|0;if((k|0)==(a|0)){k=l;l=l+1|0}else k=c[j+1179664+(k+-1<<2)>>2]|0;c[m>>2]=k;if((a|0)<(p|0)){a=a+1|0;m=m+4|0}else break}}o=j+8|0;k=l+-1|0;c[o>>2]=k;if(k){ek(n|0,0,k<<2|0)|0;ek(j+655376|0,0,k<<4|0)|0;if((l|0)>1){k=0;do{B=k<<2;c[j+131084+(B<<2)>>2]=e;c[j+131084+((B|1)<<2)>>2]=0;c[j+131084+((B|2)<<2)>>2]=f;c[j+131084+((B|3)<<2)>>2]=0;k=k+1|0}while((k|0)<(c[o>>2]|0))}if((p|0)>0){n=0;do{m=(c[j+1179664+(n<<2)>>2]|0)+-1|0;a=n*7|0;k=j+12+(m<<2)|0;c[k>>2]=(c[k>>2]|0)+(c[j+1310736+(a<<2)>>2]|0);k=m<<1;l=j+655376+(k<<3)|0;h[l>>3]=+h[l>>3]+ +(c[j+1310736+(a+1<<2)>>2]|0);k=j+655376+((k|1)<<3)|0;h[k>>3]=+h[k>>3]+ +(c[j+1310736+(a+2<<2)>>2]|0);m=m<<2;k=j+131084+(m<<2)|0;l=c[j+1310736+(a+3<<2)>>2]|0;if((c[k>>2]|0)>(l|0))c[k>>2]=l;k=j+131084+((m|1)<<2)|0;l=c[j+1310736+(a+4<<2)>>2]|0;if((c[k>>2]|0)<(l|0))c[k>>2]=l;k=j+131084+((m|2)<<2)|0;l=c[j+1310736+(a+5<<2)>>2]|0;if((c[k>>2]|0)>(l|0))c[k>>2]=l;l=j+131084+((m|3)<<2)|0;k=c[j+1310736+(a+6<<2)>>2]|0;if((c[l>>2]|0)<(k|0))c[l>>2]=k;n=n+1|0}while((n|0)<(p|0))}if((c[o>>2]|0)>0){k=0;do{e=j+12+(k<<2)|0;f=k<<1;B=j+655376+(f<<3)|0;h[B>>3]=+h[B>>3]/+(c[e>>2]|0);f=j+655376+((f|1)<<3)|0;h[f>>3]=+h[f>>3]/+(c[e>>2]|0);k=k+1|0}while((k|0)<(c[o>>2]|0));k=0}else k=0}else k=0}i=C;return k|0}function Yc(a,e,f,g,j){a=a|0;e=e|0;f=f|0;g=g|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;C=i;i=i+16|0;A=C;n=c[j>>2]|0;z=f+-1|0;if((e|0)>0){k=0;l=n;m=n+(($(z,e)|0)<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(e|0))break;else{l=l+2|0;m=m+2|0}}}y=e+-1|0;if((f|0)>0){k=0;l=n;m=n+(y<<1)|0;while(1){b[m>>1]=0;b[l>>1]=0;k=k+1|0;if((k|0)>=(f|0))break;else{l=l+(e<<1)|0;m=m+(e<<1)|0}}}m=j+1179664|0;k=e+1|0;v=0-e|0;t=1-e|0;u=~e;a:do if((z|0)>1){w=(y|0)>1;x=1;l=a+k|0;a=n+(k<<1)|0;n=g+k|0;k=0;b:while(1){if(w){s=1;r=l;q=k;while(1){do if((d[r>>0]|0)>(d[n>>0]|0)){k=b[a+(v<<1)>>1]|0;if(k<<16>>16>0){b[a>>1]=k;k=(k<<16>>16)*7|0;p=j+1310736+(k+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=j+1310736+(k+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=j+1310736+(k+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+x;c[j+1310736+(k+-1<<2)>>2]=x;k=q;break}g=b[a+(t<<1)>>1]|0;o=g<<16>>16;k=b[a+(u<<1)>>1]|0;p=k<<16>>16;l=k<<16>>16>0;if(g<<16>>16<=0){if(l){b[a>>1]=k;k=p*7|0;l=j+1310736+(k+-7<<2)|0;c[l>>2]=(c[l>>2]|0)+1;l=j+1310736+(k+-6<<2)|0;c[l>>2]=(c[l>>2]|0)+s;l=j+1310736+(k+-5<<2)|0;c[l>>2]=(c[l>>2]|0)+x;l=j+1310736+(k+-3<<2)|0;if((c[l>>2]|0)<(s|0))c[l>>2]=s;c[j+1310736+(k+-1<<2)>>2]=x;k=q;break}k=b[a+-2>>1]|0;if(k<<16>>16>0){b[a>>1]=k;k=(k<<16>>16)*7|0;p=j+1310736+(k+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=j+1310736+(k+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=j+1310736+(k+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+x;k=j+1310736+(k+-3<<2)|0;if((c[k>>2]|0)>=(s|0)){k=q;break}c[k>>2]=s;k=q;break}else{k=q+1|0;if((q|0)>32767)break b;b[a>>1]=k;c[j+1179664+(q<<2)>>2]=k<<16>>16;q=q*7|0;c[j+1310736+(q<<2)>>2]=1;c[j+1310736+(q+1<<2)>>2]=s;c[j+1310736+(q+2<<2)>>2]=x;c[j+1310736+(q+3<<2)>>2]=s;c[j+1310736+(q+4<<2)>>2]=s;c[j+1310736+(q+5<<2)>>2]=x;c[j+1310736+(q+6<<2)>>2]=x;break}}if(l){k=c[j+1179664+(o+-1<<2)>>2]|0;o=c[j+1179664+(p+-1<<2)>>2]|0;if((k|0)>(o|0)){b[a>>1]=o;if((q|0)>0){l=0;g=m;while(1){if((c[g>>2]|0)==(k|0))c[g>>2]=o;l=l+1|0;if((l|0)>=(q|0)){k=o;break}else g=g+4|0}}else k=o}else{b[a>>1]=k;if((k|0)<(o|0)&(q|0)>0){l=0;g=m;while(1){if((c[g>>2]|0)==(o|0))c[g>>2]=k;l=l+1|0;if((l|0)>=(q|0))break;else g=g+4|0}}}k=(k<<16>>16)*7|0;p=j+1310736+(k+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=j+1310736+(k+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;p=j+1310736+(k+-5<<2)|0;c[p>>2]=(c[p>>2]|0)+x;c[j+1310736+(k+-1<<2)>>2]=x;k=q;break}k=b[a+-2>>1]|0;if(k<<16>>16<=0){b[a>>1]=g;k=o*7|0;l=j+1310736+(k+-7<<2)|0;c[l>>2]=(c[l>>2]|0)+1;l=j+1310736+(k+-6<<2)|0;c[l>>2]=(c[l>>2]|0)+s;l=j+1310736+(k+-5<<2)|0;c[l>>2]=(c[l>>2]|0)+x;l=j+1310736+(k+-4<<2)|0;if((c[l>>2]|0)>(s|0))c[l>>2]=s;c[j+1310736+(k+-1<<2)>>2]=x;k=q;break}o=c[j+1179664+(o+-1<<2)>>2]|0;k=c[j+1179664+((k<<16>>16)+-1<<2)>>2]|0;if((o|0)>(k|0)){b[a>>1]=k;if((q|0)>0){l=0;g=m;while(1){if((c[g>>2]|0)==(o|0))c[g>>2]=k;l=l+1|0;if((l|0)>=(q|0))break;else g=g+4|0}}}else{b[a>>1]=o;if((o|0)<(k|0)&(q|0)>0){l=0;g=m;while(1){if((c[g>>2]|0)==(k|0))c[g>>2]=o;l=l+1|0;if((l|0)>=(q|0)){k=o;break}else g=g+4|0}}else k=o}k=(k<<16>>16)*7|0;p=j+1310736+(k+-7<<2)|0;c[p>>2]=(c[p>>2]|0)+1;p=j+1310736+(k+-6<<2)|0;c[p>>2]=(c[p>>2]|0)+s;k=j+1310736+(k+-5<<2)|0;c[k>>2]=(c[k>>2]|0)+x;k=q}else{b[a>>1]=0;k=q}while(0);s=s+1|0;l=r+1|0;n=n+1|0;a=a+2|0;if((s|0)>=(y|0))break;else{r=l;q=k}}}x=x+1|0;if((x|0)>=(z|0)){o=k;B=52;break a}else{l=l+2|0;a=a+4|0;n=n+2|0}}Me(3,3904,A);k=-1}else{o=0;B=52}while(0);if((B|0)==52){n=j+12|0;if((o|0)<1)l=1;else{a=1;l=1;while(1){k=c[m>>2]|0;if((k|0)==(a|0)){k=l;l=l+1|0}else k=c[j+1179664+(k+-1<<2)>>2]|0;c[m>>2]=k;if((a|0)<(o|0)){a=a+1|0;m=m+4|0}else break}}g=j+8|0;k=l+-1|0;c[g>>2]=k;if(k){ek(n|0,0,k<<2|0)|0;ek(j+655376|0,0,k<<4|0)|0;if((l|0)>1){k=0;do{B=k<<2;c[j+131084+(B<<2)>>2]=e;c[j+131084+((B|1)<<2)>>2]=0;c[j+131084+((B|2)<<2)>>2]=f;c[j+131084+((B|3)<<2)>>2]=0;k=k+1|0}while((k|0)<(c[g>>2]|0))}if((o|0)>0){n=0;do{m=(c[j+1179664+(n<<2)>>2]|0)+-1|0;a=n*7|0;k=j+12+(m<<2)|0;c[k>>2]=(c[k>>2]|0)+(c[j+1310736+(a<<2)>>2]|0);k=m<<1;l=j+655376+(k<<3)|0;h[l>>3]=+h[l>>3]+ +(c[j+1310736+(a+1<<2)>>2]|0);k=j+655376+((k|1)<<3)|0;h[k>>3]=+h[k>>3]+ +(c[j+1310736+(a+2<<2)>>2]|0);m=m<<2;k=j+131084+(m<<2)|0;l=c[j+1310736+(a+3<<2)>>2]|0;if((c[k>>2]|0)>(l|0))c[k>>2]=l;k=j+131084+((m|1)<<2)|0;l=c[j+1310736+(a+4<<2)>>2]|0;if((c[k>>2]|0)<(l|0))c[k>>2]=l;k=j+131084+((m|2)<<2)|0;l=c[j+1310736+(a+5<<2)>>2]|0;if((c[k>>2]|0)>(l|0))c[k>>2]=l;l=j+131084+((m|3)<<2)|0;k=c[j+1310736+(a+6<<2)>>2]|0;if((c[l>>2]|0)<(k|0))c[l>>2]=k;n=n+1|0}while((n|0)<(o|0))}if((c[g>>2]|0)>0){k=0;do{e=j+12+(k<<2)|0;f=k<<1;B=j+655376+(f<<3)|0;h[B>>3]=+h[B>>3]/+(c[e>>2]|0);f=j+655376+((f|1)<<3)|0;h[f>>3]=+h[f>>3]/+(c[e>>2]|0);k=k+1|0}while((k|0)<(c[g>>2]|0));k=0}else k=0}else k=0}i=C;return k|0}function Zc(e,f,g,j,k){e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;F=i;i=i+16|0;B=F;D=(f|0)/2|0;E=(g|0)/2|0;o=c[k>>2]|0;A=E+-1|0;if((f|0)>1){l=0;m=o;n=o+(($(A,D)|0)<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(D|0))break;else{m=m+2|0;n=n+2|0}}}y=j*3|0;z=D+-1|0;if((g|0)>1){l=0;j=o;m=o+(z<<1)|0;while(1){b[m>>1]=0;b[j>>1]=0;l=l+1|0;if((l|0)>=(E|0))break;else{j=j+(D<<1)|0;m=m+(D<<1)|0}}}m=k+1179664|0;j=D+1|0;v=0-D|0;t=1-D|0;u=~D;s=(f*3|0)+12|0;a:do if((A|0)>1){w=(z|0)>1;l=(c[k+4>>2]|0)+j|0;x=1;n=e+((f*6|0)+6)|0;g=o+(j<<1)|0;j=0;b:while(1){if(w){r=1;q=n;p=j;while(1){do if(((d[q+1>>0]|0)+(d[q>>0]|0)+(d[q+2>>0]|0)|0)>(y|0)){b[g>>1]=0;a[l>>0]=0;j=p}else{a[l>>0]=-1;j=b[g+(v<<1)>>1]|0;if(j<<16>>16>0){b[g>>1]=j;j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=k+1310736+(j+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+x;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}e=b[g+(t<<1)>>1]|0;f=e<<16>>16;j=b[g+(u<<1)>>1]|0;o=j<<16>>16;n=j<<16>>16>0;if(e<<16>>16<=0){if(n){b[g>>1]=j;j=o*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+r;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+x;n=k+1310736+(j+-3<<2)|0;if((c[n>>2]|0)<(r|0))c[n>>2]=r;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}j=b[g+-2>>1]|0;if(j<<16>>16>0){b[g>>1]=j;j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=k+1310736+(j+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+x;j=k+1310736+(j+-3<<2)|0;if((c[j>>2]|0)>=(r|0)){j=p;break}c[j>>2]=r;j=p;break}else{j=p+1|0;if((p|0)>32767)break b;b[g>>1]=j;c[k+1179664+(p<<2)>>2]=j<<16>>16;p=p*7|0;c[k+1310736+(p<<2)>>2]=1;c[k+1310736+(p+1<<2)>>2]=r;c[k+1310736+(p+2<<2)>>2]=x;c[k+1310736+(p+3<<2)>>2]=r;c[k+1310736+(p+4<<2)>>2]=r;c[k+1310736+(p+5<<2)>>2]=x;c[k+1310736+(p+6<<2)>>2]=x;break}}if(n){j=c[k+1179664+(f+-1<<2)>>2]|0;f=c[k+1179664+(o+-1<<2)>>2]|0;if((j|0)>(f|0)){b[g>>1]=f;if((p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(j|0))c[e>>2]=f;n=n+1|0;if((n|0)>=(p|0)){j=f;break}else e=e+4|0}}else j=f}else{b[g>>1]=j;if((j|0)<(f|0)&(p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(f|0))c[e>>2]=j;n=n+1|0;if((n|0)>=(p|0))break;else e=e+4|0}}}j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=k+1310736+(j+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+x;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}n=b[g+-2>>1]|0;if(n<<16>>16<=0){b[g>>1]=e;j=f*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+r;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+x;n=k+1310736+(j+-4<<2)|0;if((c[n>>2]|0)>(r|0))c[n>>2]=r;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}j=c[k+1179664+(f+-1<<2)>>2]|0;f=c[k+1179664+((n<<16>>16)+-1<<2)>>2]|0;if((j|0)>(f|0)){b[g>>1]=f;if((p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(j|0))c[e>>2]=f;n=n+1|0;if((n|0)>=(p|0)){j=f;break}else e=e+4|0}}else j=f}else{b[g>>1]=j;if((j|0)<(f|0)&(p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(f|0))c[e>>2]=j;n=n+1|0;if((n|0)>=(p|0))break;else e=e+4|0}}}j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;j=k+1310736+(j+-5<<2)|0;c[j>>2]=(c[j>>2]|0)+x;j=p}while(0);r=r+1|0;n=q+6|0;g=g+2|0;l=l+1|0;if((r|0)>=(z|0))break;else{q=n;p=j}}}x=x+1|0;if((x|0)>=(A|0)){f=j;C=52;break a}else{l=l+2|0;n=n+s|0;g=g+4|0}}Me(3,3904,B);l=-1}else{f=0;C=52}while(0);if((C|0)==52){g=k+12|0;if((f|0)<1)j=1;else{n=1;j=1;while(1){l=c[m>>2]|0;if((l|0)==(n|0)){l=j;j=j+1|0}else l=c[k+1179664+(l+-1<<2)>>2]|0;c[m>>2]=l;if((n|0)<(f|0)){n=n+1|0;m=m+4|0}else break}}e=k+8|0;l=j+-1|0;c[e>>2]=l;if(l){ek(g|0,0,l<<2|0)|0;ek(k+655376|0,0,l<<4|0)|0;if((j|0)>1){l=0;do{C=l<<2;c[k+131084+(C<<2)>>2]=D;c[k+131084+((C|1)<<2)>>2]=0;c[k+131084+((C|2)<<2)>>2]=E;c[k+131084+((C|3)<<2)>>2]=0;l=l+1|0}while((l|0)<(c[e>>2]|0))}if((f|0)>0){g=0;do{m=(c[k+1179664+(g<<2)>>2]|0)+-1|0;n=g*7|0;l=k+12+(m<<2)|0;c[l>>2]=(c[l>>2]|0)+(c[k+1310736+(n<<2)>>2]|0);l=m<<1;j=k+655376+(l<<3)|0;h[j>>3]=+h[j>>3]+ +(c[k+1310736+(n+1<<2)>>2]|0);l=k+655376+((l|1)<<3)|0;h[l>>3]=+h[l>>3]+ +(c[k+1310736+(n+2<<2)>>2]|0);m=m<<2;l=k+131084+(m<<2)|0;j=c[k+1310736+(n+3<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;l=k+131084+((m|1)<<2)|0;j=c[k+1310736+(n+4<<2)>>2]|0;if((c[l>>2]|0)<(j|0))c[l>>2]=j;l=k+131084+((m|2)<<2)|0;j=c[k+1310736+(n+5<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;j=k+131084+((m|3)<<2)|0;l=c[k+1310736+(n+6<<2)>>2]|0;if((c[j>>2]|0)<(l|0))c[j>>2]=l;g=g+1|0}while((g|0)<(f|0))}if((c[e>>2]|0)>0){l=0;do{D=k+12+(l<<2)|0;E=l<<1;C=k+655376+(E<<3)|0;h[C>>3]=+h[C>>3]/+(c[D>>2]|0);E=k+655376+((E|1)<<3)|0;h[E>>3]=+h[E>>3]/+(c[D>>2]|0);l=l+1|0}while((l|0)<(c[e>>2]|0));l=0}else l=0}else l=0}i=F;return l|0}function _c(e,f,g,j,k){e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;F=i;i=i+16|0;B=F;D=(f|0)/2|0;E=(g|0)/2|0;o=c[k>>2]|0;A=E+-1|0;if((f|0)>1){l=0;m=o;n=o+(($(A,D)|0)<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(D|0))break;else{m=m+2|0;n=n+2|0}}}y=j*3|0;z=D+-1|0;if((g|0)>1){l=0;j=o;m=o+(z<<1)|0;while(1){b[m>>1]=0;b[j>>1]=0;l=l+1|0;if((l|0)>=(E|0))break;else{j=j+(D<<1)|0;m=m+(D<<1)|0}}}m=k+1179664|0;j=D+1|0;v=0-D|0;t=1-D|0;u=~D;s=(f<<1)+8|0;a:do if((A|0)>1){w=(z|0)>1;l=(c[k+4>>2]|0)+j|0;x=1;n=e+((f<<2)+4)|0;g=o+(j<<1)|0;j=0;b:while(1){if(w){r=1;q=n;p=j;while(1){f=d[q>>0]|0;o=d[q+1>>0]|0;do if(((f&248)+10+(f<<5&224)+(o>>>3&28)+(o<<3&248)|0)>(y|0)){b[g>>1]=0;a[l>>0]=0;j=p}else{a[l>>0]=-1;j=b[g+(v<<1)>>1]|0;if(j<<16>>16>0){b[g>>1]=j;j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=k+1310736+(j+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+x;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}e=b[g+(t<<1)>>1]|0;f=e<<16>>16;j=b[g+(u<<1)>>1]|0;o=j<<16>>16;n=j<<16>>16>0;if(e<<16>>16<=0){if(n){b[g>>1]=j;j=o*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+r;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+x;n=k+1310736+(j+-3<<2)|0;if((c[n>>2]|0)<(r|0))c[n>>2]=r;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}j=b[g+-2>>1]|0;if(j<<16>>16>0){b[g>>1]=j;j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=k+1310736+(j+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+x;j=k+1310736+(j+-3<<2)|0;if((c[j>>2]|0)>=(r|0)){j=p;break}c[j>>2]=r;j=p;break}else{j=p+1|0;if((p|0)>32767)break b;b[g>>1]=j;c[k+1179664+(p<<2)>>2]=j<<16>>16;p=p*7|0;c[k+1310736+(p<<2)>>2]=1;c[k+1310736+(p+1<<2)>>2]=r;c[k+1310736+(p+2<<2)>>2]=x;c[k+1310736+(p+3<<2)>>2]=r;c[k+1310736+(p+4<<2)>>2]=r;c[k+1310736+(p+5<<2)>>2]=x;c[k+1310736+(p+6<<2)>>2]=x;break}}if(n){j=c[k+1179664+(f+-1<<2)>>2]|0;f=c[k+1179664+(o+-1<<2)>>2]|0;if((j|0)>(f|0)){b[g>>1]=f;if((p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(j|0))c[e>>2]=f;n=n+1|0;if((n|0)>=(p|0)){j=f;break}else e=e+4|0}}else j=f}else{b[g>>1]=j;if((j|0)<(f|0)&(p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(f|0))c[e>>2]=j;n=n+1|0;if((n|0)>=(p|0))break;else e=e+4|0}}}j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=k+1310736+(j+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+x;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}n=b[g+-2>>1]|0;if(n<<16>>16<=0){b[g>>1]=e;j=f*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+r;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+x;n=k+1310736+(j+-4<<2)|0;if((c[n>>2]|0)>(r|0))c[n>>2]=r;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}j=c[k+1179664+(f+-1<<2)>>2]|0;f=c[k+1179664+((n<<16>>16)+-1<<2)>>2]|0;if((j|0)>(f|0)){b[g>>1]=f;if((p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(j|0))c[e>>2]=f;n=n+1|0;if((n|0)>=(p|0)){j=f;break}else e=e+4|0}}else j=f}else{b[g>>1]=j;if((j|0)<(f|0)&(p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(f|0))c[e>>2]=j;n=n+1|0;if((n|0)>=(p|0))break;else e=e+4|0}}}j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;j=k+1310736+(j+-5<<2)|0;c[j>>2]=(c[j>>2]|0)+x;j=p}while(0);r=r+1|0;n=q+4|0;g=g+2|0;l=l+1|0;if((r|0)>=(z|0))break;else{q=n;p=j}}}x=x+1|0;if((x|0)>=(A|0)){f=j;C=52;break a}else{l=l+2|0;n=n+s|0;g=g+4|0}}Me(3,3904,B);l=-1}else{f=0;C=52}while(0);if((C|0)==52){g=k+12|0;if((f|0)<1)j=1;else{n=1;j=1;while(1){l=c[m>>2]|0;if((l|0)==(n|0)){l=j;j=j+1|0}else l=c[k+1179664+(l+-1<<2)>>2]|0;c[m>>2]=l;if((n|0)<(f|0)){n=n+1|0;m=m+4|0}else break}}e=k+8|0;l=j+-1|0;c[e>>2]=l;if(l){ek(g|0,0,l<<2|0)|0;ek(k+655376|0,0,l<<4|0)|0;if((j|0)>1){l=0;do{C=l<<2;c[k+131084+(C<<2)>>2]=D;c[k+131084+((C|1)<<2)>>2]=0;c[k+131084+((C|2)<<2)>>2]=E;c[k+131084+((C|3)<<2)>>2]=0;l=l+1|0}while((l|0)<(c[e>>2]|0))}if((f|0)>0){g=0;do{m=(c[k+1179664+(g<<2)>>2]|0)+-1|0;n=g*7|0;l=k+12+(m<<2)|0;c[l>>2]=(c[l>>2]|0)+(c[k+1310736+(n<<2)>>2]|0);l=m<<1;j=k+655376+(l<<3)|0;h[j>>3]=+h[j>>3]+ +(c[k+1310736+(n+1<<2)>>2]|0);l=k+655376+((l|1)<<3)|0;h[l>>3]=+h[l>>3]+ +(c[k+1310736+(n+2<<2)>>2]|0);m=m<<2;l=k+131084+(m<<2)|0;j=c[k+1310736+(n+3<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;l=k+131084+((m|1)<<2)|0;j=c[k+1310736+(n+4<<2)>>2]|0;if((c[l>>2]|0)<(j|0))c[l>>2]=j;l=k+131084+((m|2)<<2)|0;j=c[k+1310736+(n+5<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;j=k+131084+((m|3)<<2)|0;l=c[k+1310736+(n+6<<2)>>2]|0;if((c[j>>2]|0)<(l|0))c[j>>2]=l;g=g+1|0}while((g|0)<(f|0))}if((c[e>>2]|0)>0){l=0;do{D=k+12+(l<<2)|0;E=l<<1;C=k+655376+(E<<3)|0;h[C>>3]=+h[C>>3]/+(c[D>>2]|0);E=k+655376+((E|1)<<3)|0;h[E>>3]=+h[E>>3]/+(c[D>>2]|0);l=l+1|0}while((l|0)<(c[e>>2]|0));l=0}else l=0}else l=0}i=F;return l|0}function $c(e,f,g,j,k){e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;F=i;i=i+16|0;B=F;D=(f|0)/2|0;E=(g|0)/2|0;o=c[k>>2]|0;A=E+-1|0;if((f|0)>1){l=0;m=o;n=o+(($(A,D)|0)<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(D|0))break;else{m=m+2|0;n=n+2|0}}}y=j*3|0;z=D+-1|0;if((g|0)>1){l=0;j=o;m=o+(z<<1)|0;while(1){b[m>>1]=0;b[j>>1]=0;l=l+1|0;if((l|0)>=(E|0))break;else{j=j+(D<<1)|0;m=m+(D<<1)|0}}}m=k+1179664|0;j=D+1|0;v=0-D|0;t=1-D|0;u=~D;s=(f<<2)+16|0;a:do if((A|0)>1){w=(z|0)>1;l=(c[k+4>>2]|0)+j|0;x=1;n=e+((f<<3)+8)|0;g=o+(j<<1)|0;j=0;b:while(1){if(w){r=1;q=n;p=j;while(1){do if(((d[q+1>>0]|0)+(d[q>>0]|0)+(d[q+2>>0]|0)|0)>(y|0)){b[g>>1]=0;a[l>>0]=0;j=p}else{a[l>>0]=-1;j=b[g+(v<<1)>>1]|0;if(j<<16>>16>0){b[g>>1]=j;j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=k+1310736+(j+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+x;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}e=b[g+(t<<1)>>1]|0;f=e<<16>>16;j=b[g+(u<<1)>>1]|0;o=j<<16>>16;n=j<<16>>16>0;if(e<<16>>16<=0){if(n){b[g>>1]=j;j=o*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+r;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+x;n=k+1310736+(j+-3<<2)|0;if((c[n>>2]|0)<(r|0))c[n>>2]=r;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}j=b[g+-2>>1]|0;if(j<<16>>16>0){b[g>>1]=j;j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=k+1310736+(j+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+x;j=k+1310736+(j+-3<<2)|0;if((c[j>>2]|0)>=(r|0)){j=p;break}c[j>>2]=r;j=p;break}else{j=p+1|0;if((p|0)>32767)break b;b[g>>1]=j;c[k+1179664+(p<<2)>>2]=j<<16>>16;p=p*7|0;c[k+1310736+(p<<2)>>2]=1;c[k+1310736+(p+1<<2)>>2]=r;c[k+1310736+(p+2<<2)>>2]=x;c[k+1310736+(p+3<<2)>>2]=r;c[k+1310736+(p+4<<2)>>2]=r;c[k+1310736+(p+5<<2)>>2]=x;c[k+1310736+(p+6<<2)>>2]=x;break}}if(n){j=c[k+1179664+(f+-1<<2)>>2]|0;f=c[k+1179664+(o+-1<<2)>>2]|0;if((j|0)>(f|0)){b[g>>1]=f;if((p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(j|0))c[e>>2]=f;n=n+1|0;if((n|0)>=(p|0)){j=f;break}else e=e+4|0}}else j=f}else{b[g>>1]=j;if((j|0)<(f|0)&(p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(f|0))c[e>>2]=j;n=n+1|0;if((n|0)>=(p|0))break;else e=e+4|0}}}j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=k+1310736+(j+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+x;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}n=b[g+-2>>1]|0;if(n<<16>>16<=0){b[g>>1]=e;j=f*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+r;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+x;n=k+1310736+(j+-4<<2)|0;if((c[n>>2]|0)>(r|0))c[n>>2]=r;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}j=c[k+1179664+(f+-1<<2)>>2]|0;f=c[k+1179664+((n<<16>>16)+-1<<2)>>2]|0;if((j|0)>(f|0)){b[g>>1]=f;if((p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(j|0))c[e>>2]=f;n=n+1|0;if((n|0)>=(p|0)){j=f;break}else e=e+4|0}}else j=f}else{b[g>>1]=j;if((j|0)<(f|0)&(p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(f|0))c[e>>2]=j;n=n+1|0;if((n|0)>=(p|0))break;else e=e+4|0}}}j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;j=k+1310736+(j+-5<<2)|0;c[j>>2]=(c[j>>2]|0)+x;j=p}while(0);r=r+1|0;n=q+8|0;g=g+2|0;l=l+1|0;if((r|0)>=(z|0))break;else{q=n;p=j}}}x=x+1|0;if((x|0)>=(A|0)){f=j;C=52;break a}else{l=l+2|0;n=n+s|0;g=g+4|0}}Me(3,3904,B);l=-1}else{f=0;C=52}while(0);if((C|0)==52){g=k+12|0;if((f|0)<1)j=1;else{n=1;j=1;while(1){l=c[m>>2]|0;if((l|0)==(n|0)){l=j;j=j+1|0}else l=c[k+1179664+(l+-1<<2)>>2]|0;c[m>>2]=l;if((n|0)<(f|0)){n=n+1|0;m=m+4|0}else break}}e=k+8|0;l=j+-1|0;c[e>>2]=l;if(l){ek(g|0,0,l<<2|0)|0;ek(k+655376|0,0,l<<4|0)|0;if((j|0)>1){l=0;do{C=l<<2;c[k+131084+(C<<2)>>2]=D;c[k+131084+((C|1)<<2)>>2]=0;c[k+131084+((C|2)<<2)>>2]=E;c[k+131084+((C|3)<<2)>>2]=0;l=l+1|0}while((l|0)<(c[e>>2]|0))}if((f|0)>0){g=0;do{m=(c[k+1179664+(g<<2)>>2]|0)+-1|0;n=g*7|0;l=k+12+(m<<2)|0;c[l>>2]=(c[l>>2]|0)+(c[k+1310736+(n<<2)>>2]|0);l=m<<1;j=k+655376+(l<<3)|0;h[j>>3]=+h[j>>3]+ +(c[k+1310736+(n+1<<2)>>2]|0);l=k+655376+((l|1)<<3)|0;h[l>>3]=+h[l>>3]+ +(c[k+1310736+(n+2<<2)>>2]|0);m=m<<2;l=k+131084+(m<<2)|0;j=c[k+1310736+(n+3<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;l=k+131084+((m|1)<<2)|0;j=c[k+1310736+(n+4<<2)>>2]|0;if((c[l>>2]|0)<(j|0))c[l>>2]=j;l=k+131084+((m|2)<<2)|0;j=c[k+1310736+(n+5<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;j=k+131084+((m|3)<<2)|0;l=c[k+1310736+(n+6<<2)>>2]|0;if((c[j>>2]|0)<(l|0))c[j>>2]=l;g=g+1|0}while((g|0)<(f|0))}if((c[e>>2]|0)>0){l=0;do{D=k+12+(l<<2)|0;E=l<<1;C=k+655376+(E<<3)|0;h[C>>3]=+h[C>>3]/+(c[D>>2]|0);E=k+655376+((E|1)<<3)|0;h[E>>3]=+h[E>>3]/+(c[D>>2]|0);l=l+1|0}while((l|0)<(c[e>>2]|0));l=0}else l=0}else l=0}i=F;return l|0}function ad(e,f,g,j,k){e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;F=i;i=i+16|0;B=F;D=(f|0)/2|0;E=(g|0)/2|0;o=c[k>>2]|0;A=E+-1|0;if((f|0)>1){l=0;m=o;n=o+(($(A,D)|0)<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(D|0))break;else{m=m+2|0;n=n+2|0}}}y=j*3|0;z=D+-1|0;if((g|0)>1){l=0;j=o;m=o+(z<<1)|0;while(1){b[m>>1]=0;b[j>>1]=0;l=l+1|0;if((l|0)>=(E|0))break;else{j=j+(D<<1)|0;m=m+(D<<1)|0}}}m=k+1179664|0;j=D+1|0;v=0-D|0;t=1-D|0;u=~D;s=(f<<1)+8|0;a:do if((A|0)>1){w=(z|0)>1;l=(c[k+4>>2]|0)+j|0;x=1;n=e+((f<<2)+4)|0;g=o+(j<<1)|0;j=0;b:while(1){if(w){r=1;q=n;p=j;while(1){o=d[q>>0]|0;do if(((o&240)+24+(o<<4&240)+((d[q+1>>0]|0)&240)|0)>(y|0)){b[g>>1]=0;a[l>>0]=0;j=p}else{a[l>>0]=-1;j=b[g+(v<<1)>>1]|0;if(j<<16>>16>0){b[g>>1]=j;j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=k+1310736+(j+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+x;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}e=b[g+(t<<1)>>1]|0;f=e<<16>>16;j=b[g+(u<<1)>>1]|0;o=j<<16>>16;n=j<<16>>16>0;if(e<<16>>16<=0){if(n){b[g>>1]=j;j=o*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+r;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+x;n=k+1310736+(j+-3<<2)|0;if((c[n>>2]|0)<(r|0))c[n>>2]=r;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}j=b[g+-2>>1]|0;if(j<<16>>16>0){b[g>>1]=j;j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=k+1310736+(j+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+x;j=k+1310736+(j+-3<<2)|0;if((c[j>>2]|0)>=(r|0)){j=p;break}c[j>>2]=r;j=p;break}else{j=p+1|0;if((p|0)>32767)break b;b[g>>1]=j;c[k+1179664+(p<<2)>>2]=j<<16>>16;p=p*7|0;c[k+1310736+(p<<2)>>2]=1;c[k+1310736+(p+1<<2)>>2]=r;c[k+1310736+(p+2<<2)>>2]=x;c[k+1310736+(p+3<<2)>>2]=r;c[k+1310736+(p+4<<2)>>2]=r;c[k+1310736+(p+5<<2)>>2]=x;c[k+1310736+(p+6<<2)>>2]=x;break}}if(n){j=c[k+1179664+(f+-1<<2)>>2]|0;f=c[k+1179664+(o+-1<<2)>>2]|0;if((j|0)>(f|0)){b[g>>1]=f;if((p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(j|0))c[e>>2]=f;n=n+1|0;if((n|0)>=(p|0)){j=f;break}else e=e+4|0}}else j=f}else{b[g>>1]=j;if((j|0)<(f|0)&(p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(f|0))c[e>>2]=j;n=n+1|0;if((n|0)>=(p|0))break;else e=e+4|0}}}j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=k+1310736+(j+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+x;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}n=b[g+-2>>1]|0;if(n<<16>>16<=0){b[g>>1]=e;j=f*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+r;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+x;n=k+1310736+(j+-4<<2)|0;if((c[n>>2]|0)>(r|0))c[n>>2]=r;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}j=c[k+1179664+(f+-1<<2)>>2]|0;f=c[k+1179664+((n<<16>>16)+-1<<2)>>2]|0;if((j|0)>(f|0)){b[g>>1]=f;if((p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(j|0))c[e>>2]=f;n=n+1|0;if((n|0)>=(p|0)){j=f;break}else e=e+4|0}}else j=f}else{b[g>>1]=j;if((j|0)<(f|0)&(p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(f|0))c[e>>2]=j;n=n+1|0;if((n|0)>=(p|0))break;else e=e+4|0}}}j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;j=k+1310736+(j+-5<<2)|0;c[j>>2]=(c[j>>2]|0)+x;j=p}while(0);r=r+1|0;n=q+4|0;g=g+2|0;l=l+1|0;if((r|0)>=(z|0))break;else{q=n;p=j}}}x=x+1|0;if((x|0)>=(A|0)){f=j;C=52;break a}else{l=l+2|0;n=n+s|0;g=g+4|0}}Me(3,3904,B);l=-1}else{f=0;C=52}while(0);if((C|0)==52){g=k+12|0;if((f|0)<1)j=1;else{n=1;j=1;while(1){l=c[m>>2]|0;if((l|0)==(n|0)){l=j;j=j+1|0}else l=c[k+1179664+(l+-1<<2)>>2]|0;c[m>>2]=l;if((n|0)<(f|0)){n=n+1|0;m=m+4|0}else break}}e=k+8|0;l=j+-1|0;c[e>>2]=l;if(l){ek(g|0,0,l<<2|0)|0;ek(k+655376|0,0,l<<4|0)|0;if((j|0)>1){l=0;do{C=l<<2;c[k+131084+(C<<2)>>2]=D;c[k+131084+((C|1)<<2)>>2]=0;c[k+131084+((C|2)<<2)>>2]=E;c[k+131084+((C|3)<<2)>>2]=0;l=l+1|0}while((l|0)<(c[e>>2]|0))}if((f|0)>0){g=0;do{m=(c[k+1179664+(g<<2)>>2]|0)+-1|0;n=g*7|0;l=k+12+(m<<2)|0;c[l>>2]=(c[l>>2]|0)+(c[k+1310736+(n<<2)>>2]|0);l=m<<1;j=k+655376+(l<<3)|0;h[j>>3]=+h[j>>3]+ +(c[k+1310736+(n+1<<2)>>2]|0);l=k+655376+((l|1)<<3)|0;h[l>>3]=+h[l>>3]+ +(c[k+1310736+(n+2<<2)>>2]|0);m=m<<2;l=k+131084+(m<<2)|0;j=c[k+1310736+(n+3<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;l=k+131084+((m|1)<<2)|0;j=c[k+1310736+(n+4<<2)>>2]|0;if((c[l>>2]|0)<(j|0))c[l>>2]=j;l=k+131084+((m|2)<<2)|0;j=c[k+1310736+(n+5<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;j=k+131084+((m|3)<<2)|0;l=c[k+1310736+(n+6<<2)>>2]|0;if((c[j>>2]|0)<(l|0))c[j>>2]=l;g=g+1|0}while((g|0)<(f|0))}if((c[e>>2]|0)>0){l=0;do{D=k+12+(l<<2)|0;E=l<<1;C=k+655376+(E<<3)|0;h[C>>3]=+h[C>>3]/+(c[D>>2]|0);E=k+655376+((E|1)<<3)|0;h[E>>3]=+h[E>>3]/+(c[D>>2]|0);l=l+1|0}while((l|0)<(c[e>>2]|0));l=0}else l=0}else l=0}i=F;return l|0}function bd(e,f,g,j,k){e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;F=i;i=i+16|0;B=F;D=(f|0)/2|0;E=(g|0)/2|0;o=c[k>>2]|0;A=E+-1|0;if((f|0)>1){l=0;m=o;n=o+(($(A,D)|0)<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(D|0))break;else{m=m+2|0;n=n+2|0}}}y=j*3|0;z=D+-1|0;if((g|0)>1){l=0;j=o;m=o+(z<<1)|0;while(1){b[m>>1]=0;b[j>>1]=0;l=l+1|0;if((l|0)>=(E|0))break;else{j=j+(D<<1)|0;m=m+(D<<1)|0}}}m=k+1179664|0;j=D+1|0;v=0-D|0;t=1-D|0;u=~D;s=(f<<1)+8|0;a:do if((A|0)>1){w=(z|0)>1;l=(c[k+4>>2]|0)+j|0;x=1;n=e+((f<<2)+4)|0;g=o+(j<<1)|0;j=0;b:while(1){if(w){r=1;q=n;p=j;while(1){f=d[q>>0]|0;o=d[q+1>>0]|0;do if(((f&248)+12+(f<<5&224)+(o>>>3&24)+(o<<2&248)|0)>(y|0)){b[g>>1]=0;a[l>>0]=0;j=p}else{a[l>>0]=-1;j=b[g+(v<<1)>>1]|0;if(j<<16>>16>0){b[g>>1]=j;j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=k+1310736+(j+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+x;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}e=b[g+(t<<1)>>1]|0;f=e<<16>>16;j=b[g+(u<<1)>>1]|0;o=j<<16>>16;n=j<<16>>16>0;if(e<<16>>16<=0){if(n){b[g>>1]=j;j=o*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+r;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+x;n=k+1310736+(j+-3<<2)|0;if((c[n>>2]|0)<(r|0))c[n>>2]=r;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}j=b[g+-2>>1]|0;if(j<<16>>16>0){b[g>>1]=j;j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=k+1310736+(j+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+x;j=k+1310736+(j+-3<<2)|0;if((c[j>>2]|0)>=(r|0)){j=p;break}c[j>>2]=r;j=p;break}else{j=p+1|0;if((p|0)>32767)break b;b[g>>1]=j;c[k+1179664+(p<<2)>>2]=j<<16>>16;p=p*7|0;c[k+1310736+(p<<2)>>2]=1;c[k+1310736+(p+1<<2)>>2]=r;c[k+1310736+(p+2<<2)>>2]=x;c[k+1310736+(p+3<<2)>>2]=r;c[k+1310736+(p+4<<2)>>2]=r;c[k+1310736+(p+5<<2)>>2]=x;c[k+1310736+(p+6<<2)>>2]=x;break}}if(n){j=c[k+1179664+(f+-1<<2)>>2]|0;f=c[k+1179664+(o+-1<<2)>>2]|0;if((j|0)>(f|0)){b[g>>1]=f;if((p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(j|0))c[e>>2]=f;n=n+1|0;if((n|0)>=(p|0)){j=f;break}else e=e+4|0}}else j=f}else{b[g>>1]=j;if((j|0)<(f|0)&(p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(f|0))c[e>>2]=j;n=n+1|0;if((n|0)>=(p|0))break;else e=e+4|0}}}j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=k+1310736+(j+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+x;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}n=b[g+-2>>1]|0;if(n<<16>>16<=0){b[g>>1]=e;j=f*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+r;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+x;n=k+1310736+(j+-4<<2)|0;if((c[n>>2]|0)>(r|0))c[n>>2]=r;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}j=c[k+1179664+(f+-1<<2)>>2]|0;f=c[k+1179664+((n<<16>>16)+-1<<2)>>2]|0;if((j|0)>(f|0)){b[g>>1]=f;if((p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(j|0))c[e>>2]=f;n=n+1|0;if((n|0)>=(p|0)){j=f;break}else e=e+4|0}}else j=f}else{b[g>>1]=j;if((j|0)<(f|0)&(p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(f|0))c[e>>2]=j;n=n+1|0;if((n|0)>=(p|0))break;else e=e+4|0}}}j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;j=k+1310736+(j+-5<<2)|0;c[j>>2]=(c[j>>2]|0)+x;j=p}while(0);r=r+1|0;n=q+4|0;g=g+2|0;l=l+1|0;if((r|0)>=(z|0))break;else{q=n;p=j}}}x=x+1|0;if((x|0)>=(A|0)){f=j;C=52;break a}else{l=l+2|0;n=n+s|0;g=g+4|0}}Me(3,3904,B);l=-1}else{f=0;C=52}while(0);if((C|0)==52){g=k+12|0;if((f|0)<1)j=1;else{n=1;j=1;while(1){l=c[m>>2]|0;if((l|0)==(n|0)){l=j;j=j+1|0}else l=c[k+1179664+(l+-1<<2)>>2]|0;c[m>>2]=l;if((n|0)<(f|0)){n=n+1|0;m=m+4|0}else break}}e=k+8|0;l=j+-1|0;c[e>>2]=l;if(l){ek(g|0,0,l<<2|0)|0;ek(k+655376|0,0,l<<4|0)|0;if((j|0)>1){l=0;do{C=l<<2;c[k+131084+(C<<2)>>2]=D;c[k+131084+((C|1)<<2)>>2]=0;c[k+131084+((C|2)<<2)>>2]=E;c[k+131084+((C|3)<<2)>>2]=0;l=l+1|0}while((l|0)<(c[e>>2]|0))}if((f|0)>0){g=0;do{m=(c[k+1179664+(g<<2)>>2]|0)+-1|0;n=g*7|0;l=k+12+(m<<2)|0;c[l>>2]=(c[l>>2]|0)+(c[k+1310736+(n<<2)>>2]|0);l=m<<1;j=k+655376+(l<<3)|0;h[j>>3]=+h[j>>3]+ +(c[k+1310736+(n+1<<2)>>2]|0);l=k+655376+((l|1)<<3)|0;h[l>>3]=+h[l>>3]+ +(c[k+1310736+(n+2<<2)>>2]|0);m=m<<2;l=k+131084+(m<<2)|0;j=c[k+1310736+(n+3<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;l=k+131084+((m|1)<<2)|0;j=c[k+1310736+(n+4<<2)>>2]|0;if((c[l>>2]|0)<(j|0))c[l>>2]=j;l=k+131084+((m|2)<<2)|0;j=c[k+1310736+(n+5<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;j=k+131084+((m|3)<<2)|0;l=c[k+1310736+(n+6<<2)>>2]|0;if((c[j>>2]|0)<(l|0))c[j>>2]=l;g=g+1|0}while((g|0)<(f|0))}if((c[e>>2]|0)>0){l=0;do{D=k+12+(l<<2)|0;E=l<<1;C=k+655376+(E<<3)|0;h[C>>3]=+h[C>>3]/+(c[D>>2]|0);E=k+655376+((E|1)<<3)|0;h[E>>3]=+h[E>>3]/+(c[D>>2]|0);l=l+1|0}while((l|0)<(c[e>>2]|0));l=0}else l=0}else l=0}i=F;return l|0}function cd(e,f,g,j,k){e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;F=i;i=i+16|0;B=F;D=(f|0)/2|0;E=(g|0)/2|0;o=c[k>>2]|0;A=E+-1|0;if((f|0)>1){l=0;m=o;n=o+(($(A,D)|0)<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(D|0))break;else{m=m+2|0;n=n+2|0}}}y=j*3|0;z=D+-1|0;if((g|0)>1){l=0;j=o;m=o+(z<<1)|0;while(1){b[m>>1]=0;b[j>>1]=0;l=l+1|0;if((l|0)>=(E|0))break;else{j=j+(D<<1)|0;m=m+(D<<1)|0}}}m=k+1179664|0;j=D+1|0;v=0-D|0;t=1-D|0;u=~D;s=(f<<2)+16|0;a:do if((A|0)>1){w=(z|0)>1;l=(c[k+4>>2]|0)+j|0;x=1;n=e+((f<<3)+8)|0;g=o+(j<<1)|0;j=0;b:while(1){if(w){r=1;q=n;p=j;while(1){do if(((d[q+2>>0]|0)+(d[q+1>>0]|0)+(d[q+3>>0]|0)|0)>(y|0)){b[g>>1]=0;a[l>>0]=0;j=p}else{a[l>>0]=-1;j=b[g+(v<<1)>>1]|0;if(j<<16>>16>0){b[g>>1]=j;j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=k+1310736+(j+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+x;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}e=b[g+(t<<1)>>1]|0;f=e<<16>>16;j=b[g+(u<<1)>>1]|0;o=j<<16>>16;n=j<<16>>16>0;if(e<<16>>16<=0){if(n){b[g>>1]=j;j=o*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+r;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+x;n=k+1310736+(j+-3<<2)|0;if((c[n>>2]|0)<(r|0))c[n>>2]=r;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}j=b[g+-2>>1]|0;if(j<<16>>16>0){b[g>>1]=j;j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=k+1310736+(j+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+x;j=k+1310736+(j+-3<<2)|0;if((c[j>>2]|0)>=(r|0)){j=p;break}c[j>>2]=r;j=p;break}else{j=p+1|0;if((p|0)>32767)break b;b[g>>1]=j;c[k+1179664+(p<<2)>>2]=j<<16>>16;p=p*7|0;c[k+1310736+(p<<2)>>2]=1;c[k+1310736+(p+1<<2)>>2]=r;c[k+1310736+(p+2<<2)>>2]=x;c[k+1310736+(p+3<<2)>>2]=r;c[k+1310736+(p+4<<2)>>2]=r;c[k+1310736+(p+5<<2)>>2]=x;c[k+1310736+(p+6<<2)>>2]=x;break}}if(n){j=c[k+1179664+(f+-1<<2)>>2]|0;f=c[k+1179664+(o+-1<<2)>>2]|0;if((j|0)>(f|0)){b[g>>1]=f;if((p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(j|0))c[e>>2]=f;n=n+1|0;if((n|0)>=(p|0)){j=f;break}else e=e+4|0}}else j=f}else{b[g>>1]=j;if((j|0)<(f|0)&(p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(f|0))c[e>>2]=j;n=n+1|0;if((n|0)>=(p|0))break;else e=e+4|0}}}j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;o=k+1310736+(j+-5<<2)|0;c[o>>2]=(c[o>>2]|0)+x;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}n=b[g+-2>>1]|0;if(n<<16>>16<=0){b[g>>1]=e;j=f*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+r;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+x;n=k+1310736+(j+-4<<2)|0;if((c[n>>2]|0)>(r|0))c[n>>2]=r;c[k+1310736+(j+-1<<2)>>2]=x;j=p;break}j=c[k+1179664+(f+-1<<2)>>2]|0;f=c[k+1179664+((n<<16>>16)+-1<<2)>>2]|0;if((j|0)>(f|0)){b[g>>1]=f;if((p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(j|0))c[e>>2]=f;n=n+1|0;if((n|0)>=(p|0)){j=f;break}else e=e+4|0}}else j=f}else{b[g>>1]=j;if((j|0)<(f|0)&(p|0)>0){n=0;e=m;while(1){if((c[e>>2]|0)==(f|0))c[e>>2]=j;n=n+1|0;if((n|0)>=(p|0))break;else e=e+4|0}}}j=(j<<16>>16)*7|0;o=k+1310736+(j+-7<<2)|0;c[o>>2]=(c[o>>2]|0)+1;o=k+1310736+(j+-6<<2)|0;c[o>>2]=(c[o>>2]|0)+r;j=k+1310736+(j+-5<<2)|0;c[j>>2]=(c[j>>2]|0)+x;j=p}while(0);r=r+1|0;n=q+8|0;g=g+2|0;l=l+1|0;if((r|0)>=(z|0))break;else{q=n;p=j}}}x=x+1|0;if((x|0)>=(A|0)){f=j;C=52;break a}else{l=l+2|0;n=n+s|0;g=g+4|0}}Me(3,3904,B);l=-1}else{f=0;C=52}while(0);if((C|0)==52){g=k+12|0;if((f|0)<1)j=1;else{n=1;j=1;while(1){l=c[m>>2]|0;if((l|0)==(n|0)){l=j;j=j+1|0}else l=c[k+1179664+(l+-1<<2)>>2]|0;c[m>>2]=l;if((n|0)<(f|0)){n=n+1|0;m=m+4|0}else break}}e=k+8|0;l=j+-1|0;c[e>>2]=l;if(l){ek(g|0,0,l<<2|0)|0;ek(k+655376|0,0,l<<4|0)|0;if((j|0)>1){l=0;do{C=l<<2;c[k+131084+(C<<2)>>2]=D;c[k+131084+((C|1)<<2)>>2]=0;c[k+131084+((C|2)<<2)>>2]=E;c[k+131084+((C|3)<<2)>>2]=0;l=l+1|0}while((l|0)<(c[e>>2]|0))}if((f|0)>0){g=0;do{m=(c[k+1179664+(g<<2)>>2]|0)+-1|0;n=g*7|0;l=k+12+(m<<2)|0;c[l>>2]=(c[l>>2]|0)+(c[k+1310736+(n<<2)>>2]|0);l=m<<1;j=k+655376+(l<<3)|0;h[j>>3]=+h[j>>3]+ +(c[k+1310736+(n+1<<2)>>2]|0);l=k+655376+((l|1)<<3)|0;h[l>>3]=+h[l>>3]+ +(c[k+1310736+(n+2<<2)>>2]|0);m=m<<2;l=k+131084+(m<<2)|0;j=c[k+1310736+(n+3<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;l=k+131084+((m|1)<<2)|0;j=c[k+1310736+(n+4<<2)>>2]|0;if((c[l>>2]|0)<(j|0))c[l>>2]=j;l=k+131084+((m|2)<<2)|0;j=c[k+1310736+(n+5<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;j=k+131084+((m|3)<<2)|0;l=c[k+1310736+(n+6<<2)>>2]|0;if((c[j>>2]|0)<(l|0))c[j>>2]=l;g=g+1|0}while((g|0)<(f|0))}if((c[e>>2]|0)>0){l=0;do{D=k+12+(l<<2)|0;E=l<<1;C=k+655376+(E<<3)|0;h[C>>3]=+h[C>>3]/+(c[D>>2]|0);E=k+655376+((E|1)<<3)|0;h[E>>3]=+h[E>>3]/+(c[D>>2]|0);l=l+1|0}while((l|0)<(c[e>>2]|0));l=0}else l=0}else l=0}i=F;return l|0}
function sh(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;if((b|0)!=1){if(b+-1&b)b=_j(b)|0}else b=2;f=c[a+4>>2]|0;if(b>>>0<=f>>>0){if(b>>>0<f>>>0){if(f>>>0>2)e=(f+-1&f|0)==0;else e=0;d=~~+_(+(+((c[a+12>>2]|0)>>>0)/+g[a+16>>2]))>>>0;if(e)d=1<<32-(ba(d+-1|0)|0);else d=_j(d)|0;b=b>>>0<d>>>0?d:b;if(b>>>0<f>>>0)th(a,b)}}else th(a,b);return}function th(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;e=a+4|0;a:do if(b){m=Kh(b<<2)|0;d=c[a>>2]|0;c[a>>2]=m;if(d)Lh(d);c[e>>2]=b;if(b){d=0;do{c[(c[a>>2]|0)+(d<<2)>>2]=0;d=d+1|0}while((d|0)!=(b|0))}e=a+8|0;f=c[e>>2]|0;if(f){d=c[f+4>>2]|0;l=b+-1|0;m=(l&b|0)==0;if(m)h=d&l;else h=(d>>>0)%(b>>>0)|0;c[(c[a>>2]|0)+(h<<2)>>2]=e;d=c[f>>2]|0;if(d){g=f;e=f;while(1){k=e;b:while(1){while(1){e=c[d+4>>2]|0;if(m)j=e&l;else j=(e>>>0)%(b>>>0)|0;if((j|0)==(h|0)){e=d;break}e=(c[a>>2]|0)+(j<<2)|0;if(!(c[e>>2]|0)){h=j;f=d;break b}i=d+8|0;e=d;while(1){f=c[e>>2]|0;if(!f)break;if((c[i>>2]|0)==(c[f+8>>2]|0))e=f;else break}c[g>>2]=f;c[e>>2]=c[c[(c[a>>2]|0)+(j<<2)>>2]>>2];c[c[(c[a>>2]|0)+(j<<2)>>2]>>2]=d;d=c[k>>2]|0;if(!d)break a}d=c[e>>2]|0;if(!d)break a;else{g=e;k=e}}c[e>>2]=g;d=c[f>>2]|0;if(!d)break;else{g=f;e=f}}}}}else{d=c[a>>2]|0;c[a>>2]=0;if(d)Lh(d);c[e>>2]=0}while(0);return}function uh(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;g=i;i=i+32|0;h=g+16|0;f=g+4|0;j=g;d=c[d>>2]|0;e=c[d>>2]|0;c[j>>2]=d;c[h>>2]=c[j>>2];vh(f,b,h);d=c[f>>2]|0;c[f>>2]=0;if(d){if(a[f+8>>0]|0)Fg(d+264|0);Lh(d)}i=g;return e|0}function vh(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;o=c[e>>2]|0;l=c[d+4>>2]|0;e=c[o+4>>2]|0;m=l+-1|0;n=(m&l|0)==0;if(n)k=m&e;else k=(e>>>0)%(l>>>0)|0;g=(c[d>>2]|0)+(k<<2)|0;f=c[g>>2]|0;while(1){e=c[f>>2]|0;if((e|0)==(o|0)){j=f;break}else f=e}i=d+8|0;if((j|0)!=(i|0)){e=c[j+4>>2]|0;if(n)e=e&m;else e=(e>>>0)%(l>>>0)|0;if((e|0)==(k|0))g=o;else h=12}else h=12;do if((h|0)==12){e=c[o>>2]|0;if(e){e=c[e+4>>2]|0;if(n)e=e&m;else e=(e>>>0)%(l>>>0)|0;if((e|0)==(k|0)){g=o;break}}c[g>>2]=0;g=o}while(0);f=c[g>>2]|0;e=f;if(f){f=c[f+4>>2]|0;if(n)f=f&m;else f=(f>>>0)%(l>>>0)|0;if((f|0)!=(k|0)){c[(c[d>>2]|0)+(f<<2)>>2]=j;e=c[o>>2]|0}}c[j>>2]=e;c[g>>2]=0;d=d+12|0;c[d>>2]=(c[d>>2]|0)+-1;c[b>>2]=o;c[b+4>>2]=i;a[b+8>>0]=1;return}function wh(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=Kh(408)|0;c[e+8>>2]=c[d>>2];ek(e+16|0,0,392)|0;h[e+248>>3]=.0001;h[e+256>>3]=1.0e3;d=e+264|0;c[d>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[a>>2]=e;a=a+4|0;c[a>>2]=b+8;c[a+4>>2]=257;return}function xh(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,h=0,i=0,j=0.0,k=0.0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;m=c[e+8>>2]|0;s=e+4|0;c[s>>2]=m;r=d+4|0;l=c[r>>2]|0;q=(l|0)==0;a:do if(!q){n=l+-1|0;o=(n&l|0)==0;if(o)h=n&m;else h=(m>>>0)%(l>>>0)|0;f=c[(c[d>>2]|0)+(h<<2)>>2]|0;if(!f)p=12;else while(1){i=c[f>>2]|0;if(!i){p=12;break a}f=c[i+4>>2]|0;if(o)f=f&n;else f=(f>>>0)%(l>>>0)|0;if((f|0)!=(h|0)){p=12;break a}if((c[i+8>>2]|0)==(m|0)){f=0;e=i;break}else f=i}}else{h=0;p=12}while(0);if((p|0)==12){m=d+12|0;j=+(((c[m>>2]|0)+1|0)>>>0);k=+g[d+16>>2];do if(q|j>+(l>>>0)*k){if(l>>>0>2)f=(l+-1&l|0)==0;else f=0;i=(f&1|l<<1)^1;f=~~+_(+(j/k))>>>0;yh(d,i>>>0<f>>>0?f:i);i=c[r>>2]|0;f=c[s>>2]|0;h=i+-1|0;if(!(h&i)){l=i;h=h&f;break}else{l=i;h=(f>>>0)%(i>>>0)|0;break}}while(0);f=c[(c[d>>2]|0)+(h<<2)>>2]|0;if(!f){f=d+8|0;c[e>>2]=c[f>>2];c[f>>2]=e;c[(c[d>>2]|0)+(h<<2)>>2]=f;f=c[e>>2]|0;if(f){f=c[f+4>>2]|0;h=l+-1|0;if(!(h&l))f=f&h;else f=(f>>>0)%(l>>>0)|0;c[(c[d>>2]|0)+(f<<2)>>2]=e}}else{c[e>>2]=c[f>>2];c[f>>2]=e}c[m>>2]=(c[m>>2]|0)+1;f=1}c[b>>2]=e;a[b+4>>0]=f;return}function yh(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;if((b|0)!=1){if(b+-1&b)b=_j(b)|0}else b=2;f=c[a+4>>2]|0;if(b>>>0<=f>>>0){if(b>>>0<f>>>0){if(f>>>0>2)e=(f+-1&f|0)==0;else e=0;d=~~+_(+(+((c[a+12>>2]|0)>>>0)/+g[a+16>>2]))>>>0;if(e)d=1<<32-(ba(d+-1|0)|0);else d=_j(d)|0;b=b>>>0<d>>>0?d:b;if(b>>>0<f>>>0)zh(a,b)}}else zh(a,b);return}function zh(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;e=a+4|0;a:do if(b){m=Kh(b<<2)|0;d=c[a>>2]|0;c[a>>2]=m;if(d)Lh(d);c[e>>2]=b;if(b){d=0;do{c[(c[a>>2]|0)+(d<<2)>>2]=0;d=d+1|0}while((d|0)!=(b|0))}e=a+8|0;f=c[e>>2]|0;if(f){d=c[f+4>>2]|0;l=b+-1|0;m=(l&b|0)==0;if(m)h=d&l;else h=(d>>>0)%(b>>>0)|0;c[(c[a>>2]|0)+(h<<2)>>2]=e;d=c[f>>2]|0;if(d){g=f;e=f;while(1){k=e;b:while(1){while(1){e=c[d+4>>2]|0;if(m)j=e&l;else j=(e>>>0)%(b>>>0)|0;if((j|0)==(h|0)){e=d;break}e=(c[a>>2]|0)+(j<<2)|0;if(!(c[e>>2]|0)){h=j;f=d;break b}i=d+8|0;e=d;while(1){f=c[e>>2]|0;if(!f)break;if((c[i>>2]|0)==(c[f+8>>2]|0))e=f;else break}c[g>>2]=f;c[e>>2]=c[c[(c[a>>2]|0)+(j<<2)>>2]>>2];c[c[(c[a>>2]|0)+(j<<2)>>2]>>2]=d;d=c[k>>2]|0;if(!d)break a}d=c[e>>2]|0;if(!d)break a;else{g=e;k=e}}c[e>>2]=g;d=c[f>>2]|0;if(!d)break;else{g=f;e=f}}}}}else{d=c[a>>2]|0;c[a>>2]=0;if(d)Lh(d);c[e>>2]=0}while(0);return}function Ah(a){a=a|0;return Aj(c[a+4>>2]|0)|0}function Bh(a){a=a|0;Ka(624,10917);Ya(632,10922,1,1,0);Ga(640,10927,1,-128,127);Ga(656,10932,1,-128,127);Ga(648,10944,1,0,255);Ga(664,10958,2,-32768,32767);Ga(672,10964,2,0,65535);Ga(680,10979,4,-2147483648,2147483647);Ga(688,10983,4,0,-1);Ga(696,10996,4,-2147483648,2147483647);Ga(704,11001,4,0,-1);kb(712,11015,4);kb(720,11021,8);sb(360,11028);sb(392,11040);bb(416,4,11073);db(440,11086);Aa(448,0,11102);Dh(11132);Eh(11169);Fh(11208);Gh(11239);Hh(11279);Ih(11308);Aa(456,4,11346);Aa(464,5,11376);Dh(11415);Eh(11447);Fh(11480);Gh(11513);Hh(11547);Ih(11580);Aa(472,6,11614);Aa(480,7,11645);Aa(488,7,11677);return}function Ch(){Bh(0);return}function Dh(a){a=a|0;Aa(536,0,a|0);return}function Eh(a){a=a|0;Aa(528,1,a|0);return}function Fh(a){a=a|0;Aa(520,2,a|0);return}function Gh(a){a=a|0;Aa(512,3,a|0);return}function Hh(a){a=a|0;Aa(504,4,a|0);return}function Ih(a){a=a|0;Aa(496,5,a|0);return}function Jh(a){a=a|0;Ia(12478,12501,303,12589)}function Kh(a){a=a|0;var b=0;b=(a|0)==0?1:a;a=Uj(b)|0;a:do if(!a){while(1){a=Ph()|0;if(!a)break;_b[a&0]();a=Uj(b)|0;if(a)break a}b=Wa(4)|0;c[b>>2]=2224;wb(b|0,544,1)}while(0);return a|0}function Lh(a){a=a|0;Vj(a);return}function Mh(a){a=a|0;return}function Nh(a){a=a|0;Lh(a);return}function Oh(a){a=a|0;return 12610}function Ph(){var a=0;a=c[559]|0;c[559]=a+0;return a|0}function Qh(a){a=a|0;return}function Rh(a){a=a|0;return}function Sh(a){a=a|0;return}function Th(a){a=a|0;return}function Uh(a){a=a|0;return}function Vh(a){a=a|0;Lh(a);return}function Wh(a){a=a|0;Lh(a);return}function Xh(a){a=a|0;Lh(a);return}function Yh(a){a=a|0;Lh(a);return}function Zh(a,b,c){a=a|0;b=b|0;c=c|0;return (a|0)==(b|0)|0}function _h(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;h=i;i=i+64|0;g=h;if((a|0)!=(b|0))if((b|0)!=0?(f=ei(b,576,592,0)|0,(f|0)!=0):0){b=g;e=b+56|0;do{c[b>>2]=0;b=b+4|0}while((b|0)<(e|0));c[g>>2]=f;c[g+8>>2]=a;c[g+12>>2]=-1;c[g+48>>2]=1;dc[c[(c[f>>2]|0)+28>>2]&3](f,g,c[d>>2]|0,1);if((c[g+24>>2]|0)==1){c[d>>2]=c[g+16>>2];b=1}else b=0}else b=0;else b=1;i=h;return b|0}function $h(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0;b=d+16|0;g=c[b>>2]|0;do if(g){if((g|0)!=(e|0)){f=d+36|0;c[f>>2]=(c[f>>2]|0)+1;c[d+24>>2]=2;a[d+54>>0]=1;break}b=d+24|0;if((c[b>>2]|0)==2)c[b>>2]=f}else{c[b>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1}while(0);return}function ai(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;if((a|0)==(c[b+8>>2]|0))$h(0,b,d,e);return}function bi(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;if((a|0)==(c[b+8>>2]|0))$h(0,b,d,e);else{a=c[a+8>>2]|0;dc[c[(c[a>>2]|0)+28>>2]&3](a,b,d,e)}return}function ci(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;g=c[a+4>>2]|0;f=g>>8;if(g&1)f=c[(c[d>>2]|0)+f>>2]|0;a=c[a>>2]|0;dc[c[(c[a>>2]|0)+28>>2]&3](a,b,d+f|0,(g&2|0)!=0?e:2);return}function di(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;a:do if((b|0)!=(c[d+8>>2]|0)){h=c[b+12>>2]|0;g=b+16+(h<<3)|0;ci(b+16|0,d,e,f);if((h|0)>1){h=d+54|0;b=b+24|0;do{ci(b,d,e,f);if(a[h>>0]|0)break a;b=b+8|0}while(b>>>0<g>>>0)}}else $h(0,d,e,f);while(0);return}function ei(d,e,f,g){d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;r=i;i=i+64|0;q=r;p=c[d>>2]|0;o=d+(c[p+-8>>2]|0)|0;p=c[p+-4>>2]|0;c[q>>2]=f;c[q+4>>2]=d;c[q+8>>2]=e;c[q+12>>2]=g;g=q+16|0;d=q+20|0;e=q+24|0;h=q+28|0;j=q+32|0;k=q+40|0;l=(p|0)==(f|0);m=g;n=m+36|0;do{c[m>>2]=0;m=m+4|0}while((m|0)<(n|0));b[g+36>>1]=0;a[g+38>>0]=0;a:do if(l){c[q+48>>2]=1;bc[c[(c[f>>2]|0)+20>>2]&3](f,q,o,o,1,0);g=(c[e>>2]|0)==1?o:0}else{Rb[c[(c[p>>2]|0)+24>>2]&3](p,q,o,1,0);switch(c[q+36>>2]|0){case 0:{g=(c[k>>2]|0)==1&(c[h>>2]|0)==1&(c[j>>2]|0)==1?c[d>>2]|0:0;break a}case 1:break;default:{g=0;break a}}if((c[e>>2]|0)!=1?!((c[k>>2]|0)==0&(c[h>>2]|0)==1&(c[j>>2]|0)==1):0){g=0;break}g=c[g>>2]|0}while(0);i=r;return g|0}function fi(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;a[d+53>>0]=1;do if((c[d+4>>2]|0)==(f|0)){a[d+52>>0]=1;f=d+16|0;b=c[f>>2]|0;if(!b){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((g|0)==1?(c[d+48>>2]|0)==1:0))break;a[d+54>>0]=1;break}if((b|0)!=(e|0)){g=d+36|0;c[g>>2]=(c[g>>2]|0)+1;a[d+54>>0]=1;break}b=d+24|0;f=c[b>>2]|0;if((f|0)==2){c[b>>2]=g;f=g}if((f|0)==1?(c[d+48>>2]|0)==1:0)a[d+54>>0]=1}while(0);return}function gi(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;a:do if((b|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)==(e|0)?(h=d+28|0,(c[h>>2]|0)!=1):0)c[h>>2]=f}else{if((b|0)!=(c[d>>2]|0)){q=c[b+12>>2]|0;j=b+16+(q<<3)|0;ii(b+16|0,d,e,f,g);h=b+24|0;if((q|0)<=1)break;i=c[b+8>>2]|0;if((i&2|0)==0?(k=d+36|0,(c[k>>2]|0)!=1):0){if(!(i&1)){i=d+54|0;while(1){if(a[i>>0]|0)break a;if((c[k>>2]|0)==1)break a;ii(h,d,e,f,g);h=h+8|0;if(h>>>0>=j>>>0)break a}}i=d+24|0;b=d+54|0;while(1){if(a[b>>0]|0)break a;if((c[k>>2]|0)==1?(c[i>>2]|0)==1:0)break a;ii(h,d,e,f,g);h=h+8|0;if(h>>>0>=j>>>0)break a}}i=d+54|0;while(1){if(a[i>>0]|0)break a;ii(h,d,e,f,g);h=h+8|0;if(h>>>0>=j>>>0)break a}}if((c[d+16>>2]|0)!=(e|0)?(p=d+20|0,(c[p>>2]|0)!=(e|0)):0){c[d+32>>2]=f;m=d+44|0;if((c[m>>2]|0)==4)break;i=c[b+12>>2]|0;j=b+16+(i<<3)|0;k=d+52|0;f=d+53|0;n=d+54|0;l=b+8|0;o=d+24|0;b:do if((i|0)>0){i=0;h=0;b=b+16|0;while(1){a[k>>0]=0;a[f>>0]=0;hi(b,d,e,e,1,g);if(a[n>>0]|0){q=20;break b}do if(a[f>>0]|0){if(!(a[k>>0]|0))if(!(c[l>>2]&1)){h=1;q=20;break b}else{h=1;break}if((c[o>>2]|0)==1)break b;if(!(c[l>>2]&2))break b;else{i=1;h=1}}while(0);b=b+8|0;if(b>>>0>=j>>>0){q=20;break}}}else{i=0;h=0;q=20}while(0);do if((q|0)==20){if((!i?(c[p>>2]=e,e=d+40|0,c[e>>2]=(c[e>>2]|0)+1,(c[d+36>>2]|0)==1):0)?(c[o>>2]|0)==2:0){a[n>>0]=1;if(h)break}else q=24;if((q|0)==24?h:0)break;c[m>>2]=4;break a}while(0);c[m>>2]=3;break}if((f|0)==1)c[d+32>>2]=1}while(0);return}function hi(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0;i=c[a+4>>2]|0;h=i>>8;if(i&1)h=c[(c[e>>2]|0)+h>>2]|0;a=c[a>>2]|0;bc[c[(c[a>>2]|0)+20>>2]&3](a,b,d,e+h|0,(i&2|0)!=0?f:2,g);return}function ii(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0;h=c[a+4>>2]|0;g=h>>8;if(h&1)g=c[(c[d>>2]|0)+g>>2]|0;a=c[a>>2]|0;Rb[c[(c[a>>2]|0)+24>>2]&3](a,b,d+g|0,(h&2|0)!=0?e:2,f);return}function ji(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0;a:do if((b|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)==(e|0)?(h=d+28|0,(c[h>>2]|0)!=1):0)c[h>>2]=f}else{if((b|0)!=(c[d>>2]|0)){j=c[b+8>>2]|0;Rb[c[(c[j>>2]|0)+24>>2]&3](j,d,e,f,g);break}if((c[d+16>>2]|0)!=(e|0)?(i=d+20|0,(c[i>>2]|0)!=(e|0)):0){c[d+32>>2]=f;f=d+44|0;if((c[f>>2]|0)==4)break;h=d+52|0;a[h>>0]=0;k=d+53|0;a[k>>0]=0;b=c[b+8>>2]|0;bc[c[(c[b>>2]|0)+20>>2]&3](b,d,e,e,1,g);if(a[k>>0]|0){if(!(a[h>>0]|0)){h=1;j=13}}else{h=0;j=13}do if((j|0)==13){c[i>>2]=e;k=d+40|0;c[k>>2]=(c[k>>2]|0)+1;if((c[d+36>>2]|0)==1?(c[d+24>>2]|0)==2:0){a[d+54>>0]=1;if(h)break}else j=16;if((j|0)==16?h:0)break;c[f>>2]=4;break a}while(0);c[f>>2]=3;break}if((f|0)==1)c[d+32>>2]=1}while(0);return}function ki(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0;do if((b|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)==(e|0)?(i=d+28|0,(c[i>>2]|0)!=1):0)c[i>>2]=f}else if((b|0)==(c[d>>2]|0)){if((c[d+16>>2]|0)!=(e|0)?(h=d+20|0,(c[h>>2]|0)!=(e|0)):0){c[d+32>>2]=f;c[h>>2]=e;g=d+40|0;c[g>>2]=(c[g>>2]|0)+1;if((c[d+36>>2]|0)==1?(c[d+24>>2]|0)==2:0)a[d+54>>0]=1;c[d+44>>2]=4;break}if((f|0)==1)c[d+32>>2]=1}while(0);return}function li(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;if((b|0)==(c[d+8>>2]|0))fi(0,d,e,f,g);else{m=d+52|0;n=a[m>>0]|0;o=d+53|0;p=a[o>>0]|0;l=c[b+12>>2]|0;i=b+16+(l<<3)|0;a[m>>0]=0;a[o>>0]=0;hi(b+16|0,d,e,f,g,h);a:do if((l|0)>1){j=d+24|0;k=b+8|0;l=d+54|0;b=b+24|0;do{if(a[l>>0]|0)break a;if(!(a[m>>0]|0)){if((a[o>>0]|0)!=0?(c[k>>2]&1|0)==0:0)break a}else{if((c[j>>2]|0)==1)break a;if(!(c[k>>2]&2))break a}a[m>>0]=0;a[o>>0]=0;hi(b,d,e,f,g,h);b=b+8|0}while(b>>>0<i>>>0)}while(0);a[m>>0]=n;a[o>>0]=p}return}function mi(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;if((a|0)==(c[b+8>>2]|0))fi(0,b,d,e,f);else{a=c[a+8>>2]|0;bc[c[(c[a>>2]|0)+20>>2]&3](a,b,d,e,f,g)}return}function ni(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;if((a|0)==(c[b+8>>2]|0))fi(0,b,d,e,f);return}function oi(a){a=a|0;Ia(12625,12654,1164,12589)}function pi(a){a=a|0;return ((a|0)==32|(a+-9|0)>>>0<5)&1|0}function qi(){var a=0;if(!(c[597]|0))a=2644;else a=c[(gb()|0)+60>>2]|0;return a|0}function ri(b){b=b|0;var c=0,e=0;c=0;while(1){if((d[12742+c>>0]|0)==(b|0)){e=2;break}c=c+1|0;if((c|0)==87){c=87;b=12830;e=5;break}}if((e|0)==2)if(!c)b=12830;else{b=12830;e=5}if((e|0)==5)while(1){e=b;while(1){b=e+1|0;if(!(a[e>>0]|0))break;else e=b}c=c+-1|0;if(!c)break;else e=5}return b|0}function si(b,e,f){b=b|0;e=e|0;f=f|0;var g=0.0,h=0,j=0.0,k=0,l=0,m=0.0,n=0,o=0,p=0,q=0.0,r=0.0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0.0;L=i;i=i+512|0;H=L;switch(e|0){case 0:{K=24;J=-149;A=4;break}case 1:{K=53;J=-1074;A=4;break}case 2:{K=53;J=-1074;A=4;break}default:g=0.0}a:do if((A|0)==4){E=b+4|0;C=b+100|0;do{e=c[E>>2]|0;if(e>>>0<(c[C>>2]|0)>>>0){c[E>>2]=e+1;e=d[e>>0]|0}else e=vi(b)|0}while((pi(e)|0)!=0);b:do switch(e|0){case 43:case 45:{h=1-(((e|0)==45&1)<<1)|0;e=c[E>>2]|0;if(e>>>0<(c[C>>2]|0)>>>0){c[E>>2]=e+1;e=d[e>>0]|0;I=h;break b}else{e=vi(b)|0;I=h;break b}}default:I=1}while(0);h=e;e=0;do{if((h|32|0)!=(a[14634+e>>0]|0))break;do if(e>>>0<7){h=c[E>>2]|0;if(h>>>0<(c[C>>2]|0)>>>0){c[E>>2]=h+1;h=d[h>>0]|0;break}else{h=vi(b)|0;break}}while(0);e=e+1|0}while(e>>>0<8);c:do switch(e|0){case 8:break;case 3:{A=23;break}default:{k=(f|0)!=0;if(k&e>>>0>3)if((e|0)==8)break c;else{A=23;break c}d:do if(!e){e=0;do{if((h|32|0)!=(a[16477+e>>0]|0))break d;do if(e>>>0<2){h=c[E>>2]|0;if(h>>>0<(c[C>>2]|0)>>>0){c[E>>2]=h+1;h=d[h>>0]|0;break}else{h=vi(b)|0;break}}while(0);e=e+1|0}while(e>>>0<3)}while(0);switch(e|0){case 3:{e=c[E>>2]|0;if(e>>>0<(c[C>>2]|0)>>>0){c[E>>2]=e+1;e=d[e>>0]|0}else e=vi(b)|0;if((e|0)==40)e=1;else{if(!(c[C>>2]|0)){g=s;break a}c[E>>2]=(c[E>>2]|0)+-1;g=s;break a}while(1){h=c[E>>2]|0;if(h>>>0<(c[C>>2]|0)>>>0){c[E>>2]=h+1;h=d[h>>0]|0}else h=vi(b)|0;if(!((h+-48|0)>>>0<10|(h+-65|0)>>>0<26)?!((h|0)==95|(h+-97|0)>>>0<26):0)break;e=e+1|0}if((h|0)==41){g=s;break a}h=(c[C>>2]|0)==0;if(!h)c[E>>2]=(c[E>>2]|0)+-1;if(!k){c[(qi()|0)>>2]=22;ui(b,0);g=0.0;break a}if(!e){g=s;break a}while(1){e=e+-1|0;if(!h)c[E>>2]=(c[E>>2]|0)+-1;if(!e){g=s;break a}}}case 0:{do if((h|0)==48){e=c[E>>2]|0;if(e>>>0<(c[C>>2]|0)>>>0){c[E>>2]=e+1;e=d[e>>0]|0}else e=vi(b)|0;if((e|32|0)!=120){if(!(c[C>>2]|0)){e=48;break}c[E>>2]=(c[E>>2]|0)+-1;e=48;break}e=c[E>>2]|0;if(e>>>0<(c[C>>2]|0)>>>0){c[E>>2]=e+1;e=d[e>>0]|0;k=0}else{e=vi(b)|0;k=0}e:while(1){switch(e|0){case 46:{A=74;break e}case 48:break;default:{y=0;l=0;x=0;h=0;n=k;o=0;w=0;m=1.0;k=0;g=0.0;break e}}e=c[E>>2]|0;if(e>>>0<(c[C>>2]|0)>>>0){c[E>>2]=e+1;e=d[e>>0]|0;k=1;continue}else{e=vi(b)|0;k=1;continue}}if((A|0)==74){e=c[E>>2]|0;if(e>>>0<(c[C>>2]|0)>>>0){c[E>>2]=e+1;e=d[e>>0]|0}else e=vi(b)|0;if((e|0)==48){k=0;h=0;do{e=c[E>>2]|0;if(e>>>0<(c[C>>2]|0)>>>0){c[E>>2]=e+1;e=d[e>>0]|0}else e=vi(b)|0;k=gk(k|0,h|0,-1,-1)|0;h=D}while((e|0)==48);y=0;l=0;x=k;n=1;o=1;w=0;m=1.0;k=0;g=0.0}else{y=0;l=0;x=0;h=0;n=k;o=1;w=0;m=1.0;k=0;g=0.0}}while(1){u=e+-48|0;p=e|32;if(u>>>0>=10){v=(e|0)==46;if(!(v|(p+-97|0)>>>0<6)){p=x;u=y;break}if(v)if(!o){v=l;h=y;u=y;o=1;p=w;j=m}else{p=x;u=y;e=46;break}else A=86}else A=86;if((A|0)==86){A=0;e=(e|0)>57?p+-87|0:u;do if(!((y|0)<0|(y|0)==0&l>>>0<8)){if((y|0)<0|(y|0)==0&l>>>0<14){r=m*.0625;p=w;j=r;g=g+r*+(e|0);break}if((w|0)!=0|(e|0)==0){p=w;j=m}else{p=1;j=m;g=g+m*.5}}else{p=w;j=m;k=e+(k<<4)|0}while(0);l=gk(l|0,y|0,1,0)|0;v=x;u=D;n=1}e=c[E>>2]|0;if(e>>>0<(c[C>>2]|0)>>>0){c[E>>2]=e+1;y=u;x=v;e=d[e>>0]|0;w=p;m=j;continue}else{y=u;x=v;e=vi(b)|0;w=p;m=j;continue}}if(!n){e=(c[C>>2]|0)==0;if(!e)c[E>>2]=(c[E>>2]|0)+-1;if(f){if(!e?(z=c[E>>2]|0,c[E>>2]=z+-1,(o|0)!=0):0)c[E>>2]=z+-2}else ui(b,0);g=+(I|0)*0.0;break a}n=(o|0)==0;o=n?l:p;n=n?u:h;if((u|0)<0|(u|0)==0&l>>>0<8){h=u;do{k=k<<4;l=gk(l|0,h|0,1,0)|0;h=D}while((h|0)<0|(h|0)==0&l>>>0<8)}if((e|32|0)==112){h=Hj(b,f)|0;e=D;if((h|0)==0&(e|0)==-2147483648){if(!f){ui(b,0);g=0.0;break a}if(!(c[C>>2]|0)){h=0;e=0}else{c[E>>2]=(c[E>>2]|0)+-1;h=0;e=0}}}else if(!(c[C>>2]|0)){h=0;e=0}else{c[E>>2]=(c[E>>2]|0)+-1;h=0;e=0}H=fk(o|0,n|0,2)|0;H=gk(H|0,D|0,-32,-1)|0;e=gk(H|0,D|0,h|0,e|0)|0;h=D;if(!k){g=+(I|0)*0.0;break a}if((h|0)>0|(h|0)==0&e>>>0>(0-J|0)>>>0){c[(qi()|0)>>2]=34;g=+(I|0)*1797693134862315708145274.0e284*1797693134862315708145274.0e284;break a}H=J+-106|0;G=((H|0)<0)<<31>>31;if((h|0)<(G|0)|(h|0)==(G|0)&e>>>0<H>>>0){c[(qi()|0)>>2]=34;g=+(I|0)*2.2250738585072014e-308*2.2250738585072014e-308;break a}if((k|0)>-1){do{G=!(g>=.5);H=G&1|k<<1;k=H^1;g=g+(G?g:g+-1.0);e=gk(e|0,h|0,-1,-1)|0;h=D}while((H|0)>-1);l=e;m=g}else{l=e;m=g}e=dk(32,0,J|0,((J|0)<0)<<31>>31|0)|0;e=gk(l|0,h|0,e|0,D|0)|0;J=D;if(0>(J|0)|0==(J|0)&K>>>0>e>>>0)if((e|0)<0){e=0;A=127}else A=125;else{e=K;A=125}if((A|0)==125)if((e|0)<53)A=127;else{h=e;j=+(I|0);g=0.0}if((A|0)==127){g=+(I|0);h=e;j=g;g=+yi(+Di(1.0,84-e|0),g)}K=(k&1|0)==0&(m!=0.0&(h|0)<32);g=j*(K?0.0:m)+(g+j*+(((K&1)+k|0)>>>0))-g;if(!(g!=0.0))c[(qi()|0)>>2]=34;g=+Ei(g,l);break a}else e=h;while(0);F=J+K|0;G=0-F|0;k=0;f:while(1){switch(e|0){case 46:{A=138;break f}case 48:break;default:{h=0;p=0;o=0;break f}}e=c[E>>2]|0;if(e>>>0<(c[C>>2]|0)>>>0){c[E>>2]=e+1;e=d[e>>0]|0;k=1;continue}else{e=vi(b)|0;k=1;continue}}if((A|0)==138){e=c[E>>2]|0;if(e>>>0<(c[C>>2]|0)>>>0){c[E>>2]=e+1;e=d[e>>0]|0}else e=vi(b)|0;if((e|0)==48){h=0;e=0;while(1){h=gk(h|0,e|0,-1,-1)|0;k=D;e=c[E>>2]|0;if(e>>>0<(c[C>>2]|0)>>>0){c[E>>2]=e+1;e=d[e>>0]|0}else e=vi(b)|0;if((e|0)==48)e=k;else{p=k;k=1;o=1;break}}}else{h=0;p=0;o=1}}c[H>>2]=0;n=e+-48|0;l=(e|0)==46;g:do if(l|n>>>0<10){B=H+496|0;y=0;v=0;w=l;A=p;u=k;z=o;k=0;l=0;o=0;h:while(1){do if(w)if(!z){h=y;p=v;z=1}else{p=A;e=y;n=v;break h}else{w=gk(y|0,v|0,1,0)|0;v=D;x=(e|0)!=48;if((l|0)>=125){if(!x){p=A;y=w;break}c[B>>2]=c[B>>2]|1;p=A;y=w;break}p=H+(l<<2)|0;if(k)n=e+-48+((c[p>>2]|0)*10|0)|0;c[p>>2]=n;k=k+1|0;n=(k|0)==9;p=A;y=w;u=1;k=n?0:k;l=(n&1)+l|0;o=x?w:o}while(0);e=c[E>>2]|0;if(e>>>0<(c[C>>2]|0)>>>0){c[E>>2]=e+1;e=d[e>>0]|0}else e=vi(b)|0;n=e+-48|0;w=(e|0)==46;if(!(w|n>>>0<10)){n=z;A=161;break g}else A=p}u=(u|0)!=0;A=169}else{y=0;v=0;u=k;n=o;k=0;l=0;o=0;A=161}while(0);do if((A|0)==161){B=(n|0)==0;h=B?y:h;p=B?v:p;u=(u|0)!=0;if(!((e|32|0)==101&u))if((e|0)>-1){e=y;n=v;A=169;break}else{e=y;n=v;A=171;break}n=Hj(b,f)|0;e=D;if((n|0)==0&(e|0)==-2147483648){if(!f){ui(b,0);g=0.0;break}if(!(c[C>>2]|0)){n=0;e=0}else{c[E>>2]=(c[E>>2]|0)+-1;n=0;e=0}}h=gk(n|0,e|0,h|0,p|0)|0;u=y;p=D;n=v;A=173}while(0);if((A|0)==169)if(c[C>>2]|0){c[E>>2]=(c[E>>2]|0)+-1;if(u){u=e;A=173}else A=172}else A=171;if((A|0)==171)if(u){u=e;A=173}else A=172;do if((A|0)==172){c[(qi()|0)>>2]=22;ui(b,0);g=0.0}else if((A|0)==173){e=c[H>>2]|0;if(!e){g=+(I|0)*0.0;break}if(((n|0)<0|(n|0)==0&u>>>0<10)&((h|0)==(u|0)&(p|0)==(n|0))?K>>>0>30|(e>>>K|0)==0:0){g=+(I|0)*+(e>>>0);break}b=(J|0)/-2|0;E=((b|0)<0)<<31>>31;if((p|0)>(E|0)|(p|0)==(E|0)&h>>>0>b>>>0){c[(qi()|0)>>2]=34;g=+(I|0)*1797693134862315708145274.0e284*1797693134862315708145274.0e284;break}b=J+-106|0;E=((b|0)<0)<<31>>31;if((p|0)<(E|0)|(p|0)==(E|0)&h>>>0<b>>>0){c[(qi()|0)>>2]=34;g=+(I|0)*2.2250738585072014e-308*2.2250738585072014e-308;break}if(k){if((k|0)<9){n=H+(l<<2)|0;e=c[n>>2]|0;do{e=e*10|0;k=k+1|0}while((k|0)!=9);c[n>>2]=e}l=l+1|0}if((o|0)<9?(o|0)<=(h|0)&(h|0)<18:0){if((h|0)==9){g=+(I|0)*+((c[H>>2]|0)>>>0);break}if((h|0)<9){g=+(I|0)*+((c[H>>2]|0)>>>0)/+(c[2648+(8-h<<2)>>2]|0);break}b=K+27+($(h,-3)|0)|0;e=c[H>>2]|0;if((b|0)>30|(e>>>b|0)==0){g=+(I|0)*+(e>>>0)*+(c[2648+(h+-10<<2)>>2]|0);break}}e=(h|0)%9|0;if(!e){k=0;e=0}else{u=(h|0)>-1?e:e+9|0;n=c[2648+(8-u<<2)>>2]|0;if(l){o=1e9/(n|0)|0;k=0;e=0;p=0;do{C=H+(p<<2)|0;E=c[C>>2]|0;b=((E>>>0)/(n>>>0)|0)+e|0;c[C>>2]=b;e=$((E>>>0)%(n>>>0)|0,o)|0;b=(p|0)==(k|0)&(b|0)==0;p=p+1|0;h=b?h+-9|0:h;k=b?p&127:k}while((p|0)!=(l|0));if(e){c[H+(l<<2)>>2]=e;l=l+1|0}}else{k=0;l=0}e=0;h=9-u+h|0}i:while(1){v=(h|0)<18;w=(h|0)==18;x=H+(k<<2)|0;do{if(!v){if(!w)break i;if((c[x>>2]|0)>>>0>=9007199){h=18;break i}}n=0;o=l+127|0;while(1){u=o&127;p=H+(u<<2)|0;o=fk(c[p>>2]|0,0,29)|0;o=gk(o|0,D|0,n|0,0)|0;n=D;if(n>>>0>0|(n|0)==0&o>>>0>1e9){b=pk(o|0,n|0,1e9,0)|0;o=qk(o|0,n|0,1e9,0)|0;n=b}else n=0;c[p>>2]=o;b=(u|0)==(k|0);l=(u|0)!=(l+127&127|0)|b?l:(o|0)==0?u:l;if(b)break;else o=u+-1|0}e=e+-29|0}while((n|0)==0);k=k+127&127;if((k|0)==(l|0)){b=l+127&127;l=H+((l+126&127)<<2)|0;c[l>>2]=c[l>>2]|c[H+(b<<2)>>2];l=b}c[H+(k<<2)>>2]=n;h=h+9|0}j:while(1){y=l+1&127;x=H+((l+127&127)<<2)|0;while(1){v=(h|0)==18;w=(h|0)>27?9:1;u=v^1;while(1){o=k&127;p=(o|0)==(l|0);do if(!p){n=c[H+(o<<2)>>2]|0;if(n>>>0<9007199){A=219;break}if(n>>>0>9007199)break;n=k+1&127;if((n|0)==(l|0)){A=219;break}n=c[H+(n<<2)>>2]|0;if(n>>>0<254740991){A=219;break}if(!(n>>>0>254740991|u)){h=o;break j}}else A=219;while(0);if((A|0)==219?(A=0,v):0){A=220;break j}e=e+w|0;if((k|0)==(l|0))k=l;else break}u=(1<<w)+-1|0;v=1e9>>>w;o=k;n=0;p=k;while(1){E=H+(p<<2)|0;b=c[E>>2]|0;k=(b>>>w)+n|0;c[E>>2]=k;n=$(b&u,v)|0;k=(p|0)==(o|0)&(k|0)==0;p=p+1&127;h=k?h+-9|0:h;k=k?p:o;if((p|0)==(l|0))break;else o=k}if(!n)continue;if((y|0)!=(k|0))break;c[x>>2]=c[x>>2]|1}c[H+(l<<2)>>2]=n;l=y}if((A|0)==220)if(p){c[H+(y+-1<<2)>>2]=0;h=l;l=y}else h=o;g=+((c[H+(h<<2)>>2]|0)>>>0);h=k+1&127;if((h|0)==(l|0)){l=k+2&127;c[H+(l+-1<<2)>>2]=0}r=+(I|0);j=r*(g*1.0e9+ +((c[H+(h<<2)>>2]|0)>>>0));v=e+53|0;p=v-J|0;u=(p|0)<(K|0);h=u&1;o=u?((p|0)<0?0:p):K;if((o|0)<53){M=+yi(+Di(1.0,105-o|0),j);m=+Ai(j,+Di(1.0,53-o|0));q=M;g=m;m=M+(j-m)}else{q=0.0;g=0.0;m=j}n=k+2&127;do if((n|0)==(l|0))j=g;else{n=c[H+(n<<2)>>2]|0;do if(n>>>0>=5e8){if(n>>>0>5e8){g=r*.75+g;break}if((k+3&127|0)==(l|0)){g=r*.5+g;break}else{g=r*.75+g;break}}else{if((n|0)==0?(k+3&127|0)==(l|0):0)break;g=r*.25+g}while(0);if((53-o|0)<=1){j=g;break}if(+Ai(g,1.0)!=0.0){j=g;break}j=g+1.0}while(0);g=m+j-q;do if((v&2147483647|0)>(-2-F|0)){if(+O(+g)>=9007199254740992.0){h=u&(o|0)==(p|0)?0:h;e=e+1|0;g=g*.5}if((e+50|0)<=(G|0)?!(j!=0.0&(h|0)!=0):0)break;c[(qi()|0)>>2]=34}while(0);g=+Ei(g,e)}while(0);break a}default:{if(c[C>>2]|0)c[E>>2]=(c[E>>2]|0)+-1;c[(qi()|0)>>2]=22;ui(b,0);g=0.0;break a}}}}while(0);if((A|0)==23){h=(c[C>>2]|0)==0;if(!h)c[E>>2]=(c[E>>2]|0)+-1;if((f|0)!=0&e>>>0>3)do{if(!h)c[E>>2]=(c[E>>2]|0)+-1;e=e+-1|0}while(e>>>0>3)}g=+(I|0)*t}while(0);i=L;return +g}function ti(b,e,f,g,h){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;a:do if(e>>>0>36){c[(qi()|0)>>2]=22;h=0;g=0}else{r=b+4|0;q=b+100|0;do{i=c[r>>2]|0;if(i>>>0<(c[q>>2]|0)>>>0){c[r>>2]=i+1;i=d[i>>0]|0}else i=vi(b)|0}while((pi(i)|0)!=0);b:do switch(i|0){case 43:case 45:{j=((i|0)==45)<<31>>31;i=c[r>>2]|0;if(i>>>0<(c[q>>2]|0)>>>0){c[r>>2]=i+1;i=d[i>>0]|0;p=j;break b}else{i=vi(b)|0;p=j;break b}}default:p=0}while(0);j=(e|0)==0;do if((e&-17|0)==0&(i|0)==48){i=c[r>>2]|0;if(i>>>0<(c[q>>2]|0)>>>0){c[r>>2]=i+1;i=d[i>>0]|0}else i=vi(b)|0;if((i|32|0)!=120)if(j){e=8;n=46;break}else{n=32;break}e=c[r>>2]|0;if(e>>>0<(c[q>>2]|0)>>>0){c[r>>2]=e+1;i=d[e>>0]|0}else i=vi(b)|0;if((d[14643+(i+1)>>0]|0)>15){g=(c[q>>2]|0)==0;if(!g)c[r>>2]=(c[r>>2]|0)+-1;if(!f){ui(b,0);h=0;g=0;break a}if(g){h=0;g=0;break a}c[r>>2]=(c[r>>2]|0)+-1;h=0;g=0;break a}else{e=16;n=46}}else{e=j?10:e;if((d[14643+(i+1)>>0]|0)>>>0<e>>>0)n=32;else{if(c[q>>2]|0)c[r>>2]=(c[r>>2]|0)+-1;ui(b,0);c[(qi()|0)>>2]=22;h=0;g=0;break a}}while(0);if((n|0)==32)if((e|0)==10){e=i+-48|0;if(e>>>0<10){i=0;while(1){j=(i*10|0)+e|0;e=c[r>>2]|0;if(e>>>0<(c[q>>2]|0)>>>0){c[r>>2]=e+1;i=d[e>>0]|0}else i=vi(b)|0;e=i+-48|0;if(!(e>>>0<10&j>>>0<429496729)){e=j;break}else i=j}j=0}else{e=0;j=0}f=i+-48|0;if(f>>>0<10){while(1){k=ok(e|0,j|0,10,0)|0;l=D;m=((f|0)<0)<<31>>31;o=~m;if(l>>>0>o>>>0|(l|0)==(o|0)&k>>>0>~f>>>0){k=e;break}e=gk(k|0,l|0,f|0,m|0)|0;j=D;i=c[r>>2]|0;if(i>>>0<(c[q>>2]|0)>>>0){c[r>>2]=i+1;i=d[i>>0]|0}else i=vi(b)|0;f=i+-48|0;if(!(f>>>0<10&(j>>>0<429496729|(j|0)==429496729&e>>>0<2576980378))){k=e;break}}if(f>>>0>9){i=k;e=p}else{e=10;n=72}}else{i=e;e=p}}else n=46;c:do if((n|0)==46){if(!(e+-1&e)){n=a[14900+((e*23|0)>>>5&7)>>0]|0;j=a[14643+(i+1)>>0]|0;f=j&255;if(f>>>0<e>>>0){i=0;while(1){k=f|i<<n;i=c[r>>2]|0;if(i>>>0<(c[q>>2]|0)>>>0){c[r>>2]=i+1;i=d[i>>0]|0}else i=vi(b)|0;j=a[14643+(i+1)>>0]|0;f=j&255;if(!(k>>>0<134217728&f>>>0<e>>>0))break;else i=k}f=0}else{f=0;k=0}l=hk(-1,-1,n|0)|0;m=D;if((j&255)>>>0>=e>>>0|(f>>>0>m>>>0|(f|0)==(m|0)&k>>>0>l>>>0)){j=f;n=72;break}else i=f;while(1){k=fk(k|0,i|0,n|0)|0;f=D;k=j&255|k;i=c[r>>2]|0;if(i>>>0<(c[q>>2]|0)>>>0){c[r>>2]=i+1;i=d[i>>0]|0}else i=vi(b)|0;j=a[14643+(i+1)>>0]|0;if((j&255)>>>0>=e>>>0|(f>>>0>m>>>0|(f|0)==(m|0)&k>>>0>l>>>0)){j=f;n=72;break c}else i=f}}j=a[14643+(i+1)>>0]|0;f=j&255;if(f>>>0<e>>>0){i=0;while(1){k=f+($(i,e)|0)|0;i=c[r>>2]|0;if(i>>>0<(c[q>>2]|0)>>>0){c[r>>2]=i+1;i=d[i>>0]|0}else i=vi(b)|0;j=a[14643+(i+1)>>0]|0;f=j&255;if(!(k>>>0<119304647&f>>>0<e>>>0))break;else i=k}f=0}else{k=0;f=0}if((j&255)>>>0<e>>>0){n=pk(-1,-1,e|0,0)|0;o=D;m=f;while(1){if(m>>>0>o>>>0|(m|0)==(o|0)&k>>>0>n>>>0){j=m;n=72;break c}f=ok(k|0,m|0,e|0,0)|0;l=D;j=j&255;if(l>>>0>4294967295|(l|0)==-1&f>>>0>~j>>>0){j=m;n=72;break c}k=gk(j|0,0,f|0,l|0)|0;f=D;i=c[r>>2]|0;if(i>>>0<(c[q>>2]|0)>>>0){c[r>>2]=i+1;i=d[i>>0]|0}else i=vi(b)|0;j=a[14643+(i+1)>>0]|0;if((j&255)>>>0>=e>>>0){j=f;n=72;break}else m=f}}else{j=f;n=72}}while(0);if((n|0)==72)if((d[14643+(i+1)>>0]|0)>>>0<e>>>0){do{i=c[r>>2]|0;if(i>>>0<(c[q>>2]|0)>>>0){c[r>>2]=i+1;i=d[i>>0]|0}else i=vi(b)|0}while((d[14643+(i+1)>>0]|0)>>>0<e>>>0);c[(qi()|0)>>2]=34;j=h;i=g;e=(g&1|0)==0&0==0?p:0}else{i=k;e=p}if(c[q>>2]|0)c[r>>2]=(c[r>>2]|0)+-1;if(!(j>>>0<h>>>0|(j|0)==(h|0)&i>>>0<g>>>0)){if(!((g&1|0)!=0|0!=0|(e|0)!=0)){c[(qi()|0)>>2]=34;g=gk(g|0,h|0,-1,-1)|0;h=D;break}if(j>>>0>h>>>0|(j|0)==(h|0)&i>>>0>g>>>0){c[(qi()|0)>>2]=34;break}}g=((e|0)<0)<<31>>31;g=dk(i^e|0,j^g|0,e|0,g|0)|0;h=D}while(0);D=h;return g|0}function ui(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;c[a+104>>2]=b;d=c[a+4>>2]|0;e=c[a+8>>2]|0;f=e-d|0;c[a+108>>2]=f;if((b|0)!=0&(f|0)>(b|0))c[a+100>>2]=d+b;else c[a+100>>2]=e;return}function vi(b){b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0;f=b+104|0;i=c[f>>2]|0;if((i|0)!=0?(c[b+108>>2]|0)>=(i|0):0)j=4;else{e=Vi(b)|0;if((e|0)>=0){h=c[f>>2]|0;f=b+8|0;if(h){g=c[f>>2]|0;i=c[b+4>>2]|0;f=g;h=h-(c[b+108>>2]|0)+-1|0;if((f-i|0)>(h|0))c[b+100>>2]=i+h;else j=9}else{g=c[f>>2]|0;f=g;j=9}if((j|0)==9)c[b+100>>2]=f;f=c[b+4>>2]|0;if(g){b=b+108|0;c[b>>2]=g+1-f+(c[b>>2]|0)}f=f+-1|0;if((d[f>>0]|0|0)!=(e|0))a[f>>0]=e}else j=4}if((j|0)==4){c[b+100>>2]=0;e=-1}return e|0}function wi(a){a=a|0;if(a>>>0>4294963200){c[(qi()|0)>>2]=0-a;a=-1}return a|0}function xi(a,b){a=+a;b=+b;var d=0,e=0;h[k>>3]=a;e=c[k>>2]|0;d=c[k+4>>2]|0;h[k>>3]=b;d=c[k+4>>2]&-2147483648|d&2147483647;c[k>>2]=e;c[k+4>>2]=d;return +(+h[k>>3])}function yi(a,b){a=+a;b=+b;return +(+xi(a,b))}function zi(a,b){a=+a;b=+b;var d=0,e=0,f=0,g=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0;h[k>>3]=a;d=c[k>>2]|0;m=c[k+4>>2]|0;h[k>>3]=b;n=c[k>>2]|0;o=c[k+4>>2]|0;e=hk(d|0,m|0,52)|0;e=e&2047;j=hk(n|0,o|0,52)|0;j=j&2047;p=m&-2147483648;i=fk(n|0,o|0,1)|0;l=D;a:do if(!((i|0)==0&(l|0)==0)?(g=o&2147483647,!(g>>>0>2146435072|(g|0)==2146435072&n>>>0>0|(e|0)==2047)):0){f=fk(d|0,m|0,1)|0;g=D;if(!(g>>>0>l>>>0|(g|0)==(l|0)&f>>>0>i>>>0))return +((f|0)==(i|0)&(g|0)==(l|0)?a*0.0:a);if(!e){e=fk(d|0,m|0,12)|0;f=D;if((f|0)>-1|(f|0)==-1&e>>>0>4294967295){g=e;e=0;do{e=e+-1|0;g=fk(g|0,f|0,1)|0;f=D}while((f|0)>-1|(f|0)==-1&g>>>0>4294967295)}else e=0;d=fk(d|0,m|0,1-e|0)|0;f=D}else f=m&1048575|1048576;if(!j){g=fk(n|0,o|0,12)|0;i=D;if((i|0)>-1|(i|0)==-1&g>>>0>4294967295){j=0;do{j=j+-1|0;g=fk(g|0,i|0,1)|0;i=D}while((i|0)>-1|(i|0)==-1&g>>>0>4294967295)}else j=0;n=fk(n|0,o|0,1-j|0)|0;m=D}else m=o&1048575|1048576;l=dk(d|0,f|0,n|0,m|0)|0;i=D;g=(i|0)>-1|(i|0)==-1&l>>>0>4294967295;b:do if((e|0)>(j|0)){while(1){if(g)if((d|0)==(n|0)&(f|0)==(m|0))break;else{d=l;f=i}d=fk(d|0,f|0,1)|0;f=D;e=e+-1|0;l=dk(d|0,f|0,n|0,m|0)|0;i=D;g=(i|0)>-1|(i|0)==-1&l>>>0>4294967295;if((e|0)<=(j|0))break b}b=a*0.0;break a}while(0);if(g)if((d|0)==(n|0)&(f|0)==(m|0)){b=a*0.0;break}else{f=i;d=l}if(f>>>0<1048576|(f|0)==1048576&d>>>0<0)do{d=fk(d|0,f|0,1)|0;f=D;e=e+-1|0}while(f>>>0<1048576|(f|0)==1048576&d>>>0<0);if((e|0)>0){o=gk(d|0,f|0,0,-1048576)|0;d=D;e=fk(e|0,0,52)|0;d=d|D;e=o|e}else{e=hk(d|0,f|0,1-e|0)|0;d=D}c[k>>2]=e;c[k+4>>2]=d|p;b=+h[k>>3]}else q=3;while(0);if((q|0)==3){b=a*b;b=b/b}return +b}function Ai(a,b){a=+a;b=+b;return +(+zi(a,b))}function Bi(a,b){a=+a;b=b|0;var d=0,e=0,f=0;h[k>>3]=a;d=c[k>>2]|0;e=c[k+4>>2]|0;f=hk(d|0,e|0,52)|0;f=f&2047;switch(f|0){case 0:{if(a!=0.0){a=+Bi(a*18446744073709551616.0,b);d=(c[b>>2]|0)+-64|0}else d=0;c[b>>2]=d;break}case 2047:break;default:{c[b>>2]=f+-1022;c[k>>2]=d;c[k+4>>2]=e&-2146435073|1071644672;a=+h[k>>3]}}return +a}function Ci(a,b){a=+a;b=b|0;return +(+Bi(a,b))}function Di(a,b){a=+a;b=b|0;var d=0;if((b|0)>1023){a=a*8988465674311579538646525.0e283;d=b+-1023|0;if((d|0)>1023){d=b+-2046|0;d=(d|0)>1023?1023:d;a=a*8988465674311579538646525.0e283}}else if((b|0)<-1022){a=a*2.2250738585072014e-308;d=b+1022|0;if((d|0)<-1022){d=b+2044|0;d=(d|0)<-1022?-1022:d;a=a*2.2250738585072014e-308}}else d=b;d=fk(d+1023|0,0,52)|0;b=D;c[k>>2]=d;c[k+4>>2]=b;return +(a*+h[k>>3])}function Ei(a,b){a=+a;b=b|0;return +(+Di(a,b))}function Fi(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;l=i;i=i+16|0;g=l;j=(f|0)==0?2680:f;f=c[j>>2]|0;a:do if(!d)if(!f)f=0;else k=15;else{h=(b|0)==0?g:b;if(!e)f=-2;else{if(!f){f=a[d>>0]|0;g=f&255;if(f<<24>>24>-1){c[h>>2]=g;f=f<<24>>24!=0&1;break}f=g+-194|0;if(f>>>0>50){k=15;break}f=c[2432+(f<<2)>>2]|0;g=e+-1|0;if(g){d=d+1|0;k=9}}else{g=e;k=9}b:do if((k|0)==9){b=a[d>>0]|0;m=(b&255)>>>3;if((m+-16|m+(f>>26))>>>0>7){k=15;break a}while(1){d=d+1|0;f=(b&255)+-128|f<<6;g=g+-1|0;if((f|0)>=0)break;if(!g)break b;b=a[d>>0]|0;if((b&-64)<<24>>24!=-128){k=15;break a}}c[j>>2]=0;c[h>>2]=f;f=e-g|0;break a}while(0);c[j>>2]=f;f=-2}}while(0);if((k|0)==15){c[j>>2]=0;c[(qi()|0)>>2]=84;f=-1}i=l;return f|0}function Gi(a){a=a|0;if(!a)a=1;else a=(c[a>>2]|0)==0;return a&1|0}function Hi(b,d,e){b=b|0;d=d|0;e=e|0;do if(b){if(d>>>0<128){a[b>>0]=d;b=1;break}if(d>>>0<2048){a[b>>0]=d>>>6|192;a[b+1>>0]=d&63|128;b=2;break}if(d>>>0<55296|(d&-8192|0)==57344){a[b>>0]=d>>>12|224;a[b+1>>0]=d>>>6&63|128;a[b+2>>0]=d&63|128;b=3;break}if((d+-65536|0)>>>0<1048576){a[b>>0]=d>>>18|240;a[b+1>>0]=d>>>12&63|128;a[b+2>>0]=d>>>6&63|128;a[b+3>>0]=d&63|128;b=4;break}else{c[(qi()|0)>>2]=84;b=-1;break}}else b=1;while(0);return b|0}function Ii(a,b){a=a|0;b=b|0;if(!a)a=0;else a=Hi(a,b,0)|0;return a|0}function Ji(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;o=i;i=i+112|0;n=o+40|0;l=o+24|0;k=o+16|0;g=o;m=o+52|0;f=a[d>>0]|0;if(sj(14909,f<<24>>24,4)|0){e=Uj(1144)|0;if(!e)e=0;else{h=e;j=h+112|0;do{c[h>>2]=0;h=h+4|0}while((h|0)<(j|0));if(!(wj(d,43)|0))c[e>>2]=f<<24>>24==114?8:4;if(wj(d,101)|0){c[g>>2]=b;c[g+4>>2]=2;c[g+8>>2]=1;va(221,g|0)|0;f=a[d>>0]|0}if(f<<24>>24==97){c[k>>2]=b;c[k+4>>2]=3;f=va(221,k|0)|0;if(!(f&1024)){c[l>>2]=b;c[l+4>>2]=4;c[l+8>>2]=f|1024;va(221,l|0)|0}d=c[e>>2]|128;c[e>>2]=d}else d=c[e>>2]|0;c[e+60>>2]=b;c[e+44>>2]=e+120;c[e+48>>2]=1024;f=e+75|0;a[f>>0]=-1;if((d&8|0)==0?(c[n>>2]=b,c[n+4>>2]=21505,c[n+8>>2]=m,(mb(54,n|0)|0)==0):0)a[f>>0]=10;c[e+32>>2]=14;c[e+36>>2]=4;c[e+40>>2]=5;c[e+12>>2]=2;if(!(c[598]|0))c[e+76>>2]=-1;yb(2416);f=c[603]|0;c[e+56>>2]=f;if(f)c[f+52>>2]=e;c[603]=e;nb(2416)}}else{c[(qi()|0)>>2]=22;e=0}i=o;return e|0}function Ki(b){b=b|0;var c=0,d=0,e=0;d=(wj(b,43)|0)==0;c=a[b>>0]|0;d=d?c<<24>>24!=114&1:2;e=(wj(b,120)|0)==0;d=e?d:d|128;b=(wj(b,101)|0)==0;b=b?d:d|524288;b=c<<24>>24==114?b:b|64;b=c<<24>>24==119?b|512:b;return (c<<24>>24==97?b|1024:b)|0}function Li(a){a=a|0;return 0}function Mi(a){a=a|0;return}function Ni(a){a=a|0;var b=0,d=0;b=i;i=i+16|0;d=b;c[d>>2]=c[a+60>>2];a=wi(zb(6,d|0)|0)|0;i=b;return a|0}function Oi(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;m=i;i=i+48|0;h=m+16|0;g=m;f=m+32|0;c[f>>2]=d;j=f+4|0;l=b+48|0;n=c[l>>2]|0;c[j>>2]=e-((n|0)!=0&1);k=b+44|0;c[f+8>>2]=c[k>>2];c[f+12>>2]=n;if(!(c[597]|0)){c[h>>2]=c[b+60>>2];c[h+4>>2]=f;c[h+8>>2]=2;f=wi(Nb(145,h|0)|0)|0}else{Fa(13,b|0);c[g>>2]=c[b+60>>2];c[g+4>>2]=f;c[g+8>>2]=2;f=wi(Nb(145,g|0)|0)|0;pb(0)}if((f|0)>=1){j=c[j>>2]|0;if(f>>>0>j>>>0){h=c[k>>2]|0;g=b+4|0;c[g>>2]=h;c[b+8>>2]=h+(f-j);if(!(c[l>>2]|0))f=e;else{c[g>>2]=h+1;a[d+(e+-1)>>0]=a[h>>0]|0;f=e}}}else{c[b>>2]=c[b>>2]|f&48^16;c[b+8>>2]=0;c[b+4>>2]=0}i=m;return f|0}function Pi(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;f=i;i=i+32|0;g=f;e=f+20|0;c[g>>2]=c[a+60>>2];c[g+4>>2]=0;c[g+8>>2]=b;c[g+12>>2]=e;c[g+16>>2]=d;if((wi(Ib(140,g|0)|0)|0)<0){c[e>>2]=-1;a=-1}else a=c[e>>2]|0;i=f;return a|0}function Qi(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;q=i;i=i+48|0;n=q+16|0;m=q;e=q+32|0;o=a+28|0;f=c[o>>2]|0;c[e>>2]=f;p=a+20|0;f=(c[p>>2]|0)-f|0;c[e+4>>2]=f;c[e+8>>2]=b;c[e+12>>2]=d;k=a+60|0;l=a+44|0;b=2;f=f+d|0;while(1){if(!(c[597]|0)){c[n>>2]=c[k>>2];c[n+4>>2]=e;c[n+8>>2]=b;h=wi(Ob(146,n|0)|0)|0}else{Fa(14,a|0);c[m>>2]=c[k>>2];c[m+4>>2]=e;c[m+8>>2]=b;h=wi(Ob(146,m|0)|0)|0;pb(0)}if((f|0)==(h|0)){f=6;break}if((h|0)<0){f=8;break}f=f-h|0;g=c[e+4>>2]|0;if(h>>>0<=g>>>0)if((b|0)==2){c[o>>2]=(c[o>>2]|0)+h;j=g;b=2}else j=g;else{j=c[l>>2]|0;c[o>>2]=j;c[p>>2]=j;j=c[e+12>>2]|0;h=h-g|0;e=e+8|0;b=b+-1|0}c[e>>2]=(c[e>>2]|0)+h;c[e+4>>2]=j-h}if((f|0)==6){n=c[l>>2]|0;c[a+16>>2]=n+(c[a+48>>2]|0);a=n;c[o>>2]=a;c[p>>2]=a}else if((f|0)==8){c[a+16>>2]=0;c[o>>2]=0;c[p>>2]=0;c[a>>2]=c[a>>2]|32;if((b|0)==2)d=0;else d=d-(c[e+4>>2]|0)|0}i=q;return d|0}function Ri(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0;g=i;i=i+80|0;f=g;c[b+36>>2]=4;if((c[b>>2]&64|0)==0?(c[f>>2]=c[b+60>>2],c[f+4>>2]=21505,c[f+8>>2]=g+12,(mb(54,f|0)|0)!=0):0)a[b+75>>0]=-1;f=Qi(b,d,e)|0;i=g;return f|0}function Si(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=a+84|0;g=c[e>>2]|0;h=d+256|0;f=sj(g,0,h)|0;f=(f|0)==0?h:f-g|0;d=f>>>0<d>>>0?f:d;ik(b|0,g|0,d|0)|0;c[a+4>>2]=g+d;b=g+f|0;c[a+8>>2]=b;c[e>>2]=b;return d|0}function Ti(b){b=b|0;var d=0,e=0;d=b+74|0;e=a[d>>0]|0;a[d>>0]=e+255|e;d=b+20|0;e=b+44|0;if((c[d>>2]|0)>>>0>(c[e>>2]|0)>>>0)Qb[c[b+36>>2]&15](b,0,0)|0;c[b+16>>2]=0;c[b+28>>2]=0;c[d>>2]=0;d=c[b>>2]|0;if(d&20)if(!(d&4))d=-1;else{c[b>>2]=d|32;d=-1}else{d=c[e>>2]|0;c[b+8>>2]=d;c[b+4>>2]=d;d=0}return d|0}function Ui(b){b=b|0;var d=0,e=0;d=b+74|0;e=a[d>>0]|0;a[d>>0]=e+255|e;d=c[b>>2]|0;if(!(d&8)){c[b+8>>2]=0;c[b+4>>2]=0;d=c[b+44>>2]|0;c[b+28>>2]=d;c[b+20>>2]=d;c[b+16>>2]=d+(c[b+48>>2]|0);d=0}else{c[b>>2]=d|32;d=-1}return d|0}function Vi(a){a=a|0;var b=0,e=0;e=i;i=i+16|0;b=e;if((c[a+8>>2]|0)==0?(Ti(a)|0)!=0:0)b=-1;else if((Qb[c[a+32>>2]&15](a,b,1)|0)==1)b=d[b>>0]|0;else b=-1;i=e;return b|0}function Wi(a){a=a|0;var b=0,d=0,e=0;e=(c[a>>2]&1|0)!=0;if(!e){yb(2416);d=c[a+52>>2]|0;b=a+56|0;if(d)c[d+56>>2]=c[b>>2];b=c[b>>2]|0;if(b)c[b+52>>2]=d;if((c[603]|0)==(a|0))c[603]=b;nb(2416)}b=Yi(a)|0;b=Yb[c[a+12>>2]&31](a)|0|b;d=c[a+92>>2]|0;if(d)Vj(d);if(!e)Vj(a);return b|0}function Xi(a){a=a|0;var b=0;if((c[a+76>>2]|0)>-1){b=(Li(a)|0)==0;a=(c[a>>2]|0)>>>5&1}else a=(c[a>>2]|0)>>>5&1;return a|0}function Yi(a){a=a|0;var b=0,d=0;do if(a){if((c[a+76>>2]|0)<=-1){b=Kj(a)|0;break}d=(Li(a)|0)==0;b=Kj(a)|0;if(!d)Mi(a)}else{if(!(c[660]|0))b=0;else b=Yi(c[660]|0)|0;yb(2416);a=c[603]|0;if(a)do{if((c[a+76>>2]|0)>-1)d=Li(a)|0;else d=0;if((c[a+20>>2]|0)>>>0>(c[a+28>>2]|0)>>>0)b=Kj(a)|0|b;if(d)Mi(a);a=c[a+56>>2]|0}while((a|0)!=0);nb(2416)}while(0);return b|0}function Zi(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;if((c[f+76>>2]|0)>-1)o=Li(f)|0;else o=0;g=e+-1|0;if((e|0)<2){p=f+74|0;n=a[p>>0]|0;a[p>>0]=n+255|n;if(o)Mi(f);if(!g)a[b>>0]=0;else b=0}else{a:do if(g){m=f+4|0;n=f+8|0;h=b;while(1){i=c[m>>2]|0;q=i;k=(c[n>>2]|0)-q|0;j=sj(i,10,k)|0;r=(j|0)==0;j=r?k:1-q+j|0;q=j>>>0<g>>>0;j=q?j:g;ik(h|0,i|0,j|0)|0;i=c[m>>2]|0;k=i+j|0;c[m>>2]=k;e=h+j|0;l=g-j|0;if(!(r&q)){p=18;break a}if(k>>>0<(c[n>>2]|0)>>>0){j=j+1|0;c[m>>2]=i+j;i=d[k>>0]|0}else{g=Vi(f)|0;if((g|0)<0)break;j=j+1|0;i=g}g=l+-1|0;h=h+j|0;a[e>>0]=i;if(!((g|0)!=0&(i&255|0)!=10)){e=h;p=18;break a}}if((e|0)!=(b|0)?(c[f>>2]&16|0)!=0:0)p=18;else b=0}else{e=b;p=18}while(0);if((p|0)==18)if(!b)b=0;else a[e>>0]=0;if(o)Mi(f)}return b|0}function _i(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;g=i;i=i+32|0;f=g+16|0;e=g;if(sj(14909,a[d>>0]|0,4)|0){h=Ki(d)|0|32768;c[e>>2]=b;c[e+4>>2]=h;c[e+8>>2]=438;e=wi(Ab(5,e|0)|0)|0;if((e|0)>=0){b=Ji(e,d)|0;if(!b){c[f>>2]=e;zb(6,f|0)|0;b=0}}else b=0}else{c[(qi()|0)>>2]=22;b=0}i=g;return b|0}function $i(a,b){a=a|0;b=b|0;return (ij(a,Bj(a)|0,1,b)|0)+-1|0}function aj(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0;j=$(e,d)|0;if((c[f+76>>2]|0)>-1)k=Li(f)|0;else k=0;g=f+74|0;h=a[g>>0]|0;a[g>>0]=h+255|h;g=f+4|0;h=c[g>>2]|0;i=(c[f+8>>2]|0)-h|0;if((i|0)>0){i=i>>>0<j>>>0?i:j;ik(b|0,h|0,i|0)|0;c[g>>2]=h+i;b=b+i|0;g=j-i|0}else g=j;a:do if(!g)l=13;else{i=f+32|0;h=g;while(1){if(Ti(f)|0){e=h;break}g=Qb[c[i>>2]&15](f,b,h)|0;if((g+1|0)>>>0<2){e=h;break}if((h|0)==(g|0)){l=13;break a}else{b=b+g|0;h=h-g|0}}if(k)Mi(f);e=((j-e|0)>>>0)/(d>>>0)|0}while(0);if((l|0)==13)if(k)Mi(f);return e|0}function bj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;if((d|0)==1)b=b-(c[a+8>>2]|0)+(c[a+4>>2]|0)|0;f=a+20|0;e=a+28|0;if((c[f>>2]|0)>>>0>(c[e>>2]|0)>>>0?(Qb[c[a+36>>2]&15](a,0,0)|0,(c[f>>2]|0)==0):0)b=-1;else{c[a+16>>2]=0;c[e>>2]=0;c[f>>2]=0;if((Qb[c[a+40>>2]&15](a,b,d)|0)<0)b=-1;else{c[a+8>>2]=0;c[a+4>>2]=0;c[a>>2]=c[a>>2]&-17;b=0}}return b|0}function cj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;if((c[a+76>>2]|0)>-1){e=(Li(a)|0)==0;b=bj(a,b,d)|0;if(!e)Mi(a)}else b=bj(a,b,d)|0;return b|0}function dj(a,b,c){a=a|0;b=b|0;c=c|0;return cj(a,b,c)|0}function ej(a){a=a|0;var b=0;if(!(c[a>>2]&128))b=1;else b=(c[a+20>>2]|0)>>>0>(c[a+28>>2]|0)>>>0?2:1;b=Qb[c[a+40>>2]&15](a,0,b)|0;if((b|0)>=0)b=b-(c[a+8>>2]|0)+(c[a+4>>2]|0)+(c[a+20>>2]|0)-(c[a+28>>2]|0)|0;return b|0}function fj(a){a=a|0;var b=0;if((c[a+76>>2]|0)>-1){b=(Li(a)|0)==0;a=ej(a)|0}else a=ej(a)|0;return a|0}function gj(a){a=a|0;return fj(a)|0}function hj(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=e+16|0;g=c[f>>2]|0;if(!g)if(!(Ui(e)|0)){g=c[f>>2]|0;h=4}else f=0;else h=4;a:do if((h|0)==4){i=e+20|0;h=c[i>>2]|0;if((g-h|0)>>>0<d>>>0){f=Qb[c[e+36>>2]&15](e,b,d)|0;break}b:do if((a[e+75>>0]|0)>-1){f=d;while(1){if(!f){g=h;f=0;break b}g=f+-1|0;if((a[b+g>>0]|0)==10)break;else f=g}if((Qb[c[e+36>>2]&15](e,b,f)|0)>>>0<f>>>0)break a;d=d-f|0;b=b+f|0;g=c[i>>2]|0}else{g=h;f=0}while(0);ik(g|0,b|0,d|0)|0;c[i>>2]=(c[i>>2]|0)+d;f=f+d|0}while(0);return f|0}function ij(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=$(d,b)|0;if((c[e+76>>2]|0)>-1){g=(Li(e)|0)==0;a=hj(a,f,e)|0;if(!g)Mi(e)}else a=hj(a,f,e)|0;if((a|0)!=(f|0))d=(a>>>0)/(b>>>0)|0;return d|0}function jj(a){a=a|0;var b=0;if((c[a+76>>2]|0)>-1){b=(Li(a)|0)==0;bj(a,0,0)|0;c[a>>2]=c[a>>2]&-33;if(!b)Mi(a)}else{bj(a,0,0)|0;c[a>>2]=c[a>>2]&-33}return}function kj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e=i;i=i+16|0;f=e;c[f>>2]=d;d=pj(a,b,f)|0;i=e;return d|0}function lj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;j=i;i=i+16|0;e=j;f=Uj(240)|0;do if(f){c[e>>2]=c[d>>2];e=oj(f,240,b,e)|0;if(e>>>0<240){b=Xj(f,e+1|0)|0;c[a>>2]=(b|0)!=0?b:f;break}Vj(f);if((e|0)>=0?(h=e+1|0,g=Uj(h)|0,c[a>>2]=g,(g|0)!=0):0)e=oj(g,h,b,d)|0;else e=-1}else e=-1;while(0);i=j;return e|0}function mj(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;s=i;i=i+224|0;o=s+80|0;r=s+96|0;q=s;p=s+136|0;f=r;g=f+40|0;do{c[f>>2]=0;f=f+4|0}while((f|0)<(g|0));c[o>>2]=c[e>>2];if((Lj(0,d,o,q,r)|0)<0)e=-1;else{if((c[b+76>>2]|0)>-1)m=Li(b)|0;else m=0;e=c[b>>2]|0;n=e&32;if((a[b+74>>0]|0)<1)c[b>>2]=e&-33;e=b+48|0;if(!(c[e>>2]|0)){g=b+44|0;h=c[g>>2]|0;c[g>>2]=p;j=b+28|0;c[j>>2]=p;k=b+20|0;c[k>>2]=p;c[e>>2]=80;l=b+16|0;c[l>>2]=p+80;f=Lj(b,d,o,q,r)|0;if(h){Qb[c[b+36>>2]&15](b,0,0)|0;f=(c[k>>2]|0)==0?-1:f;c[g>>2]=h;c[e>>2]=0;c[l>>2]=0;c[j>>2]=0;c[k>>2]=0}}else f=Lj(b,d,o,q,r)|0;e=c[b>>2]|0;c[b>>2]=e|n;if(m)Mi(b);e=(e&32|0)==0?f:-1}i=s;return e|0}function nj(e,f,j){e=e|0;f=f|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0.0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0;P=i;i=i+304|0;H=P+16|0;J=P+8|0;I=P+33|0;K=P;y=P+32|0;if((c[e+76>>2]|0)>-1)O=Li(e)|0;else O=0;k=a[f>>0]|0;a:do if(k<<24>>24){L=e+4|0;M=e+100|0;G=e+108|0;z=e+8|0;A=I+10|0;B=I+33|0;C=J+4|0;E=I+46|0;F=I+94|0;m=k;k=0;n=f;s=0;l=0;f=0;b:while(1){c:do if(!(pi(m&255)|0)){m=(a[n>>0]|0)==37;d:do if(m){q=n+1|0;o=a[q>>0]|0;e:do switch(o<<24>>24){case 37:break d;case 42:{x=0;o=n+2|0;break}default:{o=(o&255)+-48|0;if(o>>>0<10?(a[n+2>>0]|0)==36:0){c[H>>2]=c[j>>2];while(1){x=(c[H>>2]|0)+(4-1)&~(4-1);m=c[x>>2]|0;c[H>>2]=x+4;if(o>>>0>1)o=o+-1|0;else break}x=m;o=n+3|0;break e}o=(c[j>>2]|0)+(4-1)&~(4-1);x=c[o>>2]|0;c[j>>2]=o+4;o=q}}while(0);m=a[o>>0]|0;n=m&255;if((n+-48|0)>>>0<10){m=0;while(1){q=(m*10|0)+-48+n|0;o=o+1|0;m=a[o>>0]|0;n=m&255;if((n+-48|0)>>>0>=10)break;else m=q}}else q=0;if(m<<24>>24==109){o=o+1|0;r=a[o>>0]|0;m=(x|0)!=0&1;l=0;f=0}else{r=m;m=0}n=o+1|0;switch(r&255|0){case 104:{w=(a[n>>0]|0)==104;n=w?o+2|0:n;o=w?-2:-1;break}case 108:{w=(a[n>>0]|0)==108;n=w?o+2|0:n;o=w?3:1;break}case 106:{o=3;break}case 116:case 122:{o=1;break}case 76:{o=2;break}case 110:case 112:case 67:case 83:case 91:case 99:case 115:case 88:case 71:case 70:case 69:case 65:case 103:case 102:case 101:case 97:case 120:case 117:case 111:case 105:case 100:{n=o;o=0;break}default:{N=152;break b}}r=d[n>>0]|0;t=(r&47|0)==3;r=t?r|32:r;t=t?1:o;switch(r|0){case 99:{w=s;v=(q|0)<1?1:q;break}case 91:{w=s;v=q;break}case 110:{if(!x){o=s;break c}switch(t|0){case -2:{a[x>>0]=s;o=s;break c}case -1:{b[x>>1]=s;o=s;break c}case 0:{c[x>>2]=s;o=s;break c}case 1:{c[x>>2]=s;o=s;break c}case 3:{o=x;c[o>>2]=s;c[o+4>>2]=((s|0)<0)<<31>>31;o=s;break c}default:{o=s;break c}}}default:{ui(e,0);do{o=c[L>>2]|0;if(o>>>0<(c[M>>2]|0)>>>0){c[L>>2]=o+1;o=d[o>>0]|0}else o=vi(e)|0}while((pi(o)|0)!=0);o=c[L>>2]|0;if(c[M>>2]|0){o=o+-1|0;c[L>>2]=o}w=(c[G>>2]|0)+s+o-(c[z>>2]|0)|0;v=q}}ui(e,v);o=c[L>>2]|0;q=c[M>>2]|0;if(o>>>0<q>>>0)c[L>>2]=o+1;else{if((vi(e)|0)<0){N=152;break b}q=c[M>>2]|0}if(q)c[L>>2]=(c[L>>2]|0)+-1;f:do switch(r|0){case 91:case 99:case 115:{u=(r|0)==99;g:do if((r&239|0)==99){ek(I|0,-1,257)|0;a[I>>0]=0;if((r|0)==115){a[B>>0]=0;a[A>>0]=0;a[A+1>>0]=0;a[A+2>>0]=0;a[A+3>>0]=0;a[A+4>>0]=0}}else{Q=n+1|0;s=(a[Q>>0]|0)==94;o=s&1;r=s?Q:n;n=s?n+2|0:Q;ek(I|0,s&1|0,257)|0;a[I>>0]=0;switch(a[n>>0]|0){case 45:{s=(o^1)&255;a[E>>0]=s;n=r+2|0;break}case 93:{s=(o^1)&255;a[F>>0]=s;n=r+2|0;break}default:s=(o^1)&255}while(1){o=a[n>>0]|0;h:do switch(o<<24>>24){case 0:{N=152;break b}case 93:break g;case 45:{r=n+1|0;o=a[r>>0]|0;switch(o<<24>>24){case 93:case 0:{o=45;break h}default:{}}n=a[n+-1>>0]|0;if((n&255)<(o&255)){n=n&255;do{n=n+1|0;a[I+n>>0]=s;o=a[r>>0]|0}while((n|0)<(o&255|0));n=r}else n=r;break}default:{}}while(0);a[I+((o&255)+1)>>0]=s;n=n+1|0}}while(0);r=u?v+1|0:31;s=(t|0)==1;t=(m|0)!=0;i:do if(s){if(t){f=Uj(r<<2)|0;if(!f){l=0;N=152;break b}}else f=x;c[J>>2]=0;c[C>>2]=0;l=0;j:while(1){q=(f|0)==0;do{k:while(1){o=c[L>>2]|0;if(o>>>0<(c[M>>2]|0)>>>0){c[L>>2]=o+1;o=d[o>>0]|0}else o=vi(e)|0;if(!(a[I+(o+1)>>0]|0))break j;a[y>>0]=o;switch(Fi(K,y,1,J)|0){case -1:{l=0;N=152;break b}case -2:break;default:break k}}if(!q){c[f+(l<<2)>>2]=c[K>>2];l=l+1|0}}while(!(t&(l|0)==(r|0)));l=r<<1|1;o=Xj(f,l<<2)|0;if(!o){l=0;N=152;break b}Q=r;r=l;f=o;l=Q}if(!(Gi(J)|0)){l=0;N=152;break b}else{q=l;l=0}}else{if(t){l=Uj(r)|0;if(!l){l=0;f=0;N=152;break b}else o=0;while(1){do{f=c[L>>2]|0;if(f>>>0<(c[M>>2]|0)>>>0){c[L>>2]=f+1;f=d[f>>0]|0}else f=vi(e)|0;if(!(a[I+(f+1)>>0]|0)){q=o;f=0;break i}a[l+o>>0]=f;o=o+1|0}while((o|0)!=(r|0));f=r<<1|1;o=Xj(l,f)|0;if(!o){f=0;N=152;break b}else{Q=r;r=f;l=o;o=Q}}}if(!x){l=q;while(1){f=c[L>>2]|0;if(f>>>0<l>>>0){c[L>>2]=f+1;f=d[f>>0]|0}else f=vi(e)|0;if(!(a[I+(f+1)>>0]|0)){q=0;l=0;f=0;break i}l=c[M>>2]|0}}else{l=0;while(1){f=c[L>>2]|0;if(f>>>0<q>>>0){c[L>>2]=f+1;f=d[f>>0]|0}else f=vi(e)|0;if(!(a[I+(f+1)>>0]|0)){q=l;l=x;f=0;break i}a[x+l>>0]=f;q=c[M>>2]|0;l=l+1|0}}}while(0);o=c[L>>2]|0;if(c[M>>2]|0){o=o+-1|0;c[L>>2]=o}o=o-(c[z>>2]|0)+(c[G>>2]|0)|0;if(!o)break b;if(!((o|0)==(v|0)|u^1))break b;do if(t)if(s){c[x>>2]=f;break}else{c[x>>2]=l;break}while(0);if(!u){if(f)c[f+(q<<2)>>2]=0;if(!l){l=0;break f}a[l+q>>0]=0}break}case 120:case 88:case 112:{o=16;N=134;break}case 111:{o=8;N=134;break}case 117:case 100:{o=10;N=134;break}case 105:{o=0;N=134;break}case 71:case 103:case 70:case 102:case 69:case 101:case 65:case 97:{p=+si(e,t,0);if((c[G>>2]|0)==((c[z>>2]|0)-(c[L>>2]|0)|0))break b;if(x)switch(t|0){case 0:{g[x>>2]=p;break f}case 1:{h[x>>3]=p;break f}case 2:{h[x>>3]=p;break f}default:break f}break}default:{}}while(0);l:do if((N|0)==134){N=0;o=ti(e,o,0,-1,-1)|0;if((c[G>>2]|0)==((c[z>>2]|0)-(c[L>>2]|0)|0))break b;if((x|0)!=0&(r|0)==112){c[x>>2]=o;break}if(x)switch(t|0){case -2:{a[x>>0]=o;break l}case -1:{b[x>>1]=o;break l}case 0:{c[x>>2]=o;break l}case 1:{c[x>>2]=o;break l}case 3:{Q=x;c[Q>>2]=o;c[Q+4>>2]=D;break l}default:break l}}while(0);k=((x|0)!=0&1)+k|0;o=(c[G>>2]|0)+w+(c[L>>2]|0)-(c[z>>2]|0)|0;break c}while(0);n=n+(m&1)|0;ui(e,0);m=c[L>>2]|0;if(m>>>0<(c[M>>2]|0)>>>0){c[L>>2]=m+1;m=d[m>>0]|0}else m=vi(e)|0;if((m|0)!=(d[n>>0]|0)){N=21;break b}o=s+1|0}else{while(1){m=n+1|0;if(!(pi(d[m>>0]|0)|0))break;else n=m}ui(e,0);do{m=c[L>>2]|0;if(m>>>0<(c[M>>2]|0)>>>0){c[L>>2]=m+1;m=d[m>>0]|0}else m=vi(e)|0}while((pi(m)|0)!=0);m=c[L>>2]|0;if(c[M>>2]|0){m=m+-1|0;c[L>>2]=m}o=(c[G>>2]|0)+s+m-(c[z>>2]|0)|0}while(0);n=n+1|0;m=a[n>>0]|0;if(!(m<<24>>24))break a;else s=o}if((N|0)==21){if(c[M>>2]|0)c[L>>2]=(c[L>>2]|0)+-1;if((k|0)!=0|(m|0)>-1)break;else{k=0;N=153}}else if((N|0)==152)if(!k){k=m;N=153}if((N|0)==153){m=k;k=-1}if(m){Vj(l);Vj(f)}}else k=0;while(0);if(O)Mi(e);i=P;return k|0}function oj(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;n=i;i=i+128|0;g=n+112|0;m=n;h=m;j=2684;k=h+112|0;do{c[h>>2]=c[j>>2];h=h+4|0;j=j+4|0}while((h|0)<(k|0));if((d+-1|0)>>>0>2147483646)if(!d){d=1;l=4}else{c[(qi()|0)>>2]=75;d=-1}else{g=b;l=4}if((l|0)==4){l=-2-g|0;l=d>>>0>l>>>0?l:d;c[m+48>>2]=l;b=m+20|0;c[b>>2]=g;c[m+44>>2]=g;d=g+l|0;g=m+16|0;c[g>>2]=d;c[m+28>>2]=d;d=mj(m,e,f)|0;if(l){e=c[b>>2]|0;a[e+(((e|0)==(c[g>>2]|0))<<31>>31)>>0]=0}}i=n;return d|0}function pj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;g=i;i=i+112|0;e=g;f=e;h=f+112|0;do{c[f>>2]=0;f=f+4|0}while((f|0)<(h|0));c[e+32>>2]=15;c[e+44>>2]=a;c[e+76>>2]=-1;c[e+84>>2]=a;h=nj(e,b,d)|0;i=g;return h|0}function qj(b){b=b|0;var c=0,d=0,e=0,f=0;while(1){c=b+1|0;if(!(pi(a[b>>0]|0)|0))break;else b=c}d=a[b>>0]|0;switch(d<<24>>24|0){case 45:{e=1;f=5;break}case 43:{e=0;f=5;break}default:e=0}if((f|0)==5){b=c;d=a[c>>0]|0}c=(d<<24>>24)+-48|0;if(c>>>0<10){d=b;b=0;do{d=d+1|0;b=(b*10|0)-c|0;c=(a[d>>0]|0)+-48|0}while(c>>>0<10)}else b=0;return ((e|0)!=0?b:0-b|0)|0}function rj(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;r=i;i=i+208|0;o=r+8|0;p=r;f=$(d,b)|0;n=p;c[n>>2]=1;c[n+4>>2]=0;if(f){j=f-d|0;c[o+4>>2]=d;c[o>>2]=d;g=d;b=d;h=2;while(1){b=b+d+g|0;c[o+(h<<2)>>2]=b;if(b>>>0<f>>>0){n=g;g=b;h=h+1|0;b=n}else break}n=0-d|0;k=a+j|0;m=p+4|0;if((j|0)>0){j=k;f=1;h=1;while(1){do if((f&3|0)==3){Nj(a,d,e,h,o);l=c[m>>2]|0;b=l<<30|(c[p>>2]|0)>>>2;c[p>>2]=b;c[m>>2]=l>>>2;h=h+2|0}else{b=h+-1|0;if((c[o+(b<<2)>>2]|0)>>>0<(j-a|0)>>>0)Nj(a,d,e,h,o);else Oj(a,d,e,p,h,0,o);if((h|0)==1){b=c[p>>2]|0;c[m>>2]=b>>>31|c[m>>2]<<1;b=b<<1;c[p>>2]=b;h=0;break}if(b>>>0>31){f=c[p>>2]|0;c[m>>2]=f;c[p>>2]=0;b=h+-33|0;g=0}else{f=c[m>>2]|0;g=c[p>>2]|0}c[m>>2]=g>>>(32-b|0)|f<<b;b=g<<b;c[p>>2]=b;h=1}while(0);f=b|1;c[p>>2]=f;b=a+d|0;if(b>>>0>=k>>>0){f=b;break}else a=b}}else{f=a;h=1}Oj(f,d,e,p,h,0,o);l=p+4|0;b=c[p>>2]|0;if(!((h|0)==1&(b|0)==1&(c[l>>2]|0)==0)){g=f;while(1){if((h|0)<2){f=b+-1|0;do if(f){if(!(f&1)){j=f;f=0;do{f=f+1|0;j=j>>>1}while((j&1|0)==0);if(!f)q=24}else q=24;if((q|0)==24){q=0;k=c[m>>2]|0;if(!k){f=64;q=30;break}if(!(k&1)){j=k;f=0}else{a=0;j=k;f=0;break}while(1){a=f+1|0;j=j>>>1;if(j&1){j=a;break}else f=a}if(!j){a=0;j=k;f=0;break}else f=f+33|0}if(f>>>0>31)q=30;else{a=f;j=c[m>>2]|0}}else{f=32;q=30}while(0);if((q|0)==30){q=0;b=c[m>>2]|0;c[p>>2]=b;c[m>>2]=0;a=f+-32|0;j=0}c[p>>2]=j<<32-a|b>>>a;c[m>>2]=j>>>a;g=g+n|0;f=f+h|0}else{a=b>>>30;k=a|c[m>>2]<<2;f=h+-2|0;c[p>>2]=(b<<1&2147483646|a<<31)^3;c[m>>2]=k>>>1;Oj(g+(0-((c[o+(f<<2)>>2]|0)+d))|0,d,e,p,h+-1|0,1,o);k=c[p>>2]|0;c[m>>2]=k>>>31|c[m>>2]<<1;c[p>>2]=k<<1|1;g=g+n|0;Oj(g,d,e,p,f,1,o)}b=c[p>>2]|0;if((f|0)==1&(b|0)==1&(c[l>>2]|0)==0)break;else h=f}}}i=r;return}function sj(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;h=d&255;f=(e|0)!=0;a:do if(f&(b&3|0)!=0){g=d&255;while(1){if((a[b>>0]|0)==g<<24>>24){i=6;break a}b=b+1|0;e=e+-1|0;f=(e|0)!=0;if(!(f&(b&3|0)!=0)){i=5;break}}}else i=5;while(0);if((i|0)==5)if(f)i=6;else e=0;b:do if((i|0)==6){g=d&255;if((a[b>>0]|0)!=g<<24>>24){f=$(h,16843009)|0;c:do if(e>>>0>3)while(1){h=c[b>>2]^f;if((h&-2139062144^-2139062144)&h+-16843009)break;b=b+4|0;e=e+-4|0;if(e>>>0<=3){i=11;break c}}else i=11;while(0);if((i|0)==11)if(!e){e=0;break}while(1){if((a[b>>0]|0)==g<<24>>24)break b;b=b+1|0;e=e+-1|0;if(!e){e=0;break}}}}while(0);return ((e|0)!=0?b:0)|0}function tj(b,c,d){b=b|0;c=c|0;d=d|0;var e=0;e=c&255;do{if(!d){c=0;break}d=d+-1|0;c=b+d|0}while((a[c>>0]|0)!=e<<24>>24);return c|0}function uj(b,d){b=b|0;d=d|0;var e=0,f=0;e=d;a:do if(!((e^b)&3)){if(e&3)do{e=a[d>>0]|0;a[b>>0]=e;if(!(e<<24>>24))break a;d=d+1|0;b=b+1|0}while((d&3|0)!=0);e=c[d>>2]|0;if(!((e&-2139062144^-2139062144)&e+-16843009)){f=b;while(1){d=d+4|0;b=f+4|0;c[f>>2]=e;e=c[d>>2]|0;if((e&-2139062144^-2139062144)&e+-16843009)break;else f=b}}f=8}else f=8;while(0);if((f|0)==8){f=a[d>>0]|0;a[b>>0]=f;if(f<<24>>24)do{d=d+1|0;b=b+1|0;f=a[d>>0]|0;a[b>>0]=f}while(f<<24>>24!=0)}return b|0}function vj(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;g=d;do if(!((g^b)&3)){f=(e|0)!=0;a:do if(f&(g&3|0)!=0)while(1){g=a[d>>0]|0;a[b>>0]=g;if(!(g<<24>>24))break a;e=e+-1|0;d=d+1|0;b=b+1|0;f=(e|0)!=0;if(!(f&(d&3|0)!=0)){h=5;break}}else h=5;while(0);if((h|0)==5)if(!f){e=0;break}if(a[d>>0]|0){b:do if(e>>>0>3)do{f=c[d>>2]|0;if((f&-2139062144^-2139062144)&f+-16843009)break b;c[b>>2]=f;e=e+-4|0;d=d+4|0;b=b+4|0}while(e>>>0>3);while(0);h=11}}else h=11;while(0);c:do if((h|0)==11)if(!e)e=0;else while(1){h=a[d>>0]|0;a[b>>0]=h;if(!(h<<24>>24))break c;e=e+-1|0;b=b+1|0;if(!e){e=0;break}else d=d+1|0}while(0);ek(b|0,0,e|0)|0;return b|0}function wj(b,c){b=b|0;c=c|0;b=xj(b,c)|0;return ((a[b>>0]|0)==(c&255)<<24>>24?b:0)|0}function xj(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;f=d&255;a:do if(!f)b=b+(Bj(b)|0)|0;else{if(b&3){e=d&255;do{g=a[b>>0]|0;if(g<<24>>24==0?1:g<<24>>24==e<<24>>24)break a;b=b+1|0}while((b&3|0)!=0)}f=$(f,16843009)|0;e=c[b>>2]|0;b:do if(!((e&-2139062144^-2139062144)&e+-16843009))do{g=e^f;if((g&-2139062144^-2139062144)&g+-16843009)break b;b=b+4|0;e=c[b>>2]|0}while(((e&-2139062144^-2139062144)&e+-16843009|0)==0);while(0);e=d&255;while(1){g=a[b>>0]|0;if(g<<24>>24==0?1:g<<24>>24==e<<24>>24)break;else b=b+1|0}}while(0);return b|0}function yj(a,b){a=a|0;b=b|0;uj(a,b)|0;return a|0}function zj(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;g=i;i=i+32|0;f=g;e=a[d>>0]|0;if(e<<24>>24!=0?(a[d+1>>0]|0)!=0:0){c[f>>2]=0;c[f+4>>2]=0;c[f+8>>2]=0;c[f+12>>2]=0;c[f+16>>2]=0;c[f+20>>2]=0;c[f+24>>2]=0;c[f+28>>2]=0;do{h=f+(((e&255)>>>5&255)<<2)|0;c[h>>2]=c[h>>2]|1<<(e&31);d=d+1|0;e=a[d>>0]|0}while(e<<24>>24!=0);d=a[b>>0]|0;a:do if(!(d<<24>>24))e=b;else{e=b;do{if(c[f+(((d&255)>>>5&255)<<2)>>2]&1<<(d&31))break a;e=e+1|0;d=a[e>>0]|0}while(d<<24>>24!=0)}while(0);e=e-b|0}else e=(xj(b,e<<24>>24)|0)-b|0;i=g;return e|0}function Aj(a){a=a|0;var b=0,c=0;c=(Bj(a)|0)+1|0;b=Uj(c)|0;if(!b)b=0;else ik(b|0,a|0,c|0)|0;return b|0}function Bj(b){b=b|0;var d=0,e=0,f=0;f=b;a:do if(!(f&3))e=4;else{d=b;b=f;while(1){if(!(a[d>>0]|0))break a;d=d+1|0;b=d;if(!(b&3)){b=d;e=4;break}}}while(0);if((e|0)==4){while(1){d=c[b>>2]|0;if(!((d&-2139062144^-2139062144)&d+-16843009))b=b+4|0;else break}if((d&255)<<24>>24)do b=b+1|0;while((a[b>>0]|0)!=0)}return b-f|0}function Cj(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0;e=b+(Bj(b)|0)|0;a:do if(d)while(1){f=a[c>>0]|0;if(!(f<<24>>24))break a;d=d+-1|0;g=e+1|0;a[e>>0]=f;if(!d){e=g;break}else{c=c+1|0;e=g}}while(0);a[e>>0]=0;return b|0}function Dj(a,b,c){a=a|0;b=b|0;c=c|0;vj(a,b,c)|0;return a|0}function Ej(a,b){a=a|0;b=b|0;return tj(a,b,(Bj(a)|0)+1|0)|0}function Fj(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0;h=i;i=i+32|0;g=h;c[g>>2]=0;c[g+4>>2]=0;c[g+8>>2]=0;c[g+12>>2]=0;c[g+16>>2]=0;c[g+20>>2]=0;c[g+24>>2]=0;c[g+28>>2]=0;f=a[d>>0]|0;do if(!(f<<24>>24))d=0;else{if(!(a[d+1>>0]|0)){d=b;while(1)if((a[d>>0]|0)==f<<24>>24)d=d+1|0;else break;d=d-b|0;break}else{e=d;d=f}do{f=g+(((d&255)>>>5&255)<<2)|0;c[f>>2]=c[f>>2]|1<<(d&31);e=e+1|0;d=a[e>>0]|0}while(d<<24>>24!=0);e=a[b>>0]|0;a:do if(!(e<<24>>24))d=b;else{d=b;do{if(!(c[g+(((e&255)>>>5&255)<<2)>>2]&1<<(e&31)))break a;d=d+1|0;e=a[d>>0]|0}while(e<<24>>24!=0)}while(0);d=d-b|0}while(0);i=h;return d|0}function Gj(b,d){b=b|0;d=d|0;var e=0,f=0;if(!b){b=c[699]|0;if(!b)b=0;else{f=b;e=3}}else{f=b;e=3}do if((e|0)==3){e=Fj(f,d)|0;b=f+e|0;if(!(a[b>>0]|0)){c[699]=0;b=0;break}e=(zj(b,d)|0)+e|0;d=f+e|0;c[699]=d;if(!(a[d>>0]|0)){c[699]=0;break}else{c[699]=f+(e+1);a[d>>0]=0;break}}while(0);return b|0}function Hj(a,b){a=a|0;b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0;i=a+4|0;e=c[i>>2]|0;j=a+100|0;if(e>>>0<(c[j>>2]|0)>>>0){c[i>>2]=e+1;e=d[e>>0]|0}else e=vi(a)|0;switch(e|0){case 43:case 45:{f=(e|0)==45&1;e=c[i>>2]|0;if(e>>>0<(c[j>>2]|0)>>>0){c[i>>2]=e+1;e=d[e>>0]|0}else e=vi(a)|0;if((b|0)!=0&(e+-48|0)>>>0>9?(c[j>>2]|0)!=0:0){c[i>>2]=(c[i>>2]|0)+-1;h=f}else h=f;break}default:h=0}if((e+-48|0)>>>0>9)if(!(c[j>>2]|0)){f=-2147483648;e=0}else{c[i>>2]=(c[i>>2]|0)+-1;f=-2147483648;e=0}else{f=0;do{f=e+-48+(f*10|0)|0;e=c[i>>2]|0;if(e>>>0<(c[j>>2]|0)>>>0){c[i>>2]=e+1;e=d[e>>0]|0}else e=vi(a)|0}while((e+-48|0)>>>0<10&(f|0)<214748364);b=((f|0)<0)<<31>>31;if((e+-48|0)>>>0<10){do{b=ok(f|0,b|0,10,0)|0;f=D;e=gk(e|0,((e|0)<0)<<31>>31|0,-48,-1)|0;f=gk(e|0,D|0,b|0,f|0)|0;b=D;e=c[i>>2]|0;if(e>>>0<(c[j>>2]|0)>>>0){c[i>>2]=e+1;e=d[e>>0]|0}else e=vi(a)|0}while((e+-48|0)>>>0<10&((b|0)<21474836|(b|0)==21474836&f>>>0<2061584302));g=f}else g=f;if((e+-48|0)>>>0<10)do{e=c[i>>2]|0;if(e>>>0<(c[j>>2]|0)>>>0){c[i>>2]=e+1;e=d[e>>0]|0}else e=vi(a)|0}while((e+-48|0)>>>0<10);if(c[j>>2]|0)c[i>>2]=(c[i>>2]|0)+-1;a=(h|0)!=0;e=dk(0,0,g|0,b|0)|0;f=a?D:b;e=a?e:g}D=f;return e|0}function Ij(a){a=a|0;if(!(c[a+68>>2]|0))Mi(a);return}function Jj(a){a=a|0;if(!(c[a+68>>2]|0))Mi(a);return}function Kj(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0;b=a+20|0;g=a+28|0;if((c[b>>2]|0)>>>0>(c[g>>2]|0)>>>0?(Qb[c[a+36>>2]&15](a,0,0)|0,(c[b>>2]|0)==0):0)b=-1;else{h=a+4|0;d=c[h>>2]|0;e=a+8|0;f=c[e>>2]|0;if(d>>>0<f>>>0)Qb[c[a+40>>2]&15](a,d-f|0,1)|0;c[a+16>>2]=0;c[g>>2]=0;c[b>>2]=0;c[e>>2]=0;c[h>>2]=0;b=0}return b|0}function Lj(e,f,g,j,l){e=e|0;f=f|0;g=g|0;j=j|0;l=l|0;var m=0,n=0,o=0,p=0,q=0.0,r=0,s=0,t=0,u=0,v=0.0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0;ha=i;i=i+624|0;ca=ha+24|0;ea=ha+16|0;da=ha+588|0;Y=ha+576|0;ba=ha;V=ha+536|0;ga=ha+8|0;fa=ha+528|0;M=(e|0)!=0;N=V+40|0;U=N;V=V+39|0;W=ga+4|0;X=Y+12|0;Y=Y+11|0;Z=da;_=X;aa=_-Z|0;O=-2-Z|0;P=_+2|0;Q=ca+288|0;R=da+9|0;S=R;T=da+8|0;m=0;w=f;n=0;f=0;a:while(1){do if((m|0)>-1)if((n|0)>(2147483647-m|0)){c[(qi()|0)>>2]=75;m=-1;break}else{m=n+m|0;break}while(0);n=a[w>>0]|0;if(!(n<<24>>24)){L=245;break}else o=w;b:while(1){switch(n<<24>>24){case 37:{n=o;L=9;break b}case 0:{n=o;break b}default:{}}K=o+1|0;n=a[K>>0]|0;o=K}c:do if((L|0)==9)while(1){L=0;if((a[n+1>>0]|0)!=37)break c;o=o+1|0;n=n+2|0;if((a[n>>0]|0)==37)L=9;else break}while(0);y=o-w|0;if(M?(c[e>>2]&32|0)==0:0)hj(w,y,e)|0;if((o|0)!=(w|0)){w=n;n=y;continue}r=n+1|0;o=a[r>>0]|0;p=(o<<24>>24)+-48|0;if(p>>>0<10){K=(a[n+2>>0]|0)==36;r=K?n+3|0:r;o=a[r>>0]|0;u=K?p:-1;f=K?1:f}else u=-1;n=o<<24>>24;d:do if((n&-32|0)==32){p=0;while(1){if(!(1<<n+-32&75913)){s=p;n=r;break d}p=1<<(o<<24>>24)+-32|p;r=r+1|0;o=a[r>>0]|0;n=o<<24>>24;if((n&-32|0)!=32){s=p;n=r;break}}}else{s=0;n=r}while(0);do if(o<<24>>24==42){p=n+1|0;o=(a[p>>0]|0)+-48|0;if(o>>>0<10?(a[n+2>>0]|0)==36:0){c[l+(o<<2)>>2]=10;f=1;n=n+3|0;o=c[j+((a[p>>0]|0)+-48<<3)>>2]|0}else{if(f){m=-1;break a}if(!M){x=s;n=p;f=0;K=0;break}f=(c[g>>2]|0)+(4-1)&~(4-1);o=c[f>>2]|0;c[g>>2]=f+4;f=0;n=p}if((o|0)<0){x=s|8192;K=0-o|0}else{x=s;K=o}}else{p=(o<<24>>24)+-48|0;if(p>>>0<10){o=0;do{o=(o*10|0)+p|0;n=n+1|0;p=(a[n>>0]|0)+-48|0}while(p>>>0<10);if((o|0)<0){m=-1;break a}else{x=s;K=o}}else{x=s;K=0}}while(0);e:do if((a[n>>0]|0)==46){p=n+1|0;o=a[p>>0]|0;if(o<<24>>24!=42){r=(o<<24>>24)+-48|0;if(r>>>0<10){n=p;o=0}else{n=p;r=0;break}while(1){o=(o*10|0)+r|0;n=n+1|0;r=(a[n>>0]|0)+-48|0;if(r>>>0>=10){r=o;break e}}}p=n+2|0;o=(a[p>>0]|0)+-48|0;if(o>>>0<10?(a[n+3>>0]|0)==36:0){c[l+(o<<2)>>2]=10;n=n+4|0;r=c[j+((a[p>>0]|0)+-48<<3)>>2]|0;break}if(f){m=-1;break a}if(M){n=(c[g>>2]|0)+(4-1)&~(4-1);r=c[n>>2]|0;c[g>>2]=n+4;n=p}else{n=p;r=0}}else r=-1;while(0);t=0;while(1){o=(a[n>>0]|0)+-65|0;if(o>>>0>57){m=-1;break a}p=n+1|0;o=a[15953+(t*58|0)+o>>0]|0;s=o&255;if((s+-1|0)>>>0<8){n=p;t=s}else{J=p;break}}if(!(o<<24>>24)){m=-1;break}p=(u|0)>-1;do if(o<<24>>24==19)if(p){m=-1;break a}else L=52;else{if(p){c[l+(u<<2)>>2]=s;H=j+(u<<3)|0;I=c[H+4>>2]|0;L=ba;c[L>>2]=c[H>>2];c[L+4>>2]=I;L=52;break}if(!M){m=0;break a}Rj(ba,s,g)}while(0);if((L|0)==52?(L=0,!M):0){w=J;n=y;continue}u=a[n>>0]|0;u=(t|0)!=0&(u&15|0)==3?u&-33:u;p=x&-65537;I=(x&8192|0)==0?x:p;f:do switch(u|0){case 110:switch(t|0){case 0:{c[c[ba>>2]>>2]=m;w=J;n=y;continue a}case 1:{c[c[ba>>2]>>2]=m;w=J;n=y;continue a}case 2:{w=c[ba>>2]|0;c[w>>2]=m;c[w+4>>2]=((m|0)<0)<<31>>31;w=J;n=y;continue a}case 3:{b[c[ba>>2]>>1]=m;w=J;n=y;continue a}case 4:{a[c[ba>>2]>>0]=m;w=J;n=y;continue a}case 6:{c[c[ba>>2]>>2]=m;w=J;n=y;continue a}case 7:{w=c[ba>>2]|0;c[w>>2]=m;c[w+4>>2]=((m|0)<0)<<31>>31;w=J;n=y;continue a}default:{w=J;n=y;continue a}}case 112:{t=I|8;r=r>>>0>8?r:8;u=120;L=64;break}case 88:case 120:{t=I;L=64;break}case 111:{p=ba;o=c[p>>2]|0;p=c[p+4>>2]|0;if((o|0)==0&(p|0)==0)n=N;else{n=N;do{n=n+-1|0;a[n>>0]=o&7|48;o=hk(o|0,p|0,3)|0;p=D}while(!((o|0)==0&(p|0)==0))}if(!(I&8)){o=I;t=0;s=16433;L=77}else{t=U-n+1|0;o=I;r=(r|0)<(t|0)?t:r;t=0;s=16433;L=77}break}case 105:case 100:{o=ba;n=c[o>>2]|0;o=c[o+4>>2]|0;if((o|0)<0){n=dk(0,0,n|0,o|0)|0;o=D;p=ba;c[p>>2]=n;c[p+4>>2]=o;p=1;s=16433;L=76;break f}if(!(I&2048)){s=I&1;p=s;s=(s|0)==0?16433:16435;L=76}else{p=1;s=16434;L=76}break}case 117:{o=ba;n=c[o>>2]|0;o=c[o+4>>2]|0;p=0;s=16433;L=76;break}case 99:{a[V>>0]=c[ba>>2];w=V;o=1;t=0;u=16433;n=N;break}case 109:{n=ri(c[(qi()|0)>>2]|0)|0;L=82;break}case 115:{n=c[ba>>2]|0;n=(n|0)!=0?n:16443;L=82;break}case 67:{c[ga>>2]=c[ba>>2];c[W>>2]=0;c[ba>>2]=ga;r=-1;L=86;break}case 83:{if(!r){Tj(e,32,K,0,I);n=0;L=98}else L=86;break}case 65:case 71:case 70:case 69:case 97:case 103:case 102:case 101:{q=+h[ba>>3];c[ea>>2]=0;h[k>>3]=q;if((c[k+4>>2]|0)>=0)if(!(I&2048)){H=I&1;G=H;H=(H|0)==0?16451:16456}else{G=1;H=16453}else{q=-q;G=1;H=16450}h[k>>3]=q;F=c[k+4>>2]&2146435072;do if(F>>>0<2146435072|(F|0)==2146435072&0<0){v=+Ci(q,ea)*2.0;o=v!=0.0;if(o)c[ea>>2]=(c[ea>>2]|0)+-1;C=u|32;if((C|0)==97){w=u&32;y=(w|0)==0?H:H+9|0;x=G|2;n=12-r|0;do if(!(r>>>0>11|(n|0)==0)){q=8.0;do{n=n+-1|0;q=q*16.0}while((n|0)!=0);if((a[y>>0]|0)==45){q=-(q+(-v-q));break}else{q=v+q-q;break}}else q=v;while(0);o=c[ea>>2]|0;n=(o|0)<0?0-o|0:o;n=Sj(n,((n|0)<0)<<31>>31,X)|0;if((n|0)==(X|0)){a[Y>>0]=48;n=Y}a[n+-1>>0]=(o>>31&2)+43;t=n+-2|0;a[t>>0]=u+15;s=(r|0)<1;p=(I&8|0)==0;o=da;while(1){H=~~q;n=o+1|0;a[o>>0]=d[16417+H>>0]|w;q=(q-+(H|0))*16.0;do if((n-Z|0)==1){if(p&(s&q==0.0))break;a[n>>0]=46;n=o+2|0}while(0);if(!(q!=0.0))break;else o=n}r=(r|0)!=0&(O+n|0)<(r|0)?P+r-t|0:aa-t+n|0;p=r+x|0;Tj(e,32,K,p,I);if(!(c[e>>2]&32))hj(y,x,e)|0;Tj(e,48,K,p,I^65536);n=n-Z|0;if(!(c[e>>2]&32))hj(da,n,e)|0;o=_-t|0;Tj(e,48,r-(n+o)|0,0,0);if(!(c[e>>2]&32))hj(t,o,e)|0;Tj(e,32,K,p,I^8192);n=(p|0)<(K|0)?K:p;break}n=(r|0)<0?6:r;if(o){o=(c[ea>>2]|0)+-28|0;c[ea>>2]=o;q=v*268435456.0}else{q=v;o=c[ea>>2]|0}F=(o|0)<0?ca:Q;E=F;o=F;do{B=~~q>>>0;c[o>>2]=B;o=o+4|0;q=(q-+(B>>>0))*1.0e9}while(q!=0.0);p=o;o=c[ea>>2]|0;if((o|0)>0){s=F;while(1){t=(o|0)>29?29:o;r=p+-4|0;do if(r>>>0<s>>>0)r=s;else{o=0;do{B=fk(c[r>>2]|0,0,t|0)|0;B=gk(B|0,D|0,o|0,0)|0;o=D;A=qk(B|0,o|0,1e9,0)|0;c[r>>2]=A;o=pk(B|0,o|0,1e9,0)|0;r=r+-4|0}while(r>>>0>=s>>>0);if(!o){r=s;break}r=s+-4|0;c[r>>2]=o}while(0);while(1){if(p>>>0<=r>>>0)break;o=p+-4|0;if(!(c[o>>2]|0))p=o;else break}o=(c[ea>>2]|0)-t|0;c[ea>>2]=o;if((o|0)>0)s=r;else break}}else r=F;if((o|0)<0){y=((n+25|0)/9|0)+1|0;z=(C|0)==102;w=r;while(1){x=0-o|0;x=(x|0)>9?9:x;do if(w>>>0<p>>>0){o=(1<<x)+-1|0;s=1e9>>>x;r=0;t=w;do{B=c[t>>2]|0;c[t>>2]=(B>>>x)+r;r=$(B&o,s)|0;t=t+4|0}while(t>>>0<p>>>0);o=(c[w>>2]|0)==0?w+4|0:w;if(!r){r=o;break}c[p>>2]=r;r=o;p=p+4|0}else r=(c[w>>2]|0)==0?w+4|0:w;while(0);o=z?F:r;p=(p-o>>2|0)>(y|0)?o+(y<<2)|0:p;o=(c[ea>>2]|0)+x|0;c[ea>>2]=o;if((o|0)>=0){w=r;break}else w=r}}else w=r;do if(w>>>0<p>>>0){o=(E-w>>2)*9|0;s=c[w>>2]|0;if(s>>>0<10)break;else r=10;do{r=r*10|0;o=o+1|0}while(s>>>0>=r>>>0)}else o=0;while(0);A=(C|0)==103;B=(n|0)!=0;r=n-((C|0)!=102?o:0)+((B&A)<<31>>31)|0;if((r|0)<(((p-E>>2)*9|0)+-9|0)){t=r+9216|0;z=(t|0)/9|0;r=F+(z+-1023<<2)|0;t=((t|0)%9|0)+1|0;if((t|0)<9){s=10;do{s=s*10|0;t=t+1|0}while((t|0)!=9)}else s=10;x=c[r>>2]|0;y=(x>>>0)%(s>>>0)|0;if((y|0)==0?(F+(z+-1022<<2)|0)==(p|0):0)s=w;else L=163;do if((L|0)==163){L=0;v=(((x>>>0)/(s>>>0)|0)&1|0)==0?9007199254740992.0:9007199254740994.0;t=(s|0)/2|0;do if(y>>>0<t>>>0)q=.5;else{if((y|0)==(t|0)?(F+(z+-1022<<2)|0)==(p|0):0){q=1.0;break}q=1.5}while(0);do if(G){if((a[H>>0]|0)!=45)break;v=-v;q=-q}while(0);t=x-y|0;c[r>>2]=t;if(!(v+q!=v)){s=w;break}C=t+s|0;c[r>>2]=C;if(C>>>0>999999999){o=w;while(1){s=r+-4|0;c[r>>2]=0;if(s>>>0<o>>>0){o=o+-4|0;c[o>>2]=0}C=(c[s>>2]|0)+1|0;c[s>>2]=C;if(C>>>0>999999999)r=s;else{w=o;r=s;break}}}o=(E-w>>2)*9|0;t=c[w>>2]|0;if(t>>>0<10){s=w;break}else s=10;do{s=s*10|0;o=o+1|0}while(t>>>0>=s>>>0);s=w}while(0);C=r+4|0;w=s;p=p>>>0>C>>>0?C:p}y=0-o|0;while(1){if(p>>>0<=w>>>0){z=0;C=p;break}r=p+-4|0;if(!(c[r>>2]|0))p=r;else{z=1;C=p;break}}do if(A){n=(B&1^1)+n|0;if((n|0)>(o|0)&(o|0)>-5){u=u+-1|0;n=n+-1-o|0}else{u=u+-2|0;n=n+-1|0}p=I&8;if(p)break;do if(z){p=c[C+-4>>2]|0;if(!p){r=9;break}if(!((p>>>0)%10|0)){s=10;r=0}else{r=0;break}do{s=s*10|0;r=r+1|0}while(((p>>>0)%(s>>>0)|0|0)==0)}else r=9;while(0);p=((C-E>>2)*9|0)+-9|0;if((u|32|0)==102){p=p-r|0;p=(p|0)<0?0:p;n=(n|0)<(p|0)?n:p;p=0;break}else{p=p+o-r|0;p=(p|0)<0?0:p;n=(n|0)<(p|0)?n:p;p=0;break}}else p=I&8;while(0);x=n|p;s=(x|0)!=0&1;t=(u|32|0)==102;if(t){o=(o|0)>0?o:0;u=0}else{r=(o|0)<0?y:o;r=Sj(r,((r|0)<0)<<31>>31,X)|0;if((_-r|0)<2)do{r=r+-1|0;a[r>>0]=48}while((_-r|0)<2);a[r+-1>>0]=(o>>31&2)+43;E=r+-2|0;a[E>>0]=u;o=_-E|0;u=E}y=G+1+n+s+o|0;Tj(e,32,K,y,I);if(!(c[e>>2]&32))hj(H,G,e)|0;Tj(e,48,K,y,I^65536);do if(t){r=w>>>0>F>>>0?F:w;o=r;do{p=Sj(c[o>>2]|0,0,R)|0;do if((o|0)==(r|0)){if((p|0)!=(R|0))break;a[T>>0]=48;p=T}else{if(p>>>0<=da>>>0)break;do{p=p+-1|0;a[p>>0]=48}while(p>>>0>da>>>0)}while(0);if(!(c[e>>2]&32))hj(p,S-p|0,e)|0;o=o+4|0}while(o>>>0<=F>>>0);do if(x){if(c[e>>2]&32)break;hj(16485,1,e)|0}while(0);if((n|0)>0&o>>>0<C>>>0){p=o;while(1){o=Sj(c[p>>2]|0,0,R)|0;if(o>>>0>da>>>0)do{o=o+-1|0;a[o>>0]=48}while(o>>>0>da>>>0);if(!(c[e>>2]&32))hj(o,(n|0)>9?9:n,e)|0;p=p+4|0;o=n+-9|0;if(!((n|0)>9&p>>>0<C>>>0)){n=o;break}else n=o}}Tj(e,48,n+9|0,9,0)}else{t=z?C:w+4|0;if((n|0)>-1){s=(p|0)==0;r=w;do{o=Sj(c[r>>2]|0,0,R)|0;if((o|0)==(R|0)){a[T>>0]=48;o=T}do if((r|0)==(w|0)){p=o+1|0;if(!(c[e>>2]&32))hj(o,1,e)|0;if(s&(n|0)<1){o=p;break}if(c[e>>2]&32){o=p;break}hj(16485,1,e)|0;o=p}else{if(o>>>0<=da>>>0)break;do{o=o+-1|0;a[o>>0]=48}while(o>>>0>da>>>0)}while(0);p=S-o|0;if(!(c[e>>2]&32))hj(o,(n|0)>(p|0)?p:n,e)|0;n=n-p|0;r=r+4|0}while(r>>>0<t>>>0&(n|0)>-1)}Tj(e,48,n+18|0,18,0);if(c[e>>2]&32)break;hj(u,_-u|0,e)|0}while(0);Tj(e,32,K,y,I^8192);n=(y|0)<(K|0)?K:y}else{t=(u&32|0)!=0;s=q!=q|0.0!=0.0;o=s?0:G;r=o+3|0;Tj(e,32,K,r,p);n=c[e>>2]|0;if(!(n&32)){hj(H,o,e)|0;n=c[e>>2]|0}if(!(n&32))hj(s?(t?16477:16481):t?16469:16473,3,e)|0;Tj(e,32,K,r,I^8192);n=(r|0)<(K|0)?K:r}while(0);w=J;continue a}default:{p=I;o=r;t=0;u=16433;n=N}}while(0);g:do if((L|0)==64){p=ba;o=c[p>>2]|0;p=c[p+4>>2]|0;s=u&32;if(!((o|0)==0&(p|0)==0)){n=N;do{n=n+-1|0;a[n>>0]=d[16417+(o&15)>>0]|s;o=hk(o|0,p|0,4)|0;p=D}while(!((o|0)==0&(p|0)==0));L=ba;if((t&8|0)==0|(c[L>>2]|0)==0&(c[L+4>>2]|0)==0){o=t;t=0;s=16433;L=77}else{o=t;t=2;s=16433+(u>>4)|0;L=77}}else{n=N;o=t;t=0;s=16433;L=77}}else if((L|0)==76){n=Sj(n,o,N)|0;o=I;t=p;L=77}else if((L|0)==82){L=0;I=sj(n,0,r)|0;H=(I|0)==0;w=n;o=H?r:I-n|0;t=0;u=16433;n=H?n+r|0:I}else if((L|0)==86){L=0;o=0;n=0;s=c[ba>>2]|0;while(1){p=c[s>>2]|0;if(!p)break;n=Ii(fa,p)|0;if((n|0)<0|n>>>0>(r-o|0)>>>0)break;o=n+o|0;if(r>>>0>o>>>0)s=s+4|0;else break}if((n|0)<0){m=-1;break a}Tj(e,32,K,o,I);if(!o){n=0;L=98}else{p=0;r=c[ba>>2]|0;while(1){n=c[r>>2]|0;if(!n){n=o;L=98;break g}n=Ii(fa,n)|0;p=n+p|0;if((p|0)>(o|0)){n=o;L=98;break g}if(!(c[e>>2]&32))hj(fa,n,e)|0;if(p>>>0>=o>>>0){n=o;L=98;break}else r=r+4|0}}}while(0);if((L|0)==98){L=0;Tj(e,32,K,n,I^8192);w=J;n=(K|0)>(n|0)?K:n;continue}if((L|0)==77){L=0;p=(r|0)>-1?o&-65537:o;o=ba;o=(c[o>>2]|0)!=0|(c[o+4>>2]|0)!=0;if((r|0)!=0|o){o=(o&1^1)+(U-n)|0;w=n;o=(r|0)>(o|0)?r:o;u=s;n=N}else{w=N;o=0;u=s;n=N}}s=n-w|0;o=(o|0)<(s|0)?s:o;r=t+o|0;n=(K|0)<(r|0)?r:K;Tj(e,32,n,r,p);if(!(c[e>>2]&32))hj(u,t,e)|0;Tj(e,48,n,r,p^65536);Tj(e,48,o,s,0);if(!(c[e>>2]&32))hj(w,s,e)|0;Tj(e,32,n,r,p^8192);w=J}h:do if((L|0)==245)if(!e)if(f){m=1;while(1){f=c[l+(m<<2)>>2]|0;if(!f)break;Rj(j+(m<<3)|0,f,g);m=m+1|0;if((m|0)>=10){m=1;break h}}if((m|0)<10)while(1){if(c[l+(m<<2)>>2]|0){m=-1;break h}m=m+1|0;if((m|0)>=10){m=1;break}}else m=1}else m=0;while(0);i=ha;return m|0}function Mj(a,b,c){a=a|0;b=b|0;c=c|0;return Si(a,b,c)|0}function Nj(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;p=i;i=i+240|0;o=p;c[o>>2]=a;a:do if((e|0)>1){n=0-b|0;g=e;h=a;k=a;l=1;while(1){a=h+n|0;m=g+-2|0;j=h+(0-((c[f+(m<<2)>>2]|0)+b))|0;if((cc[d&15](k,j)|0)>-1?(cc[d&15](k,a)|0)>-1:0){e=l;break a}e=l+1|0;h=o+(l<<2)|0;if((cc[d&15](j,a)|0)>-1){c[h>>2]=j;a=j;g=g+-1|0}else{c[h>>2]=a;g=m}if((g|0)<=1)break a;h=a;k=c[o>>2]|0;l=e}}else e=1;while(0);Pj(b,o,e);i=p;return}function Oj(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;r=i;i=i+240|0;p=r;k=c[e>>2]|0;e=c[e+4>>2]|0;c[p>>2]=a;o=0-b|0;a:do if((e|0)!=0|(k|0)!=1?(j=a+(0-(c[h+(f<<2)>>2]|0))|0,(cc[d&15](j,a)|0)>=1):0){g=(g|0)==0;n=j;l=k;m=e;j=1;while(1){if(g&(f|0)>1){e=c[h+(f+-2<<2)>>2]|0;if((cc[d&15](a+o|0,n)|0)>-1){g=f;e=j;q=20;break a}if((cc[d&15](a+(0-(e+b))|0,n)|0)>-1){g=f;e=j;q=20;break a}}e=j+1|0;c[p+(j<<2)>>2]=n;g=l+-1|0;do if(g){if(!(g&1)){a=g;g=0;do{g=g+1|0;a=a>>>1}while((a&1|0)==0);if(!g)q=11}else q=11;if((q|0)==11){q=0;if(!m){g=64;q=16;break}if(!(m&1)){a=m;g=0}else{k=0;a=l;j=m;g=0;break}while(1){j=g+1|0;a=a>>>1;if(a&1){a=j;break}else g=j}if(!a){k=0;a=l;j=m;g=0;break}else g=g+33|0}if(g>>>0>31)q=16;else{k=g;a=l;j=m}}else{g=32;q=16}while(0);if((q|0)==16){q=0;k=g+-32|0;a=m;j=0}l=j<<32-k|a>>>k;m=j>>>k;g=g+f|0;if(!((m|0)!=0|(l|0)!=1)){a=n;q=20;break a}a=n+(0-(c[h+(g<<2)>>2]|0))|0;if((cc[d&15](a,c[p>>2]|0)|0)<1){a=n;f=g;g=0;q=19;break}else{k=n;f=g;g=1;n=a;j=e;a=k}}}else{e=1;q=19}while(0);if((q|0)==19?(g|0)==0:0){g=f;q=20}if((q|0)==20){Pj(b,p,e);Nj(a,b,d,g,h)}i=r;return}function Pj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;h=i;i=i+256|0;e=h;a:do if((d|0)>=2?(g=b+(d<<2)|0,c[g>>2]=e,(a|0)!=0):0)while(1){f=a>>>0>256?256:a;ik(e|0,c[b>>2]|0,f|0)|0;e=0;do{j=b+(e<<2)|0;e=e+1|0;ik(c[j>>2]|0,c[b+(e<<2)>>2]|0,f|0)|0;c[j>>2]=(c[j>>2]|0)+f}while((e|0)!=(d|0));if((a|0)==(f|0))break a;a=a-f|0;e=c[g>>2]|0}while(0);i=h;return}function Qj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e=a+20|0;f=c[e>>2]|0;a=(c[a+16>>2]|0)-f|0;a=a>>>0>d>>>0?d:a;ik(f|0,b|0,a|0)|0;c[e>>2]=(c[e>>2]|0)+a;return d|0}function Rj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0.0;a:do if(b>>>0<=20)do switch(b|0){case 9:{e=(c[d>>2]|0)+(4-1)&~(4-1);b=c[e>>2]|0;c[d>>2]=e+4;c[a>>2]=b;break a}case 10:{e=(c[d>>2]|0)+(4-1)&~(4-1);b=c[e>>2]|0;c[d>>2]=e+4;e=a;c[e>>2]=b;c[e+4>>2]=((b|0)<0)<<31>>31;break a}case 11:{e=(c[d>>2]|0)+(4-1)&~(4-1);b=c[e>>2]|0;c[d>>2]=e+4;e=a;c[e>>2]=b;c[e+4>>2]=0;break a}case 12:{e=(c[d>>2]|0)+(8-1)&~(8-1);b=e;f=c[b>>2]|0;b=c[b+4>>2]|0;c[d>>2]=e+8;e=a;c[e>>2]=f;c[e+4>>2]=b;break a}case 13:{f=(c[d>>2]|0)+(4-1)&~(4-1);e=c[f>>2]|0;c[d>>2]=f+4;e=(e&65535)<<16>>16;f=a;c[f>>2]=e;c[f+4>>2]=((e|0)<0)<<31>>31;break a}case 14:{f=(c[d>>2]|0)+(4-1)&~(4-1);e=c[f>>2]|0;c[d>>2]=f+4;f=a;c[f>>2]=e&65535;c[f+4>>2]=0;break a}case 15:{f=(c[d>>2]|0)+(4-1)&~(4-1);e=c[f>>2]|0;c[d>>2]=f+4;e=(e&255)<<24>>24;f=a;c[f>>2]=e;c[f+4>>2]=((e|0)<0)<<31>>31;break a}case 16:{f=(c[d>>2]|0)+(4-1)&~(4-1);e=c[f>>2]|0;c[d>>2]=f+4;f=a;c[f>>2]=e&255;c[f+4>>2]=0;break a}case 17:{f=(c[d>>2]|0)+(8-1)&~(8-1);g=+h[f>>3];c[d>>2]=f+8;h[a>>3]=g;break a}case 18:{f=(c[d>>2]|0)+(8-1)&~(8-1);g=+h[f>>3];c[d>>2]=f+8;h[a>>3]=g;break a}default:break a}while(0);while(0);return}function Sj(b,c,d){b=b|0;c=c|0;d=d|0;var e=0;if(c>>>0>0|(c|0)==0&b>>>0>4294967295)while(1){e=qk(b|0,c|0,10,0)|0;d=d+-1|0;a[d>>0]=e|48;e=pk(b|0,c|0,10,0)|0;if(c>>>0>9|(c|0)==9&b>>>0>4294967295){b=e;c=D}else{b=e;break}}if(b)while(1){d=d+-1|0;a[d>>0]=(b>>>0)%10|0|48;if(b>>>0<10)break;else b=(b>>>0)/10|0}return d|0}function Tj(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0;j=i;i=i+256|0;h=j;do if((d|0)>(e|0)&(f&73728|0)==0){f=d-e|0;ek(h|0,b|0,(f>>>0>256?256:f)|0)|0;b=c[a>>2]|0;g=(b&32|0)==0;if(f>>>0>255){e=d-e|0;do{if(g){hj(h,256,a)|0;b=c[a>>2]|0}f=f+-256|0;g=(b&32|0)==0}while(f>>>0>255);if(g)f=e&255;else break}else if(!g)break;hj(h,f,a)|0}while(0);i=j;return}function Uj(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;do if(a>>>0<245){o=a>>>0<11?16:a+11&-8;a=o>>>3;i=c[756]|0;d=i>>>a;if(d&3){a=(d&1^1)+a|0;e=a<<1;d=3064+(e<<2)|0;e=3064+(e+2<<2)|0;f=c[e>>2]|0;g=f+8|0;h=c[g>>2]|0;do if((d|0)!=(h|0)){if(h>>>0<(c[760]|0)>>>0)Da();b=h+12|0;if((c[b>>2]|0)==(f|0)){c[b>>2]=d;c[e>>2]=h;break}else Da()}else c[756]=i&~(1<<a);while(0);M=a<<3;c[f+4>>2]=M|3;M=f+(M|4)|0;c[M>>2]=c[M>>2]|1;M=g;return M|0}h=c[758]|0;if(o>>>0>h>>>0){if(d){e=2<<a;e=d<<a&(e|0-e);e=(e&0-e)+-1|0;j=e>>>12&16;e=e>>>j;f=e>>>5&8;e=e>>>f;g=e>>>2&4;e=e>>>g;d=e>>>1&2;e=e>>>d;a=e>>>1&1;a=(f|j|g|d|a)+(e>>>a)|0;e=a<<1;d=3064+(e<<2)|0;e=3064+(e+2<<2)|0;g=c[e>>2]|0;j=g+8|0;f=c[j>>2]|0;do if((d|0)!=(f|0)){if(f>>>0<(c[760]|0)>>>0)Da();b=f+12|0;if((c[b>>2]|0)==(g|0)){c[b>>2]=d;c[e>>2]=f;k=c[758]|0;break}else Da()}else{c[756]=i&~(1<<a);k=h}while(0);M=a<<3;h=M-o|0;c[g+4>>2]=o|3;i=g+o|0;c[g+(o|4)>>2]=h|1;c[g+M>>2]=h;if(k){f=c[761]|0;d=k>>>3;b=d<<1;e=3064+(b<<2)|0;a=c[756]|0;d=1<<d;if(a&d){a=3064+(b+2<<2)|0;b=c[a>>2]|0;if(b>>>0<(c[760]|0)>>>0)Da();else{l=a;m=b}}else{c[756]=a|d;l=3064+(b+2<<2)|0;m=e}c[l>>2]=f;c[m+12>>2]=f;c[f+8>>2]=m;c[f+12>>2]=e}c[758]=h;c[761]=i;M=j;return M|0}a=c[757]|0;if(a){d=(a&0-a)+-1|0;L=d>>>12&16;d=d>>>L;K=d>>>5&8;d=d>>>K;M=d>>>2&4;d=d>>>M;a=d>>>1&2;d=d>>>a;e=d>>>1&1;e=c[3328+((K|L|M|a|e)+(d>>>e)<<2)>>2]|0;d=(c[e+4>>2]&-8)-o|0;a=e;while(1){b=c[a+16>>2]|0;if(!b){b=c[a+20>>2]|0;if(!b){j=d;break}}a=(c[b+4>>2]&-8)-o|0;M=a>>>0<d>>>0;d=M?a:d;a=b;e=M?b:e}g=c[760]|0;if(e>>>0<g>>>0)Da();i=e+o|0;if(e>>>0>=i>>>0)Da();h=c[e+24>>2]|0;d=c[e+12>>2]|0;do if((d|0)==(e|0)){a=e+20|0;b=c[a>>2]|0;if(!b){a=e+16|0;b=c[a>>2]|0;if(!b){n=0;break}}while(1){d=b+20|0;f=c[d>>2]|0;if(f){b=f;a=d;continue}d=b+16|0;f=c[d>>2]|0;if(!f)break;else{b=f;a=d}}if(a>>>0<g>>>0)Da();else{c[a>>2]=0;n=b;break}}else{f=c[e+8>>2]|0;if(f>>>0<g>>>0)Da();b=f+12|0;if((c[b>>2]|0)!=(e|0))Da();a=d+8|0;if((c[a>>2]|0)==(e|0)){c[b>>2]=d;c[a>>2]=f;n=d;break}else Da()}while(0);do if(h){b=c[e+28>>2]|0;a=3328+(b<<2)|0;if((e|0)==(c[a>>2]|0)){c[a>>2]=n;if(!n){c[757]=c[757]&~(1<<b);break}}else{if(h>>>0<(c[760]|0)>>>0)Da();b=h+16|0;if((c[b>>2]|0)==(e|0))c[b>>2]=n;else c[h+20>>2]=n;if(!n)break}a=c[760]|0;if(n>>>0<a>>>0)Da();c[n+24>>2]=h;b=c[e+16>>2]|0;do if(b)if(b>>>0<a>>>0)Da();else{c[n+16>>2]=b;c[b+24>>2]=n;break}while(0);b=c[e+20>>2]|0;if(b)if(b>>>0<(c[760]|0)>>>0)Da();else{c[n+20>>2]=b;c[b+24>>2]=n;break}}while(0);if(j>>>0<16){M=j+o|0;c[e+4>>2]=M|3;M=e+(M+4)|0;c[M>>2]=c[M>>2]|1}else{c[e+4>>2]=o|3;c[e+(o|4)>>2]=j|1;c[e+(j+o)>>2]=j;b=c[758]|0;if(b){g=c[761]|0;d=b>>>3;b=d<<1;f=3064+(b<<2)|0;a=c[756]|0;d=1<<d;if(a&d){b=3064+(b+2<<2)|0;a=c[b>>2]|0;if(a>>>0<(c[760]|0)>>>0)Da();else{p=b;q=a}}else{c[756]=a|d;p=3064+(b+2<<2)|0;q=f}c[p>>2]=g;c[q+12>>2]=g;c[g+8>>2]=q;c[g+12>>2]=f}c[758]=j;c[761]=i}M=e+8|0;return M|0}else q=o}else q=o}else if(a>>>0<=4294967231){a=a+11|0;m=a&-8;l=c[757]|0;if(l){d=0-m|0;a=a>>>8;if(a)if(m>>>0>16777215)k=31;else{q=(a+1048320|0)>>>16&8;v=a<<q;p=(v+520192|0)>>>16&4;v=v<<p;k=(v+245760|0)>>>16&2;k=14-(p|q|k)+(v<<k>>>15)|0;k=m>>>(k+7|0)&1|k<<1}else k=0;a=c[3328+(k<<2)>>2]|0;a:do if(!a){f=0;a=0;v=86}else{h=d;f=0;i=m<<((k|0)==31?0:25-(k>>>1)|0);j=a;a=0;while(1){g=c[j+4>>2]&-8;d=g-m|0;if(d>>>0<h>>>0)if((g|0)==(m|0)){g=j;a=j;v=90;break a}else a=j;else d=h;v=c[j+20>>2]|0;j=c[j+16+(i>>>31<<2)>>2]|0;f=(v|0)==0|(v|0)==(j|0)?f:v;if(!j){v=86;break}else{h=d;i=i<<1}}}while(0);if((v|0)==86){if((f|0)==0&(a|0)==0){a=2<<k;a=l&(a|0-a);if(!a){q=m;break}a=(a&0-a)+-1|0;n=a>>>12&16;a=a>>>n;l=a>>>5&8;a=a>>>l;p=a>>>2&4;a=a>>>p;q=a>>>1&2;a=a>>>q;f=a>>>1&1;f=c[3328+((l|n|p|q|f)+(a>>>f)<<2)>>2]|0;a=0}if(!f){i=d;j=a}else{g=f;v=90}}if((v|0)==90)while(1){v=0;q=(c[g+4>>2]&-8)-m|0;f=q>>>0<d>>>0;d=f?q:d;a=f?g:a;f=c[g+16>>2]|0;if(f){g=f;v=90;continue}g=c[g+20>>2]|0;if(!g){i=d;j=a;break}else v=90}if((j|0)!=0?i>>>0<((c[758]|0)-m|0)>>>0:0){f=c[760]|0;if(j>>>0<f>>>0)Da();h=j+m|0;if(j>>>0>=h>>>0)Da();g=c[j+24>>2]|0;d=c[j+12>>2]|0;do if((d|0)==(j|0)){a=j+20|0;b=c[a>>2]|0;if(!b){a=j+16|0;b=c[a>>2]|0;if(!b){o=0;break}}while(1){d=b+20|0;e=c[d>>2]|0;if(e){b=e;a=d;continue}d=b+16|0;e=c[d>>2]|0;if(!e)break;else{b=e;a=d}}if(a>>>0<f>>>0)Da();else{c[a>>2]=0;o=b;break}}else{e=c[j+8>>2]|0;if(e>>>0<f>>>0)Da();b=e+12|0;if((c[b>>2]|0)!=(j|0))Da();a=d+8|0;if((c[a>>2]|0)==(j|0)){c[b>>2]=d;c[a>>2]=e;o=d;break}else Da()}while(0);do if(g){b=c[j+28>>2]|0;a=3328+(b<<2)|0;if((j|0)==(c[a>>2]|0)){c[a>>2]=o;if(!o){c[757]=c[757]&~(1<<b);break}}else{if(g>>>0<(c[760]|0)>>>0)Da();b=g+16|0;if((c[b>>2]|0)==(j|0))c[b>>2]=o;else c[g+20>>2]=o;if(!o)break}a=c[760]|0;if(o>>>0<a>>>0)Da();c[o+24>>2]=g;b=c[j+16>>2]|0;do if(b)if(b>>>0<a>>>0)Da();else{c[o+16>>2]=b;c[b+24>>2]=o;break}while(0);b=c[j+20>>2]|0;if(b)if(b>>>0<(c[760]|0)>>>0)Da();else{c[o+20>>2]=b;c[b+24>>2]=o;break}}while(0);b:do if(i>>>0>=16){c[j+4>>2]=m|3;c[j+(m|4)>>2]=i|1;c[j+(i+m)>>2]=i;b=i>>>3;if(i>>>0<256){a=b<<1;e=3064+(a<<2)|0;d=c[756]|0;b=1<<b;if(d&b){b=3064+(a+2<<2)|0;a=c[b>>2]|0;if(a>>>0<(c[760]|0)>>>0)Da();else{s=b;t=a}}else{c[756]=d|b;s=3064+(a+2<<2)|0;t=e}c[s>>2]=h;c[t+12>>2]=h;c[j+(m+8)>>2]=t;c[j+(m+12)>>2]=e;break}b=i>>>8;if(b)if(i>>>0>16777215)e=31;else{L=(b+1048320|0)>>>16&8;M=b<<L;K=(M+520192|0)>>>16&4;M=M<<K;e=(M+245760|0)>>>16&2;e=14-(K|L|e)+(M<<e>>>15)|0;e=i>>>(e+7|0)&1|e<<1}else e=0;b=3328+(e<<2)|0;c[j+(m+28)>>2]=e;c[j+(m+20)>>2]=0;c[j+(m+16)>>2]=0;a=c[757]|0;d=1<<e;if(!(a&d)){c[757]=a|d;c[b>>2]=h;c[j+(m+24)>>2]=b;c[j+(m+12)>>2]=h;c[j+(m+8)>>2]=h;break}b=c[b>>2]|0;c:do if((c[b+4>>2]&-8|0)!=(i|0)){e=i<<((e|0)==31?0:25-(e>>>1)|0);while(1){a=b+16+(e>>>31<<2)|0;d=c[a>>2]|0;if(!d)break;if((c[d+4>>2]&-8|0)==(i|0)){y=d;break c}else{e=e<<1;b=d}}if(a>>>0<(c[760]|0)>>>0)Da();else{c[a>>2]=h;c[j+(m+24)>>2]=b;c[j+(m+12)>>2]=h;c[j+(m+8)>>2]=h;break b}}else y=b;while(0);b=y+8|0;a=c[b>>2]|0;M=c[760]|0;if(a>>>0>=M>>>0&y>>>0>=M>>>0){c[a+12>>2]=h;c[b>>2]=h;c[j+(m+8)>>2]=a;c[j+(m+12)>>2]=y;c[j+(m+24)>>2]=0;break}else Da()}else{M=i+m|0;c[j+4>>2]=M|3;M=j+(M+4)|0;c[M>>2]=c[M>>2]|1}while(0);M=j+8|0;return M|0}else q=m}else q=m}else q=-1;while(0);d=c[758]|0;if(d>>>0>=q>>>0){b=d-q|0;a=c[761]|0;if(b>>>0>15){c[761]=a+q;c[758]=b;c[a+(q+4)>>2]=b|1;c[a+d>>2]=b;c[a+4>>2]=q|3}else{c[758]=0;c[761]=0;c[a+4>>2]=d|3;M=a+(d+4)|0;c[M>>2]=c[M>>2]|1}M=a+8|0;return M|0}a=c[759]|0;if(a>>>0>q>>>0){L=a-q|0;c[759]=L;M=c[762]|0;c[762]=M+q;c[M+(q+4)>>2]=L|1;c[M+4>>2]=q|3;M=M+8|0;return M|0}do if(!(c[874]|0)){a=$a(30)|0;if(!(a+-1&a)){c[876]=a;c[875]=a;c[877]=-1;c[878]=-1;c[879]=0;c[867]=0;c[874]=(Db(0)|0)&-16^1431655768;break}else Da()}while(0);j=q+48|0;i=c[876]|0;k=q+47|0;h=i+k|0;i=0-i|0;l=h&i;if(l>>>0<=q>>>0){M=0;return M|0}a=c[866]|0;if((a|0)!=0?(t=c[864]|0,y=t+l|0,y>>>0<=t>>>0|y>>>0>a>>>0):0){M=0;return M|0}d:do if(!(c[867]&4)){a=c[762]|0;e:do if(a){f=3472;while(1){d=c[f>>2]|0;if(d>>>0<=a>>>0?(r=f+4|0,(d+(c[r>>2]|0)|0)>>>0>a>>>0):0){g=f;a=r;break}f=c[f+8>>2]|0;if(!f){v=174;break e}}d=h-(c[759]|0)&i;if(d>>>0<2147483647){f=Ua(d|0)|0;y=(f|0)==((c[g>>2]|0)+(c[a>>2]|0)|0);a=y?d:0;if(y){if((f|0)!=(-1|0)){w=f;p=a;v=194;break d}}else v=184}else a=0}else v=174;while(0);do if((v|0)==174){g=Ua(0)|0;if((g|0)!=(-1|0)){a=g;d=c[875]|0;f=d+-1|0;if(!(f&a))d=l;else d=l-a+(f+a&0-d)|0;a=c[864]|0;f=a+d|0;if(d>>>0>q>>>0&d>>>0<2147483647){y=c[866]|0;if((y|0)!=0?f>>>0<=a>>>0|f>>>0>y>>>0:0){a=0;break}f=Ua(d|0)|0;y=(f|0)==(g|0);a=y?d:0;if(y){w=g;p=a;v=194;break d}else v=184}else a=0}else a=0}while(0);f:do if((v|0)==184){g=0-d|0;do if(j>>>0>d>>>0&(d>>>0<2147483647&(f|0)!=(-1|0))?(u=c[876]|0,u=k-d+u&0-u,u>>>0<2147483647):0)if((Ua(u|0)|0)==(-1|0)){Ua(g|0)|0;break f}else{d=u+d|0;break}while(0);if((f|0)!=(-1|0)){w=f;p=d;v=194;break d}}while(0);c[867]=c[867]|4;v=191}else{a=0;v=191}while(0);if((((v|0)==191?l>>>0<2147483647:0)?(w=Ua(l|0)|0,x=Ua(0)|0,w>>>0<x>>>0&((w|0)!=(-1|0)&(x|0)!=(-1|0))):0)?(z=x-w|0,A=z>>>0>(q+40|0)>>>0,A):0){p=A?z:a;v=194}if((v|0)==194){a=(c[864]|0)+p|0;c[864]=a;if(a>>>0>(c[865]|0)>>>0)c[865]=a;h=c[762]|0;g:do if(h){g=3472;do{a=c[g>>2]|0;d=g+4|0;f=c[d>>2]|0;if((w|0)==(a+f|0)){B=a;C=d;D=f;E=g;v=204;break}g=c[g+8>>2]|0}while((g|0)!=0);if(((v|0)==204?(c[E+12>>2]&8|0)==0:0)?h>>>0<w>>>0&h>>>0>=B>>>0:0){c[C>>2]=D+p;M=(c[759]|0)+p|0;L=h+8|0;L=(L&7|0)==0?0:0-L&7;K=M-L|0;c[762]=h+L;c[759]=K;c[h+(L+4)>>2]=K|1;c[h+(M+4)>>2]=40;c[763]=c[878];break}a=c[760]|0;if(w>>>0<a>>>0){c[760]=w;a=w}d=w+p|0;g=3472;while(1){if((c[g>>2]|0)==(d|0)){f=g;d=g;v=212;break}g=c[g+8>>2]|0;if(!g){d=3472;break}}if((v|0)==212)if(!(c[d+12>>2]&8)){c[f>>2]=w;n=d+4|0;c[n>>2]=(c[n>>2]|0)+p;n=w+8|0;n=(n&7|0)==0?0:0-n&7;k=w+(p+8)|0;k=(k&7|0)==0?0:0-k&7;b=w+(k+p)|0;m=n+q|0;o=w+m|0;l=b-(w+n)-q|0;c[w+(n+4)>>2]=q|3;h:do if((b|0)!=(h|0)){if((b|0)==(c[761]|0)){M=(c[758]|0)+l|0;c[758]=M;c[761]=o;c[w+(m+4)>>2]=M|1;c[w+(M+m)>>2]=M;break}i=p+4|0;d=c[w+(i+k)>>2]|0;if((d&3|0)==1){j=d&-8;g=d>>>3;i:do if(d>>>0>=256){h=c[w+((k|24)+p)>>2]|0;e=c[w+(p+12+k)>>2]|0;do if((e|0)==(b|0)){f=k|16;e=w+(i+f)|0;d=c[e>>2]|0;if(!d){e=w+(f+p)|0;d=c[e>>2]|0;if(!d){J=0;break}}while(1){f=d+20|0;g=c[f>>2]|0;if(g){d=g;e=f;continue}f=d+16|0;g=c[f>>2]|0;if(!g)break;else{d=g;e=f}}if(e>>>0<a>>>0)Da();else{c[e>>2]=0;J=d;break}}else{f=c[w+((k|8)+p)>>2]|0;if(f>>>0<a>>>0)Da();a=f+12|0;if((c[a>>2]|0)!=(b|0))Da();d=e+8|0;if((c[d>>2]|0)==(b|0)){c[a>>2]=e;c[d>>2]=f;J=e;break}else Da()}while(0);if(!h)break;a=c[w+(p+28+k)>>2]|0;d=3328+(a<<2)|0;do if((b|0)!=(c[d>>2]|0)){if(h>>>0<(c[760]|0)>>>0)Da();a=h+16|0;if((c[a>>2]|0)==(b|0))c[a>>2]=J;else c[h+20>>2]=J;if(!J)break i}else{c[d>>2]=J;if(J)break;c[757]=c[757]&~(1<<a);break i}while(0);d=c[760]|0;if(J>>>0<d>>>0)Da();c[J+24>>2]=h;b=k|16;a=c[w+(b+p)>>2]|0;do if(a)if(a>>>0<d>>>0)Da();else{c[J+16>>2]=a;c[a+24>>2]=J;break}while(0);b=c[w+(i+b)>>2]|0;if(!b)break;if(b>>>0<(c[760]|0)>>>0)Da();else{c[J+20>>2]=b;c[b+24>>2]=J;break}}else{e=c[w+((k|8)+p)>>2]|0;f=c[w+(p+12+k)>>2]|0;d=3064+(g<<1<<2)|0;do if((e|0)!=(d|0)){if(e>>>0<a>>>0)Da();if((c[e+12>>2]|0)==(b|0))break;Da()}while(0);if((f|0)==(e|0)){c[756]=c[756]&~(1<<g);break}do if((f|0)==(d|0))F=f+8|0;else{if(f>>>0<a>>>0)Da();a=f+8|0;if((c[a>>2]|0)==(b|0)){F=a;break}Da()}while(0);c[e+12>>2]=f;c[F>>2]=e}while(0);b=w+((j|k)+p)|0;f=j+l|0}else f=l;b=b+4|0;c[b>>2]=c[b>>2]&-2;c[w+(m+4)>>2]=f|1;c[w+(f+m)>>2]=f;b=f>>>3;if(f>>>0<256){a=b<<1;e=3064+(a<<2)|0;d=c[756]|0;b=1<<b;do if(!(d&b)){c[756]=d|b;K=3064+(a+2<<2)|0;L=e}else{b=3064+(a+2<<2)|0;a=c[b>>2]|0;if(a>>>0>=(c[760]|0)>>>0){K=b;L=a;break}Da()}while(0);c[K>>2]=o;c[L+12>>2]=o;c[w+(m+8)>>2]=L;c[w+(m+12)>>2]=e;break}b=f>>>8;do if(!b)e=0;else{if(f>>>0>16777215){e=31;break}K=(b+1048320|0)>>>16&8;L=b<<K;J=(L+520192|0)>>>16&4;L=L<<J;e=(L+245760|0)>>>16&2;e=14-(J|K|e)+(L<<e>>>15)|0;e=f>>>(e+7|0)&1|e<<1}while(0);b=3328+(e<<2)|0;c[w+(m+28)>>2]=e;c[w+(m+20)>>2]=0;c[w+(m+16)>>2]=0;a=c[757]|0;d=1<<e;if(!(a&d)){c[757]=a|d;c[b>>2]=o;c[w+(m+24)>>2]=b;c[w+(m+12)>>2]=o;c[w+(m+8)>>2]=o;break}b=c[b>>2]|0;j:do if((c[b+4>>2]&-8|0)!=(f|0)){e=f<<((e|0)==31?0:25-(e>>>1)|0);while(1){a=b+16+(e>>>31<<2)|0;d=c[a>>2]|0;if(!d)break;if((c[d+4>>2]&-8|0)==(f|0)){M=d;break j}else{e=e<<1;b=d}}if(a>>>0<(c[760]|0)>>>0)Da();else{c[a>>2]=o;c[w+(m+24)>>2]=b;c[w+(m+12)>>2]=o;c[w+(m+8)>>2]=o;break h}}else M=b;while(0);b=M+8|0;a=c[b>>2]|0;L=c[760]|0;if(a>>>0>=L>>>0&M>>>0>=L>>>0){c[a+12>>2]=o;c[b>>2]=o;c[w+(m+8)>>2]=a;c[w+(m+12)>>2]=M;c[w+(m+24)>>2]=0;break}else Da()}else{M=(c[759]|0)+l|0;c[759]=M;c[762]=o;c[w+(m+4)>>2]=M|1}while(0);M=w+(n|8)|0;return M|0}else d=3472;while(1){a=c[d>>2]|0;if(a>>>0<=h>>>0?(b=c[d+4>>2]|0,e=a+b|0,e>>>0>h>>>0):0)break;d=c[d+8>>2]|0}f=a+(b+-39)|0;a=a+(b+-47+((f&7|0)==0?0:0-f&7))|0;f=h+16|0;a=a>>>0<f>>>0?h:a;b=a+8|0;d=w+8|0;d=(d&7|0)==0?0:0-d&7;M=p+-40-d|0;c[762]=w+d;c[759]=M;c[w+(d+4)>>2]=M|1;c[w+(p+-36)>>2]=40;c[763]=c[878];d=a+4|0;c[d>>2]=27;c[b>>2]=c[868];c[b+4>>2]=c[869];c[b+8>>2]=c[870];c[b+12>>2]=c[871];c[868]=w;c[869]=p;c[871]=0;c[870]=b;b=a+28|0;c[b>>2]=7;if((a+32|0)>>>0<e>>>0)do{M=b;b=b+4|0;c[b>>2]=7}while((M+8|0)>>>0<e>>>0);if((a|0)!=(h|0)){g=a-h|0;c[d>>2]=c[d>>2]&-2;c[h+4>>2]=g|1;c[a>>2]=g;b=g>>>3;if(g>>>0<256){a=b<<1;e=3064+(a<<2)|0;d=c[756]|0;b=1<<b;if(d&b){b=3064+(a+2<<2)|0;a=c[b>>2]|0;if(a>>>0<(c[760]|0)>>>0)Da();else{G=b;H=a}}else{c[756]=d|b;G=3064+(a+2<<2)|0;H=e}c[G>>2]=h;c[H+12>>2]=h;c[h+8>>2]=H;c[h+12>>2]=e;break}b=g>>>8;if(b)if(g>>>0>16777215)e=31;else{L=(b+1048320|0)>>>16&8;M=b<<L;K=(M+520192|0)>>>16&4;M=M<<K;e=(M+245760|0)>>>16&2;e=14-(K|L|e)+(M<<e>>>15)|0;e=g>>>(e+7|0)&1|e<<1}else e=0;d=3328+(e<<2)|0;c[h+28>>2]=e;c[h+20>>2]=0;c[f>>2]=0;b=c[757]|0;a=1<<e;if(!(b&a)){c[757]=b|a;c[d>>2]=h;c[h+24>>2]=d;c[h+12>>2]=h;c[h+8>>2]=h;break}b=c[d>>2]|0;k:do if((c[b+4>>2]&-8|0)!=(g|0)){e=g<<((e|0)==31?0:25-(e>>>1)|0);while(1){a=b+16+(e>>>31<<2)|0;d=c[a>>2]|0;if(!d)break;if((c[d+4>>2]&-8|0)==(g|0)){I=d;break k}else{e=e<<1;b=d}}if(a>>>0<(c[760]|0)>>>0)Da();else{c[a>>2]=h;c[h+24>>2]=b;c[h+12>>2]=h;c[h+8>>2]=h;break g}}else I=b;while(0);b=I+8|0;a=c[b>>2]|0;M=c[760]|0;if(a>>>0>=M>>>0&I>>>0>=M>>>0){c[a+12>>2]=h;c[b>>2]=h;c[h+8>>2]=a;c[h+12>>2]=I;c[h+24>>2]=0;break}else Da()}}else{M=c[760]|0;if((M|0)==0|w>>>0<M>>>0)c[760]=w;c[868]=w;c[869]=p;c[871]=0;c[765]=c[874];c[764]=-1;b=0;do{M=b<<1;L=3064+(M<<2)|0;c[3064+(M+3<<2)>>2]=L;c[3064+(M+2<<2)>>2]=L;b=b+1|0}while((b|0)!=32);M=w+8|0;M=(M&7|0)==0?0:0-M&7;L=p+-40-M|0;c[762]=w+M;c[759]=L;c[w+(M+4)>>2]=L|1;c[w+(p+-36)>>2]=40;c[763]=c[878]}while(0);b=c[759]|0;if(b>>>0>q>>>0){L=b-q|0;c[759]=L;M=c[762]|0;c[762]=M+q;c[M+(q+4)>>2]=L|1;c[M+4>>2]=q|3;M=M+8|0;return M|0}}c[(qi()|0)>>2]=12;M=0;return M|0}function Vj(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;if(!a)return;b=a+-8|0;i=c[760]|0;if(b>>>0<i>>>0)Da();d=c[a+-4>>2]|0;e=d&3;if((e|0)==1)Da();o=d&-8;q=a+(o+-8)|0;do if(!(d&1)){b=c[b>>2]|0;if(!e)return;j=-8-b|0;l=a+j|0;m=b+o|0;if(l>>>0<i>>>0)Da();if((l|0)==(c[761]|0)){b=a+(o+-4)|0;d=c[b>>2]|0;if((d&3|0)!=3){u=l;g=m;break}c[758]=m;c[b>>2]=d&-2;c[a+(j+4)>>2]=m|1;c[q>>2]=m;return}f=b>>>3;if(b>>>0<256){e=c[a+(j+8)>>2]|0;d=c[a+(j+12)>>2]|0;b=3064+(f<<1<<2)|0;if((e|0)!=(b|0)){if(e>>>0<i>>>0)Da();if((c[e+12>>2]|0)!=(l|0))Da()}if((d|0)==(e|0)){c[756]=c[756]&~(1<<f);u=l;g=m;break}if((d|0)!=(b|0)){if(d>>>0<i>>>0)Da();b=d+8|0;if((c[b>>2]|0)==(l|0))h=b;else Da()}else h=d+8|0;c[e+12>>2]=d;c[h>>2]=e;u=l;g=m;break}h=c[a+(j+24)>>2]|0;e=c[a+(j+12)>>2]|0;do if((e|0)==(l|0)){d=a+(j+20)|0;b=c[d>>2]|0;if(!b){d=a+(j+16)|0;b=c[d>>2]|0;if(!b){k=0;break}}while(1){e=b+20|0;f=c[e>>2]|0;if(f){b=f;d=e;continue}e=b+16|0;f=c[e>>2]|0;if(!f)break;else{b=f;d=e}}if(d>>>0<i>>>0)Da();else{c[d>>2]=0;k=b;break}}else{f=c[a+(j+8)>>2]|0;if(f>>>0<i>>>0)Da();b=f+12|0;if((c[b>>2]|0)!=(l|0))Da();d=e+8|0;if((c[d>>2]|0)==(l|0)){c[b>>2]=e;c[d>>2]=f;k=e;break}else Da()}while(0);if(h){b=c[a+(j+28)>>2]|0;d=3328+(b<<2)|0;if((l|0)==(c[d>>2]|0)){c[d>>2]=k;if(!k){c[757]=c[757]&~(1<<b);u=l;g=m;break}}else{if(h>>>0<(c[760]|0)>>>0)Da();b=h+16|0;if((c[b>>2]|0)==(l|0))c[b>>2]=k;else c[h+20>>2]=k;if(!k){u=l;g=m;break}}d=c[760]|0;if(k>>>0<d>>>0)Da();c[k+24>>2]=h;b=c[a+(j+16)>>2]|0;do if(b)if(b>>>0<d>>>0)Da();else{c[k+16>>2]=b;c[b+24>>2]=k;break}while(0);b=c[a+(j+20)>>2]|0;if(b)if(b>>>0<(c[760]|0)>>>0)Da();else{c[k+20>>2]=b;c[b+24>>2]=k;u=l;g=m;break}else{u=l;g=m}}else{u=l;g=m}}else{u=b;g=o}while(0);if(u>>>0>=q>>>0)Da();b=a+(o+-4)|0;d=c[b>>2]|0;if(!(d&1))Da();if(!(d&2)){if((q|0)==(c[762]|0)){t=(c[759]|0)+g|0;c[759]=t;c[762]=u;c[u+4>>2]=t|1;if((u|0)!=(c[761]|0))return;c[761]=0;c[758]=0;return}if((q|0)==(c[761]|0)){t=(c[758]|0)+g|0;c[758]=t;c[761]=u;c[u+4>>2]=t|1;c[u+t>>2]=t;return}g=(d&-8)+g|0;f=d>>>3;do if(d>>>0>=256){h=c[a+(o+16)>>2]|0;b=c[a+(o|4)>>2]|0;do if((b|0)==(q|0)){d=a+(o+12)|0;b=c[d>>2]|0;if(!b){d=a+(o+8)|0;b=c[d>>2]|0;if(!b){p=0;break}}while(1){e=b+20|0;f=c[e>>2]|0;if(f){b=f;d=e;continue}e=b+16|0;f=c[e>>2]|0;if(!f)break;else{b=f;d=e}}if(d>>>0<(c[760]|0)>>>0)Da();else{c[d>>2]=0;p=b;break}}else{d=c[a+o>>2]|0;if(d>>>0<(c[760]|0)>>>0)Da();e=d+12|0;if((c[e>>2]|0)!=(q|0))Da();f=b+8|0;if((c[f>>2]|0)==(q|0)){c[e>>2]=b;c[f>>2]=d;p=b;break}else Da()}while(0);if(h){b=c[a+(o+20)>>2]|0;d=3328+(b<<2)|0;if((q|0)==(c[d>>2]|0)){c[d>>2]=p;if(!p){c[757]=c[757]&~(1<<b);break}}else{if(h>>>0<(c[760]|0)>>>0)Da();b=h+16|0;if((c[b>>2]|0)==(q|0))c[b>>2]=p;else c[h+20>>2]=p;if(!p)break}d=c[760]|0;if(p>>>0<d>>>0)Da();c[p+24>>2]=h;b=c[a+(o+8)>>2]|0;do if(b)if(b>>>0<d>>>0)Da();else{c[p+16>>2]=b;c[b+24>>2]=p;break}while(0);b=c[a+(o+12)>>2]|0;if(b)if(b>>>0<(c[760]|0)>>>0)Da();else{c[p+20>>2]=b;c[b+24>>2]=p;break}}}else{e=c[a+o>>2]|0;d=c[a+(o|4)>>2]|0;b=3064+(f<<1<<2)|0;if((e|0)!=(b|0)){if(e>>>0<(c[760]|0)>>>0)Da();if((c[e+12>>2]|0)!=(q|0))Da()}if((d|0)==(e|0)){c[756]=c[756]&~(1<<f);break}if((d|0)!=(b|0)){if(d>>>0<(c[760]|0)>>>0)Da();b=d+8|0;if((c[b>>2]|0)==(q|0))n=b;else Da()}else n=d+8|0;c[e+12>>2]=d;c[n>>2]=e}while(0);c[u+4>>2]=g|1;c[u+g>>2]=g;if((u|0)==(c[761]|0)){c[758]=g;return}}else{c[b>>2]=d&-2;c[u+4>>2]=g|1;c[u+g>>2]=g}b=g>>>3;if(g>>>0<256){d=b<<1;f=3064+(d<<2)|0;e=c[756]|0;b=1<<b;if(e&b){b=3064+(d+2<<2)|0;d=c[b>>2]|0;if(d>>>0<(c[760]|0)>>>0)Da();else{r=b;s=d}}else{c[756]=e|b;r=3064+(d+2<<2)|0;s=f}c[r>>2]=u;c[s+12>>2]=u;c[u+8>>2]=s;c[u+12>>2]=f;return}b=g>>>8;if(b)if(g>>>0>16777215)f=31;else{r=(b+1048320|0)>>>16&8;s=b<<r;q=(s+520192|0)>>>16&4;s=s<<q;f=(s+245760|0)>>>16&2;f=14-(q|r|f)+(s<<f>>>15)|0;f=g>>>(f+7|0)&1|f<<1}else f=0;b=3328+(f<<2)|0;c[u+28>>2]=f;c[u+20>>2]=0;c[u+16>>2]=0;d=c[757]|0;e=1<<f;a:do if(d&e){b=c[b>>2]|0;b:do if((c[b+4>>2]&-8|0)!=(g|0)){f=g<<((f|0)==31?0:25-(f>>>1)|0);while(1){d=b+16+(f>>>31<<2)|0;e=c[d>>2]|0;if(!e)break;if((c[e+4>>2]&-8|0)==(g|0)){t=e;break b}else{f=f<<1;b=e}}if(d>>>0<(c[760]|0)>>>0)Da();else{c[d>>2]=u;c[u+24>>2]=b;c[u+12>>2]=u;c[u+8>>2]=u;break a}}else t=b;while(0);b=t+8|0;d=c[b>>2]|0;s=c[760]|0;if(d>>>0>=s>>>0&t>>>0>=s>>>0){c[d+12>>2]=u;c[b>>2]=u;c[u+8>>2]=d;c[u+12>>2]=t;c[u+24>>2]=0;break}else Da()}else{c[757]=d|e;c[b>>2]=u;c[u+24>>2]=b;c[u+12>>2]=u;c[u+8>>2]=u}while(0);u=(c[764]|0)+-1|0;c[764]=u;if(!u)b=3480;else return;while(1){b=c[b>>2]|0;if(!b)break;else b=b+8|0}c[764]=-1;return}function Wj(a,b){a=a|0;b=b|0;var d=0;if(a){d=$(b,a)|0;if((b|a)>>>0>65535)d=((d>>>0)/(a>>>0)|0|0)==(b|0)?d:-1}else d=0;b=Uj(d)|0;if(!b)return b|0;if(!(c[b+-4>>2]&3))return b|0;ek(b|0,0,d|0)|0;return b|0}function Xj(a,b){a=a|0;b=b|0;var d=0,e=0;if(!a){a=Uj(b)|0;return a|0}if(b>>>0>4294967231){c[(qi()|0)>>2]=12;a=0;return a|0}d=Yj(a+-8|0,b>>>0<11?16:b+11&-8)|0;if(d){a=d+8|0;return a|0}d=Uj(b)|0;if(!d){a=0;return a|0}e=c[a+-4>>2]|0;e=(e&-8)-((e&3|0)==0?8:4)|0;ik(d|0,a|0,(e>>>0<b>>>0?e:b)|0)|0;Vj(a);a=d;return a|0}function Yj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;o=a+4|0;p=c[o>>2]|0;j=p&-8;l=a+j|0;i=c[760]|0;d=p&3;if(!((d|0)!=1&a>>>0>=i>>>0&a>>>0<l>>>0))Da();e=a+(j|4)|0;f=c[e>>2]|0;if(!(f&1))Da();if(!d){if(b>>>0<256){a=0;return a|0}if(j>>>0>=(b+4|0)>>>0?(j-b|0)>>>0<=c[876]<<1>>>0:0)return a|0;a=0;return a|0}if(j>>>0>=b>>>0){d=j-b|0;if(d>>>0<=15)return a|0;c[o>>2]=p&1|b|2;c[a+(b+4)>>2]=d|3;c[e>>2]=c[e>>2]|1;Zj(a+b|0,d);return a|0}if((l|0)==(c[762]|0)){d=(c[759]|0)+j|0;if(d>>>0<=b>>>0){a=0;return a|0}n=d-b|0;c[o>>2]=p&1|b|2;c[a+(b+4)>>2]=n|1;c[762]=a+b;c[759]=n;return a|0}if((l|0)==(c[761]|0)){e=(c[758]|0)+j|0;if(e>>>0<b>>>0){a=0;return a|0}d=e-b|0;if(d>>>0>15){c[o>>2]=p&1|b|2;c[a+(b+4)>>2]=d|1;c[a+e>>2]=d;e=a+(e+4)|0;c[e>>2]=c[e>>2]&-2;e=a+b|0}else{c[o>>2]=p&1|e|2;e=a+(e+4)|0;c[e>>2]=c[e>>2]|1;e=0;d=0}c[758]=d;c[761]=e;return a|0}if(f&2){a=0;return a|0}m=(f&-8)+j|0;if(m>>>0<b>>>0){a=0;return a|0}n=m-b|0;g=f>>>3;do if(f>>>0>=256){h=c[a+(j+24)>>2]|0;g=c[a+(j+12)>>2]|0;do if((g|0)==(l|0)){e=a+(j+20)|0;d=c[e>>2]|0;if(!d){e=a+(j+16)|0;d=c[e>>2]|0;if(!d){k=0;break}}while(1){f=d+20|0;g=c[f>>2]|0;if(g){d=g;e=f;continue}f=d+16|0;g=c[f>>2]|0;if(!g)break;else{d=g;e=f}}if(e>>>0<i>>>0)Da();else{c[e>>2]=0;k=d;break}}else{f=c[a+(j+8)>>2]|0;if(f>>>0<i>>>0)Da();d=f+12|0;if((c[d>>2]|0)!=(l|0))Da();e=g+8|0;if((c[e>>2]|0)==(l|0)){c[d>>2]=g;c[e>>2]=f;k=g;break}else Da()}while(0);if(h){d=c[a+(j+28)>>2]|0;e=3328+(d<<2)|0;if((l|0)==(c[e>>2]|0)){c[e>>2]=k;if(!k){c[757]=c[757]&~(1<<d);break}}else{if(h>>>0<(c[760]|0)>>>0)Da();d=h+16|0;if((c[d>>2]|0)==(l|0))c[d>>2]=k;else c[h+20>>2]=k;if(!k)break}e=c[760]|0;if(k>>>0<e>>>0)Da();c[k+24>>2]=h;d=c[a+(j+16)>>2]|0;do if(d)if(d>>>0<e>>>0)Da();else{c[k+16>>2]=d;c[d+24>>2]=k;break}while(0);d=c[a+(j+20)>>2]|0;if(d)if(d>>>0<(c[760]|0)>>>0)Da();else{c[k+20>>2]=d;c[d+24>>2]=k;break}}}else{f=c[a+(j+8)>>2]|0;e=c[a+(j+12)>>2]|0;d=3064+(g<<1<<2)|0;if((f|0)!=(d|0)){if(f>>>0<i>>>0)Da();if((c[f+12>>2]|0)!=(l|0))Da()}if((e|0)==(f|0)){c[756]=c[756]&~(1<<g);break}if((e|0)!=(d|0)){if(e>>>0<i>>>0)Da();d=e+8|0;if((c[d>>2]|0)==(l|0))h=d;else Da()}else h=e+8|0;c[f+12>>2]=e;c[h>>2]=f}while(0);if(n>>>0<16){c[o>>2]=m|p&1|2;b=a+(m|4)|0;c[b>>2]=c[b>>2]|1;return a|0}else{c[o>>2]=p&1|b|2;c[a+(b+4)>>2]=n|3;p=a+(m|4)|0;c[p>>2]=c[p>>2]|1;Zj(a+b|0,n);return a|0}return 0}function Zj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;q=a+b|0;d=c[a+4>>2]|0;do if(!(d&1)){k=c[a>>2]|0;if(!(d&3))return;n=a+(0-k)|0;m=k+b|0;j=c[760]|0;if(n>>>0<j>>>0)Da();if((n|0)==(c[761]|0)){e=a+(b+4)|0;d=c[e>>2]|0;if((d&3|0)!=3){t=n;h=m;break}c[758]=m;c[e>>2]=d&-2;c[a+(4-k)>>2]=m|1;c[q>>2]=m;return}g=k>>>3;if(k>>>0<256){f=c[a+(8-k)>>2]|0;e=c[a+(12-k)>>2]|0;d=3064+(g<<1<<2)|0;if((f|0)!=(d|0)){if(f>>>0<j>>>0)Da();if((c[f+12>>2]|0)!=(n|0))Da()}if((e|0)==(f|0)){c[756]=c[756]&~(1<<g);t=n;h=m;break}if((e|0)!=(d|0)){if(e>>>0<j>>>0)Da();d=e+8|0;if((c[d>>2]|0)==(n|0))i=d;else Da()}else i=e+8|0;c[f+12>>2]=e;c[i>>2]=f;t=n;h=m;break}i=c[a+(24-k)>>2]|0;f=c[a+(12-k)>>2]|0;do if((f|0)==(n|0)){f=16-k|0;e=a+(f+4)|0;d=c[e>>2]|0;if(!d){e=a+f|0;d=c[e>>2]|0;if(!d){l=0;break}}while(1){f=d+20|0;g=c[f>>2]|0;if(g){d=g;e=f;continue}f=d+16|0;g=c[f>>2]|0;if(!g)break;else{d=g;e=f}}if(e>>>0<j>>>0)Da();else{c[e>>2]=0;l=d;break}}else{g=c[a+(8-k)>>2]|0;if(g>>>0<j>>>0)Da();d=g+12|0;if((c[d>>2]|0)!=(n|0))Da();e=f+8|0;if((c[e>>2]|0)==(n|0)){c[d>>2]=f;c[e>>2]=g;l=f;break}else Da()}while(0);if(i){d=c[a+(28-k)>>2]|0;e=3328+(d<<2)|0;if((n|0)==(c[e>>2]|0)){c[e>>2]=l;if(!l){c[757]=c[757]&~(1<<d);t=n;h=m;break}}else{if(i>>>0<(c[760]|0)>>>0)Da();d=i+16|0;if((c[d>>2]|0)==(n|0))c[d>>2]=l;else c[i+20>>2]=l;if(!l){t=n;h=m;break}}f=c[760]|0;if(l>>>0<f>>>0)Da();c[l+24>>2]=i;d=16-k|0;e=c[a+d>>2]|0;do if(e)if(e>>>0<f>>>0)Da();else{c[l+16>>2]=e;c[e+24>>2]=l;break}while(0);d=c[a+(d+4)>>2]|0;if(d)if(d>>>0<(c[760]|0)>>>0)Da();else{c[l+20>>2]=d;c[d+24>>2]=l;t=n;h=m;break}else{t=n;h=m}}else{t=n;h=m}}else{t=a;h=b}while(0);j=c[760]|0;if(q>>>0<j>>>0)Da();d=a+(b+4)|0;e=c[d>>2]|0;if(!(e&2)){if((q|0)==(c[762]|0)){s=(c[759]|0)+h|0;c[759]=s;c[762]=t;c[t+4>>2]=s|1;if((t|0)!=(c[761]|0))return;c[761]=0;c[758]=0;return}if((q|0)==(c[761]|0)){s=(c[758]|0)+h|0;c[758]=s;c[761]=t;c[t+4>>2]=s|1;c[t+s>>2]=s;return}h=(e&-8)+h|0;g=e>>>3;do if(e>>>0>=256){i=c[a+(b+24)>>2]|0;f=c[a+(b+12)>>2]|0;do if((f|0)==(q|0)){e=a+(b+20)|0;d=c[e>>2]|0;if(!d){e=a+(b+16)|0;d=c[e>>2]|0;if(!d){p=0;break}}while(1){f=d+20|0;g=c[f>>2]|0;if(g){d=g;e=f;continue}f=d+16|0;g=c[f>>2]|0;if(!g)break;else{d=g;e=f}}if(e>>>0<j>>>0)Da();else{c[e>>2]=0;p=d;break}}else{g=c[a+(b+8)>>2]|0;if(g>>>0<j>>>0)Da();d=g+12|0;if((c[d>>2]|0)!=(q|0))Da();e=f+8|0;if((c[e>>2]|0)==(q|0)){c[d>>2]=f;c[e>>2]=g;p=f;break}else Da()}while(0);if(i){d=c[a+(b+28)>>2]|0;e=3328+(d<<2)|0;if((q|0)==(c[e>>2]|0)){c[e>>2]=p;if(!p){c[757]=c[757]&~(1<<d);break}}else{if(i>>>0<(c[760]|0)>>>0)Da();d=i+16|0;if((c[d>>2]|0)==(q|0))c[d>>2]=p;else c[i+20>>2]=p;if(!p)break}e=c[760]|0;if(p>>>0<e>>>0)Da();c[p+24>>2]=i;d=c[a+(b+16)>>2]|0;do if(d)if(d>>>0<e>>>0)Da();else{c[p+16>>2]=d;c[d+24>>2]=p;break}while(0);d=c[a+(b+20)>>2]|0;if(d)if(d>>>0<(c[760]|0)>>>0)Da();else{c[p+20>>2]=d;c[d+24>>2]=p;break}}}else{f=c[a+(b+8)>>2]|0;e=c[a+(b+12)>>2]|0;d=3064+(g<<1<<2)|0;if((f|0)!=(d|0)){if(f>>>0<j>>>0)Da();if((c[f+12>>2]|0)!=(q|0))Da()}if((e|0)==(f|0)){c[756]=c[756]&~(1<<g);break}if((e|0)!=(d|0)){if(e>>>0<j>>>0)Da();d=e+8|0;if((c[d>>2]|0)==(q|0))o=d;else Da()}else o=e+8|0;c[f+12>>2]=e;c[o>>2]=f}while(0);c[t+4>>2]=h|1;c[t+h>>2]=h;if((t|0)==(c[761]|0)){c[758]=h;return}}else{c[d>>2]=e&-2;c[t+4>>2]=h|1;c[t+h>>2]=h}d=h>>>3;if(h>>>0<256){e=d<<1;g=3064+(e<<2)|0;f=c[756]|0;d=1<<d;if(f&d){d=3064+(e+2<<2)|0;e=c[d>>2]|0;if(e>>>0<(c[760]|0)>>>0)Da();else{r=d;s=e}}else{c[756]=f|d;r=3064+(e+2<<2)|0;s=g}c[r>>2]=t;c[s+12>>2]=t;c[t+8>>2]=s;c[t+12>>2]=g;return}d=h>>>8;if(d)if(h>>>0>16777215)g=31;else{r=(d+1048320|0)>>>16&8;s=d<<r;q=(s+520192|0)>>>16&4;s=s<<q;g=(s+245760|0)>>>16&2;g=14-(q|r|g)+(s<<g>>>15)|0;g=h>>>(g+7|0)&1|g<<1}else g=0;d=3328+(g<<2)|0;c[t+28>>2]=g;c[t+20>>2]=0;c[t+16>>2]=0;e=c[757]|0;f=1<<g;if(!(e&f)){c[757]=e|f;c[d>>2]=t;c[t+24>>2]=d;c[t+12>>2]=t;c[t+8>>2]=t;return}d=c[d>>2]|0;a:do if((c[d+4>>2]&-8|0)!=(h|0)){g=h<<((g|0)==31?0:25-(g>>>1)|0);while(1){e=d+16+(g>>>31<<2)|0;f=c[e>>2]|0;if(!f)break;if((c[f+4>>2]&-8|0)==(h|0)){d=f;break a}else{g=g<<1;d=f}}if(e>>>0<(c[760]|0)>>>0)Da();c[e>>2]=t;c[t+24>>2]=d;c[t+12>>2]=t;c[t+8>>2]=t;return}while(0);e=d+8|0;f=c[e>>2]|0;s=c[760]|0;if(!(f>>>0>=s>>>0&d>>>0>=s>>>0))Da();c[f+12>>2]=t;c[e>>2]=t;c[t+8>>2]=f;c[t+12>>2]=d;c[t+24>>2]=0;return}
function Ee(b,e,f,j,k,l,m,n,o,p,q,r){b=b|0;e=e|0;f=f|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;q=+q;r=r|0;var s=0,t=0,u=0.0,v=0.0,w=0,x=0,y=0.0,z=0.0,A=0.0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0.0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0,Z=0;T=i;i=i+240|0;x=T+224|0;w=T+216|0;C=T+208|0;B=T+200|0;s=T+136|0;N=T+72|0;P=T;Q=T+232|0;R=T+228|0;h[s>>3]=100.0;h[s+8>>3]=100.0;h[s+16>>3]=110.0;h[s+24>>3]=100.0;h[s+32>>3]=110.0;h[s+40>>3]=110.0;h[s+48>>3]=100.0;h[s+56>>3]=110.0;h[N>>3]=+h[p>>3];h[N+8>>3]=+h[p+8>>3];h[N+16>>3]=+h[p+16>>3];h[N+24>>3]=+h[p+24>>3];h[N+32>>3]=+h[p+32>>3];h[N+40>>3]=+h[p+40>>3];h[N+48>>3]=+h[p+48>>3];h[N+56>>3]=+h[p+56>>3];He(s,N,P);A=+h[N>>3];V=+h[N+16>>3];y=A-V;J=+h[N+8>>3];U=+h[N+24>>3];u=J-U;s=~~(y*y+u*u);u=+h[N+32>>3];y=+h[N+48>>3];X=u-y;v=+h[N+40>>3];z=+h[N+56>>3];W=v-z;N=~~(X*X+W*W);u=V-u;v=U-v;t=~~(u*u+v*v);A=y-A;J=z-J;O=~~(A*A+J*J);s=~~(+(((N|0)>(s|0)?N:s)|0)*q*q);t=~~(+(((O|0)>(t|0)?O:t)|0)*q*q);if(!b){p=f;while(1)if((p|0)<(j|0)&($(p,p)|0)<(s|0))p=p<<1;else break;s=f;while(1)if((s|0)<(j|0)&($(s,s)|0)<(t|0))s=s<<1;else break}else{p=f;while(1)if((p|0)<(j|0)&($(p<<2,p)|0)<(s|0))p=p<<1;else break;s=f;while(1)if((s|0)<(j|0)&($(s<<2,s)|0)<(t|0))s=s<<1;else break}O=(p|0)>(j|0)?j:p;M=(s|0)>(j|0)?j:s;L=(O|0)/(f|0)|0;K=(M|0)/(f|0)|0;u=(1.0-q)*.5*10.0;J=q*10.0;N=$(f,f)|0;a:do if(!e){I=N*3|0;p=Wj(I,4)|0;if(!p){Me(3,5472,B);rb(1)}do switch(n|0){case 0:{y=u+100.0;z=+(M|0);A=+(O|0);B=P+48|0;C=P+56|0;n=P+64|0;D=P+8|0;E=P+16|0;F=P+24|0;G=P+32|0;H=P+40|0;j=(b|0)==1;if((M|0)>0){e=(O|0)>0;x=0;do{v=y+J*(+(x|0)+.5)/z;if(e){w=0;do{u=y+J*(+(w|0)+.5)/A;q=+h[n>>3]+(+h[B>>3]*u+v*+h[C>>3]);if(q==0.0){S=278;break a}X=(+h[E>>3]+(u*+h[P>>3]+v*+h[D>>3]))/q;g[Q>>2]=X;u=(+h[H>>3]+(u*+h[F>>3]+v*+h[G>>3]))/q;g[R>>2]=u;lf(o,X,u,Q,R)|0;u=+g[Q>>2];if(j){s=((~~(u+1.0)|0)/2|0)<<1;t=((~~(+g[R>>2]+1.0)|0)/2|0)<<1}else{s=~~(u+.5);t=~~(+g[R>>2]+.5)}if((s|0)>-1?(t|0)<(m|0)&((t|0)>-1&(s|0)<(l|0)):0){t=(($(t,l)|0)+s|0)*3|0;b=(($((x|0)/(K|0)|0,f)|0)+((w|0)/(L|0)|0)|0)*3|0;s=p+(b<<2)|0;c[s>>2]=(c[s>>2]|0)+(d[k+(t+2)>>0]|0);s=p+(b+1<<2)|0;c[s>>2]=(c[s>>2]|0)+(d[k+(t+1)>>0]|0);b=p+(b+2<<2)|0;c[b>>2]=(c[b>>2]|0)+(d[k+t>>0]|0)}w=w+1|0}while((w|0)<(O|0))}x=x+1|0}while((x|0)<(M|0))}break}case 1:{y=u+100.0;z=+(M|0);A=+(O|0);B=P+48|0;C=P+56|0;n=P+64|0;D=P+8|0;E=P+16|0;F=P+24|0;G=P+32|0;H=P+40|0;j=(b|0)==1;if((M|0)>0){e=(O|0)>0;x=0;do{v=y+J*(+(x|0)+.5)/z;if(e){w=0;do{u=y+J*(+(w|0)+.5)/A;q=+h[n>>3]+(+h[B>>3]*u+v*+h[C>>3]);if(q==0.0){S=278;break a}X=(+h[E>>3]+(u*+h[P>>3]+v*+h[D>>3]))/q;g[Q>>2]=X;u=(+h[H>>3]+(u*+h[F>>3]+v*+h[G>>3]))/q;g[R>>2]=u;lf(o,X,u,Q,R)|0;u=+g[Q>>2];if(j){s=((~~(u+1.0)|0)/2|0)<<1;t=((~~(+g[R>>2]+1.0)|0)/2|0)<<1}else{s=~~(u+.5);t=~~(+g[R>>2]+.5)}if((s|0)>-1?(t|0)<(m|0)&((t|0)>-1&(s|0)<(l|0)):0){t=(($(t,l)|0)+s|0)*3|0;b=(($((x|0)/(K|0)|0,f)|0)+((w|0)/(L|0)|0)|0)*3|0;s=p+(b<<2)|0;c[s>>2]=(c[s>>2]|0)+(d[k+t>>0]|0);s=p+(b+1<<2)|0;c[s>>2]=(c[s>>2]|0)+(d[k+(t+1)>>0]|0);b=p+(b+2<<2)|0;c[b>>2]=(c[b>>2]|0)+(d[k+(t+2)>>0]|0)}w=w+1|0}while((w|0)<(O|0))}x=x+1|0}while((x|0)<(M|0))}break}case 2:{y=u+100.0;z=+(M|0);A=+(O|0);B=P+48|0;C=P+56|0;n=P+64|0;D=P+8|0;E=P+16|0;F=P+24|0;G=P+32|0;H=P+40|0;j=(b|0)==1;if((M|0)>0){e=(O|0)>0;x=0;do{v=y+J*(+(x|0)+.5)/z;if(e){w=0;do{u=y+J*(+(w|0)+.5)/A;q=+h[n>>3]+(+h[B>>3]*u+v*+h[C>>3]);if(q==0.0){S=278;break a}X=(+h[E>>3]+(u*+h[P>>3]+v*+h[D>>3]))/q;g[Q>>2]=X;u=(+h[H>>3]+(u*+h[F>>3]+v*+h[G>>3]))/q;g[R>>2]=u;lf(o,X,u,Q,R)|0;u=+g[Q>>2];if(j){s=((~~(u+1.0)|0)/2|0)<<1;t=((~~(+g[R>>2]+1.0)|0)/2|0)<<1}else{s=~~(u+.5);t=~~(+g[R>>2]+.5)}if((s|0)>-1?(t|0)<(m|0)&((t|0)>-1&(s|0)<(l|0)):0){t=($(t,l)|0)+s<<2;b=(($((x|0)/(K|0)|0,f)|0)+((w|0)/(L|0)|0)|0)*3|0;s=p+(b<<2)|0;c[s>>2]=(c[s>>2]|0)+(d[k+(t|2)>>0]|0);s=p+(b+1<<2)|0;c[s>>2]=(c[s>>2]|0)+(d[k+(t|1)>>0]|0);b=p+(b+2<<2)|0;c[b>>2]=(c[b>>2]|0)+(d[k+t>>0]|0)}w=w+1|0}while((w|0)<(O|0))}x=x+1|0}while((x|0)<(M|0))}break}case 3:{y=u+100.0;z=+(M|0);A=+(O|0);B=P+48|0;C=P+56|0;n=P+64|0;D=P+8|0;E=P+16|0;F=P+24|0;G=P+32|0;H=P+40|0;j=(b|0)==1;if((M|0)>0){e=(O|0)>0;x=0;do{v=y+J*(+(x|0)+.5)/z;if(e){w=0;do{u=y+J*(+(w|0)+.5)/A;q=+h[n>>3]+(+h[B>>3]*u+v*+h[C>>3]);if(q==0.0){S=278;break a}X=(+h[E>>3]+(u*+h[P>>3]+v*+h[D>>3]))/q;g[Q>>2]=X;u=(+h[H>>3]+(u*+h[F>>3]+v*+h[G>>3]))/q;g[R>>2]=u;lf(o,X,u,Q,R)|0;u=+g[Q>>2];if(j){s=((~~(u+1.0)|0)/2|0)<<1;t=((~~(+g[R>>2]+1.0)|0)/2|0)<<1}else{s=~~(u+.5);t=~~(+g[R>>2]+.5)}if((s|0)>-1?(t|0)<(m|0)&((t|0)>-1&(s|0)<(l|0)):0){t=($(t,l)|0)+s<<2;b=(($((x|0)/(K|0)|0,f)|0)+((w|0)/(L|0)|0)|0)*3|0;s=p+(b<<2)|0;c[s>>2]=(c[s>>2]|0)+(d[k+t>>0]|0);s=p+(b+1<<2)|0;c[s>>2]=(c[s>>2]|0)+(d[k+(t|1)>>0]|0);b=p+(b+2<<2)|0;c[b>>2]=(c[b>>2]|0)+(d[k+(t|2)>>0]|0)}w=w+1|0}while((w|0)<(O|0))}x=x+1|0}while((x|0)<(M|0))}break}case 4:{y=u+100.0;z=+(M|0);A=+(O|0);B=P+48|0;C=P+56|0;n=P+64|0;D=P+8|0;E=P+16|0;F=P+24|0;G=P+32|0;H=P+40|0;j=(b|0)==1;if((M|0)>0){e=(O|0)>0;x=0;do{v=y+J*(+(x|0)+.5)/z;if(e){w=0;do{u=y+J*(+(w|0)+.5)/A;q=+h[n>>3]+(+h[B>>3]*u+v*+h[C>>3]);if(q==0.0){S=278;break a}X=(+h[E>>3]+(u*+h[P>>3]+v*+h[D>>3]))/q;g[Q>>2]=X;u=(+h[H>>3]+(u*+h[F>>3]+v*+h[G>>3]))/q;g[R>>2]=u;lf(o,X,u,Q,R)|0;u=+g[Q>>2];if(j){s=((~~(u+1.0)|0)/2|0)<<1;t=((~~(+g[R>>2]+1.0)|0)/2|0)<<1}else{s=~~(u+.5);t=~~(+g[R>>2]+.5)}if((s|0)>-1?(t|0)<(m|0)&((t|0)>-1&(s|0)<(l|0)):0){t=($(t,l)|0)+s<<2;b=(($((x|0)/(K|0)|0,f)|0)+((w|0)/(L|0)|0)|0)*3|0;s=p+(b<<2)|0;c[s>>2]=(c[s>>2]|0)+(d[k+(t|1)>>0]|0);s=p+(b+1<<2)|0;c[s>>2]=(c[s>>2]|0)+(d[k+(t|2)>>0]|0);b=p+(b+2<<2)|0;c[b>>2]=(c[b>>2]|0)+(d[k+(t|3)>>0]|0)}w=w+1|0}while((w|0)<(O|0))}x=x+1|0}while((x|0)<(M|0))}break}case 5:case 12:case 13:case 14:{y=u+100.0;z=+(M|0);A=+(O|0);B=P+48|0;C=P+56|0;n=P+64|0;D=P+8|0;E=P+16|0;F=P+24|0;G=P+32|0;H=P+40|0;j=(b|0)==1;if((M|0)>0){e=(O|0)>0;x=0;do{v=y+J*(+(x|0)+.5)/z;if(e){w=0;do{u=y+J*(+(w|0)+.5)/A;q=+h[n>>3]+(+h[B>>3]*u+v*+h[C>>3]);if(q==0.0){S=278;break a}X=(+h[E>>3]+(u*+h[P>>3]+v*+h[D>>3]))/q;g[Q>>2]=X;u=(+h[H>>3]+(u*+h[F>>3]+v*+h[G>>3]))/q;g[R>>2]=u;lf(o,X,u,Q,R)|0;u=+g[Q>>2];if(j){s=((~~(u+1.0)|0)/2|0)<<1;t=((~~(+g[R>>2]+1.0)|0)/2|0)<<1}else{s=~~(u+.5);t=~~(+g[R>>2]+.5)}if((s|0)>-1?(t|0)<(m|0)&((t|0)>-1&(s|0)<(l|0)):0){t=d[k+(($(t,l)|0)+s)>>0]|0;b=(($((x|0)/(K|0)|0,f)|0)+((w|0)/(L|0)|0)|0)*3|0;s=p+(b<<2)|0;c[s>>2]=(c[s>>2]|0)+t;s=p+(b+1<<2)|0;c[s>>2]=(c[s>>2]|0)+t;b=p+(b+2<<2)|0;c[b>>2]=(c[b>>2]|0)+t}w=w+1|0}while((w|0)<(O|0))}x=x+1|0}while((x|0)<(M|0))}break}case 6:{y=u+100.0;z=+(M|0);A=+(O|0);B=P+48|0;C=P+56|0;n=P+64|0;D=P+8|0;E=P+16|0;F=P+24|0;G=P+32|0;H=P+40|0;j=(b|0)==1;if((M|0)>0){e=(O|0)>0;x=0;do{v=y+J*(+(x|0)+.5)/z;if(e){w=0;do{u=y+J*(+(w|0)+.5)/A;q=+h[n>>3]+(+h[B>>3]*u+v*+h[C>>3]);if(q==0.0){S=278;break a}X=(+h[E>>3]+(u*+h[P>>3]+v*+h[D>>3]))/q;g[Q>>2]=X;u=(+h[H>>3]+(u*+h[F>>3]+v*+h[G>>3]))/q;g[R>>2]=u;lf(o,X,u,Q,R)|0;u=+g[Q>>2];if(j){s=((~~(u+1.0)|0)/2|0)<<1;t=((~~(+g[R>>2]+1.0)|0)/2|0)<<1}else{s=~~(u+.5);t=~~(+g[R>>2]+.5)}if((s|0)>-1?(t|0)<(m|0)&((t|0)>-1&(s|0)<(l|0)):0){t=($(t,l)|0)+s<<2;b=(($((x|0)/(K|0)|0,f)|0)+((w|0)/(L|0)|0)|0)*3|0;s=p+(b<<2)|0;c[s>>2]=(c[s>>2]|0)+(d[k+(t|3)>>0]|0);s=p+(b+1<<2)|0;c[s>>2]=(c[s>>2]|0)+(d[k+(t|2)>>0]|0);b=p+(b+2<<2)|0;c[b>>2]=(c[b>>2]|0)+(d[k+(t|1)>>0]|0)}w=w+1|0}while((w|0)<(O|0))}x=x+1|0}while((x|0)<(M|0))}break}case 7:{y=u+100.0;z=+(M|0);A=+(O|0);B=P+48|0;C=P+56|0;n=P+64|0;D=P+8|0;E=P+16|0;F=P+24|0;G=P+32|0;H=P+40|0;j=(b|0)==1;if((M|0)>0){e=(O|0)>0;x=0;do{v=y+J*(+(x|0)+.5)/z;if(e){w=0;do{u=y+J*(+(w|0)+.5)/A;q=+h[n>>3]+(+h[B>>3]*u+v*+h[C>>3]);if(q==0.0){S=278;break a}X=(+h[E>>3]+(u*+h[P>>3]+v*+h[D>>3]))/q;g[Q>>2]=X;u=(+h[H>>3]+(u*+h[F>>3]+v*+h[G>>3]))/q;g[R>>2]=u;lf(o,X,u,Q,R)|0;u=+g[Q>>2];if(j){s=((~~(u+1.0)|0)/2|0)<<1;t=((~~(+g[R>>2]+1.0)|0)/2|0)<<1}else{s=~~(u+.5);t=~~(+g[R>>2]+.5)}if((s|0)>-1?(t|0)<(m|0)&((t|0)>-1&(s|0)<(l|0)):0){Z=$(t,l)|0;Y=(s&65534)+Z<<1;V=+((d[k+Y>>0]|0)+-128|0);X=+((d[k+(Y+2)>>0]|0)+-128|0);W=+((d[k+(Z+s<<1|1)>>0]|0)+-16|0)*298.0820007324219;Z=~~(V*516.4110107421875+W)>>8;Y=~~(W-V*100.29100036621094-X*208.1199951171875)>>8;t=~~(W+X*408.5830078125)>>8;Z=(Z|0)>0?Z:0;b=(($((x|0)/(K|0)|0,f)|0)+((w|0)/(L|0)|0)|0)*3|0;s=p+(b<<2)|0;c[s>>2]=((Z|0)<255?Z:255)+(c[s>>2]|0);Y=(Y|0)>0?Y:0;s=p+(b+1<<2)|0;c[s>>2]=((Y|0)<255?Y:255)+(c[s>>2]|0);t=(t|0)>0?t:0;b=p+(b+2<<2)|0;c[b>>2]=((t|0)<255?t:255)+(c[b>>2]|0)}w=w+1|0}while((w|0)<(O|0))}x=x+1|0}while((x|0)<(M|0))}break}case 8:{y=u+100.0;z=+(M|0);A=+(O|0);B=P+48|0;C=P+56|0;n=P+64|0;D=P+8|0;E=P+16|0;F=P+24|0;G=P+32|0;H=P+40|0;j=(b|0)==1;if((M|0)>0){e=(O|0)>0;x=0;do{v=y+J*(+(x|0)+.5)/z;if(e){w=0;do{u=y+J*(+(w|0)+.5)/A;q=+h[n>>3]+(+h[B>>3]*u+v*+h[C>>3]);if(q==0.0){S=278;break a}X=(+h[E>>3]+(u*+h[P>>3]+v*+h[D>>3]))/q;g[Q>>2]=X;u=(+h[H>>3]+(u*+h[F>>3]+v*+h[G>>3]))/q;g[R>>2]=u;lf(o,X,u,Q,R)|0;u=+g[Q>>2];if(j){s=((~~(u+1.0)|0)/2|0)<<1;t=((~~(+g[R>>2]+1.0)|0)/2|0)<<1}else{s=~~(u+.5);t=~~(+g[R>>2]+.5)}if((s|0)>-1?(t|0)<(m|0)&((t|0)>-1&(s|0)<(l|0)):0){t=$(t,l)|0;Y=(s&65534)+t<<1;V=+((d[k+(Y|1)>>0]|0)+-128|0);X=+((d[k+(Y+3)>>0]|0)+-128|0);W=+((d[k+(t+s<<1)>>0]|0)+-16|0)*298.0820007324219;s=~~(W+V*516.4110107421875)>>8;t=~~(W-V*100.29100036621094-X*208.1199951171875)>>8;Y=~~(W+X*408.5830078125)>>8;s=(s|0)>0?s:0;Z=(($((x|0)/(K|0)|0,f)|0)+((w|0)/(L|0)|0)|0)*3|0;b=p+(Z<<2)|0;c[b>>2]=((s|0)<255?s:255)+(c[b>>2]|0);t=(t|0)>0?t:0;b=p+(Z+1<<2)|0;c[b>>2]=((t|0)<255?t:255)+(c[b>>2]|0);Y=(Y|0)>0?Y:0;Z=p+(Z+2<<2)|0;c[Z>>2]=((Y|0)<255?Y:255)+(c[Z>>2]|0)}w=w+1|0}while((w|0)<(O|0))}x=x+1|0}while((x|0)<(M|0))}break}case 9:{y=u+100.0;z=+(M|0);A=+(O|0);B=P+48|0;C=P+56|0;n=P+64|0;D=P+8|0;E=P+16|0;F=P+24|0;G=P+32|0;H=P+40|0;j=(b|0)==1;if((M|0)>0){e=(O|0)>0;x=0;do{v=y+J*(+(x|0)+.5)/z;if(e){w=0;do{u=y+J*(+(w|0)+.5)/A;q=+h[n>>3]+(+h[B>>3]*u+v*+h[C>>3]);if(q==0.0){S=278;break a}X=(+h[E>>3]+(u*+h[P>>3]+v*+h[D>>3]))/q;g[Q>>2]=X;u=(+h[H>>3]+(u*+h[F>>3]+v*+h[G>>3]))/q;g[R>>2]=u;lf(o,X,u,Q,R)|0;u=+g[Q>>2];if(j){s=((~~(u+1.0)|0)/2|0)<<1;t=((~~(+g[R>>2]+1.0)|0)/2|0)<<1}else{s=~~(u+.5);t=~~(+g[R>>2]+.5)}if((s|0)>-1?(t|0)<(m|0)&((t|0)>-1&(s|0)<(l|0)):0){Y=($(t,l)|0)+s<<1;t=d[k+(Y|1)>>0]|0;Z=(($((x|0)/(K|0)|0,f)|0)+((w|0)/(L|0)|0)|0)*3|0;b=p+(Z<<2)|0;c[b>>2]=(t<<3&248|4)+(c[b>>2]|0);Y=d[k+Y>>0]|0;b=p+(Z+1<<2)|0;c[b>>2]=(Y<<5&224|t>>>3&28|2)+(c[b>>2]|0);Z=p+(Z+2<<2)|0;c[Z>>2]=(Y&248|4)+(c[Z>>2]|0)}w=w+1|0}while((w|0)<(O|0))}x=x+1|0}while((x|0)<(M|0))}break}case 10:{y=u+100.0;z=+(M|0);A=+(O|0);B=P+48|0;C=P+56|0;n=P+64|0;D=P+8|0;E=P+16|0;F=P+24|0;G=P+32|0;H=P+40|0;j=(b|0)==1;if((M|0)>0){e=(O|0)>0;x=0;do{v=y+J*(+(x|0)+.5)/z;if(e){w=0;do{u=y+J*(+(w|0)+.5)/A;q=+h[n>>3]+(+h[B>>3]*u+v*+h[C>>3]);if(q==0.0){S=278;break a}X=(+h[E>>3]+(u*+h[P>>3]+v*+h[D>>3]))/q;g[Q>>2]=X;u=(+h[H>>3]+(u*+h[F>>3]+v*+h[G>>3]))/q;g[R>>2]=u;lf(o,X,u,Q,R)|0;u=+g[Q>>2];if(j){s=((~~(u+1.0)|0)/2|0)<<1;t=((~~(+g[R>>2]+1.0)|0)/2|0)<<1}else{s=~~(u+.5);t=~~(+g[R>>2]+.5)}if((s|0)>-1?(t|0)<(m|0)&((t|0)>-1&(s|0)<(l|0)):0){Y=($(t,l)|0)+s<<1;t=d[k+(Y|1)>>0]|0;Z=(($((x|0)/(K|0)|0,f)|0)+((w|0)/(L|0)|0)|0)*3|0;b=p+(Z<<2)|0;c[b>>2]=(t<<2&248|4)+(c[b>>2]|0);Y=d[k+Y>>0]|0;b=p+(Z+1<<2)|0;c[b>>2]=(Y<<5&224|t>>>3&24|4)+(c[b>>2]|0);Z=p+(Z+2<<2)|0;c[Z>>2]=(Y&248|4)+(c[Z>>2]|0)}w=w+1|0}while((w|0)<(O|0))}x=x+1|0}while((x|0)<(M|0))}break}case 11:{y=u+100.0;z=+(M|0);A=+(O|0);B=P+48|0;C=P+56|0;n=P+64|0;D=P+8|0;E=P+16|0;F=P+24|0;G=P+32|0;H=P+40|0;j=(b|0)==1;if((M|0)>0){e=(O|0)>0;x=0;do{v=y+J*(+(x|0)+.5)/z;if(e){w=0;do{u=y+J*(+(w|0)+.5)/A;q=+h[n>>3]+(+h[B>>3]*u+v*+h[C>>3]);if(q==0.0){S=278;break a}X=(+h[E>>3]+(u*+h[P>>3]+v*+h[D>>3]))/q;g[Q>>2]=X;u=(+h[H>>3]+(u*+h[F>>3]+v*+h[G>>3]))/q;g[R>>2]=u;lf(o,X,u,Q,R)|0;u=+g[Q>>2];if(j){s=((~~(u+1.0)|0)/2|0)<<1;t=((~~(+g[R>>2]+1.0)|0)/2|0)<<1}else{s=~~(u+.5);t=~~(+g[R>>2]+.5)}if((s|0)>-1?(t|0)<(m|0)&((t|0)>-1&(s|0)<(l|0)):0){Y=($(t,l)|0)+s<<1;Z=(($((x|0)/(K|0)|0,f)|0)+((w|0)/(L|0)|0)|0)*3|0;b=p+(Z<<2)|0;c[b>>2]=(c[b>>2]|0)+((d[k+(Y|1)>>0]|0)&240|8);Y=d[k+Y>>0]|0;b=p+(Z+1<<2)|0;c[b>>2]=(Y<<4&240|8)+(c[b>>2]|0);Z=p+(Z+2<<2)|0;c[Z>>2]=(Y&240|8)+(c[Z>>2]|0)}w=w+1|0}while((w|0)<(O|0))}x=x+1|0}while((x|0)<(M|0))}break}default:{Me(3,4615,C);S=278;break a}}while(0);t=$(K,L)|0;if(N){s=0;do{a[r+s>>0]=((c[p+(s<<2)>>2]|0)>>>0)/(t>>>0)|0;s=s+1|0}while((s|0)<(I|0))}Vj(p);p=0}else{p=Wj(N,4)|0;if(!p){Me(3,5472,w);rb(1)}b:do if(n>>>0<2){y=u+100.0;z=+(M|0);A=+(O|0);B=P+48|0;C=P+56|0;n=P+64|0;D=P+8|0;E=P+16|0;F=P+24|0;G=P+32|0;H=P+40|0;j=(b|0)==1;if((M|0)>0){e=(O|0)>0;x=0;do{v=y+J*(+(x|0)+.5)/z;if(e){w=0;do{u=y+J*(+(w|0)+.5)/A;q=+h[n>>3]+(+h[B>>3]*u+v*+h[C>>3]);if(q==0.0){S=278;break a}X=(+h[E>>3]+(u*+h[P>>3]+v*+h[D>>3]))/q;g[Q>>2]=X;u=(+h[H>>3]+(u*+h[F>>3]+v*+h[G>>3]))/q;g[R>>2]=u;lf(o,X,u,Q,R)|0;u=+g[Q>>2];if(j){s=((~~(u+1.0)|0)/2|0)<<1;t=((~~(+g[R>>2]+1.0)|0)/2|0)<<1}else{s=~~(u+.5);t=~~(+g[R>>2]+.5)}if((s|0)>-1?(t|0)<(m|0)&((t|0)>-1&(s|0)<(l|0)):0){Y=(($(t,l)|0)+s|0)*3|0;Z=p+(($((x|0)/(K|0)|0,f)|0)+((w|0)/(L|0)|0)<<2)|0;c[Z>>2]=(c[Z>>2]|0)+((((d[k+(Y+1)>>0]|0)+(d[k+Y>>0]|0)+(d[k+(Y+2)>>0]|0)|0)>>>0)/3|0)}w=w+1|0}while((w|0)<(O|0))}x=x+1|0}while((x|0)<(M|0))}}else{if((n&-2|0)==2){y=u+100.0;z=+(M|0);A=+(O|0);B=P+48|0;C=P+56|0;n=P+64|0;D=P+8|0;E=P+16|0;F=P+24|0;G=P+32|0;H=P+40|0;j=(b|0)==1;if((M|0)<=0)break;e=(O|0)>0;x=0;while(1){v=y+J*(+(x|0)+.5)/z;if(e){w=0;do{u=y+J*(+(w|0)+.5)/A;q=+h[n>>3]+(+h[B>>3]*u+v*+h[C>>3]);if(q==0.0){S=278;break a}X=(+h[E>>3]+(u*+h[P>>3]+v*+h[D>>3]))/q;g[Q>>2]=X;u=(+h[H>>3]+(u*+h[F>>3]+v*+h[G>>3]))/q;g[R>>2]=u;lf(o,X,u,Q,R)|0;u=+g[Q>>2];if(j){s=((~~(u+1.0)|0)/2|0)<<1;t=((~~(+g[R>>2]+1.0)|0)/2|0)<<1}else{s=~~(u+.5);t=~~(+g[R>>2]+.5)}if((s|0)>-1?(t|0)<(m|0)&((t|0)>-1&(s|0)<(l|0)):0){Y=($(t,l)|0)+s<<2;Z=p+(($((x|0)/(K|0)|0,f)|0)+((w|0)/(L|0)|0)<<2)|0;c[Z>>2]=(c[Z>>2]|0)+((((d[k+(Y|1)>>0]|0)+(d[k+Y>>0]|0)+(d[k+(Y|2)>>0]|0)|0)>>>0)/3|0)}w=w+1|0}while((w|0)<(O|0))}x=x+1|0;if((x|0)>=(M|0))break b}}if((n&-3|0)==4){y=u+100.0;z=+(M|0);A=+(O|0);B=P+48|0;C=P+56|0;n=P+64|0;D=P+8|0;E=P+16|0;F=P+24|0;G=P+32|0;H=P+40|0;j=(b|0)==1;if((M|0)<=0)break;e=(O|0)>0;x=0;while(1){v=y+J*(+(x|0)+.5)/z;if(e){w=0;do{u=y+J*(+(w|0)+.5)/A;q=+h[n>>3]+(+h[B>>3]*u+v*+h[C>>3]);if(q==0.0){S=278;break a}X=(+h[E>>3]+(u*+h[P>>3]+v*+h[D>>3]))/q;g[Q>>2]=X;u=(+h[H>>3]+(u*+h[F>>3]+v*+h[G>>3]))/q;g[R>>2]=u;lf(o,X,u,Q,R)|0;u=+g[Q>>2];if(j){s=((~~(u+1.0)|0)/2|0)<<1;t=((~~(+g[R>>2]+1.0)|0)/2|0)<<1}else{s=~~(u+.5);t=~~(+g[R>>2]+.5)}if((s|0)>-1?(t|0)<(m|0)&((t|0)>-1&(s|0)<(l|0)):0){Y=($(t,l)|0)+s<<2;Z=p+(($((x|0)/(K|0)|0,f)|0)+((w|0)/(L|0)|0)<<2)|0;c[Z>>2]=(c[Z>>2]|0)+((((d[k+(Y|2)>>0]|0)+(d[k+(Y|1)>>0]|0)+(d[k+(Y|3)>>0]|0)|0)>>>0)/3|0)}w=w+1|0}while((w|0)<(O|0))}x=x+1|0;if((x|0)>=(M|0))break b}}switch(n|0){case 5:case 12:case 13:case 14:{y=u+100.0;z=+(M|0);A=+(O|0);B=P+48|0;C=P+56|0;n=P+64|0;D=P+8|0;E=P+16|0;F=P+24|0;G=P+32|0;H=P+40|0;j=(b|0)==1;if((M|0)<=0)break b;e=(O|0)>0;x=0;do{v=y+J*(+(x|0)+.5)/z;if(e){w=0;do{u=y+J*(+(w|0)+.5)/A;q=+h[n>>3]+(+h[B>>3]*u+v*+h[C>>3]);if(q==0.0){S=278;break a}X=(+h[E>>3]+(u*+h[P>>3]+v*+h[D>>3]))/q;g[Q>>2]=X;u=(+h[H>>3]+(u*+h[F>>3]+v*+h[G>>3]))/q;g[R>>2]=u;lf(o,X,u,Q,R)|0;u=+g[Q>>2];if(j){s=((~~(u+1.0)|0)/2|0)<<1;t=((~~(+g[R>>2]+1.0)|0)/2|0)<<1}else{s=~~(u+.5);t=~~(+g[R>>2]+.5)}if((s|0)>-1?(t|0)<(m|0)&((t|0)>-1&(s|0)<(l|0)):0){Y=d[k+(($(t,l)|0)+s)>>0]|0;Z=p+(($((x|0)/(K|0)|0,f)|0)+((w|0)/(L|0)|0)<<2)|0;c[Z>>2]=(c[Z>>2]|0)+Y}w=w+1|0}while((w|0)<(O|0))}x=x+1|0}while((x|0)<(M|0));break}case 7:{y=u+100.0;z=+(M|0);A=+(O|0);B=P+48|0;C=P+56|0;n=P+64|0;D=P+8|0;E=P+16|0;F=P+24|0;G=P+32|0;H=P+40|0;j=(b|0)==1;if((M|0)<=0)break b;e=(O|0)>0;x=0;do{v=y+J*(+(x|0)+.5)/z;if(e){w=0;do{u=y+J*(+(w|0)+.5)/A;q=+h[n>>3]+(+h[B>>3]*u+v*+h[C>>3]);if(q==0.0){S=278;break a}X=(+h[E>>3]+(u*+h[P>>3]+v*+h[D>>3]))/q;g[Q>>2]=X;u=(+h[H>>3]+(u*+h[F>>3]+v*+h[G>>3]))/q;g[R>>2]=u;lf(o,X,u,Q,R)|0;u=+g[Q>>2];if(j){s=((~~(u+1.0)|0)/2|0)<<1;t=((~~(+g[R>>2]+1.0)|0)/2|0)<<1}else{s=~~(u+.5);t=~~(+g[R>>2]+.5)}if((s|0)>-1?(t|0)<(m|0)&((t|0)>-1&(s|0)<(l|0)):0){Y=d[k+(($(t,l)|0)+s<<1|1)>>0]|0;Z=p+(($((x|0)/(K|0)|0,f)|0)+((w|0)/(L|0)|0)<<2)|0;c[Z>>2]=(c[Z>>2]|0)+Y}w=w+1|0}while((w|0)<(O|0))}x=x+1|0}while((x|0)<(M|0));break}case 8:{y=u+100.0;z=+(M|0);A=+(O|0);B=P+48|0;C=P+56|0;n=P+64|0;D=P+8|0;E=P+16|0;F=P+24|0;G=P+32|0;H=P+40|0;j=(b|0)==1;if((M|0)<=0)break b;e=(O|0)>0;x=0;do{v=y+J*(+(x|0)+.5)/z;if(e){w=0;do{u=y+J*(+(w|0)+.5)/A;q=+h[n>>3]+(+h[B>>3]*u+v*+h[C>>3]);if(q==0.0){S=278;break a}X=(+h[E>>3]+(u*+h[P>>3]+v*+h[D>>3]))/q;g[Q>>2]=X;u=(+h[H>>3]+(u*+h[F>>3]+v*+h[G>>3]))/q;g[R>>2]=u;lf(o,X,u,Q,R)|0;u=+g[Q>>2];if(j){s=((~~(u+1.0)|0)/2|0)<<1;t=((~~(+g[R>>2]+1.0)|0)/2|0)<<1}else{s=~~(u+.5);t=~~(+g[R>>2]+.5)}if((s|0)>-1?(t|0)<(m|0)&((t|0)>-1&(s|0)<(l|0)):0){Y=d[k+(($(t,l)|0)+s<<1)>>0]|0;Z=p+(($((x|0)/(K|0)|0,f)|0)+((w|0)/(L|0)|0)<<2)|0;c[Z>>2]=(c[Z>>2]|0)+Y}w=w+1|0}while((w|0)<(O|0))}x=x+1|0}while((x|0)<(M|0));break}case 9:{y=u+100.0;z=+(M|0);A=+(O|0);B=P+48|0;C=P+56|0;n=P+64|0;D=P+8|0;E=P+16|0;F=P+24|0;G=P+32|0;H=P+40|0;j=(b|0)==1;if((M|0)<=0)break b;e=(O|0)>0;x=0;do{v=y+J*(+(x|0)+.5)/z;if(e){w=0;do{u=y+J*(+(w|0)+.5)/A;q=+h[n>>3]+(+h[B>>3]*u+v*+h[C>>3]);if(q==0.0){S=278;break a}X=(+h[E>>3]+(u*+h[P>>3]+v*+h[D>>3]))/q;g[Q>>2]=X;u=(+h[H>>3]+(u*+h[F>>3]+v*+h[G>>3]))/q;g[R>>2]=u;lf(o,X,u,Q,R)|0;u=+g[Q>>2];if(j){s=((~~(u+1.0)|0)/2|0)<<1;t=((~~(+g[R>>2]+1.0)|0)/2|0)<<1}else{s=~~(u+.5);t=~~(+g[R>>2]+.5)}if((s|0)>-1?(t|0)<(m|0)&((t|0)>-1&(s|0)<(l|0)):0){Y=($(t,l)|0)+s<<1;I=d[k+Y>>0]|0;Y=d[k+(Y|1)>>0]|0;Z=p+(($((x|0)/(K|0)|0,f)|0)+((w|0)/(L|0)|0)<<2)|0;c[Z>>2]=(c[Z>>2]|0)+((((Y<<3&248|4)+(I&248|4)+(I<<5&224|Y>>>3&28|2)|0)>>>0)/3|0)}w=w+1|0}while((w|0)<(O|0))}x=x+1|0}while((x|0)<(M|0));break}case 10:{y=u+100.0;z=+(M|0);A=+(O|0);B=P+48|0;C=P+56|0;n=P+64|0;D=P+8|0;E=P+16|0;F=P+24|0;G=P+32|0;H=P+40|0;j=(b|0)==1;if((M|0)<=0)break b;e=(O|0)>0;x=0;do{v=y+J*(+(x|0)+.5)/z;if(e){w=0;do{u=y+J*(+(w|0)+.5)/A;q=+h[n>>3]+(+h[B>>3]*u+v*+h[C>>3]);if(q==0.0){S=278;break a}X=(+h[E>>3]+(u*+h[P>>3]+v*+h[D>>3]))/q;g[Q>>2]=X;u=(+h[H>>3]+(u*+h[F>>3]+v*+h[G>>3]))/q;g[R>>2]=u;lf(o,X,u,Q,R)|0;u=+g[Q>>2];if(j){s=((~~(u+1.0)|0)/2|0)<<1;t=((~~(+g[R>>2]+1.0)|0)/2|0)<<1}else{s=~~(u+.5);t=~~(+g[R>>2]+.5)}if((s|0)>-1?(t|0)<(m|0)&((t|0)>-1&(s|0)<(l|0)):0){Y=($(t,l)|0)+s<<1;I=d[k+Y>>0]|0;Y=d[k+(Y|1)>>0]|0;Z=p+(($((x|0)/(K|0)|0,f)|0)+((w|0)/(L|0)|0)<<2)|0;c[Z>>2]=(c[Z>>2]|0)+((((Y<<2&248|4)+(I&248|4)+(I<<5&224|Y>>>3&24|4)|0)>>>0)/3|0)}w=w+1|0}while((w|0)<(O|0))}x=x+1|0}while((x|0)<(M|0));break}case 11:{y=u+100.0;z=+(M|0);A=+(O|0);B=P+48|0;C=P+56|0;n=P+64|0;D=P+8|0;E=P+16|0;F=P+24|0;G=P+32|0;H=P+40|0;j=(b|0)==1;if((M|0)<=0)break b;e=(O|0)>0;x=0;do{v=y+J*(+(x|0)+.5)/z;if(e){w=0;do{u=y+J*(+(w|0)+.5)/A;q=+h[n>>3]+(+h[B>>3]*u+v*+h[C>>3]);if(q==0.0){S=278;break a}X=(+h[E>>3]+(u*+h[P>>3]+v*+h[D>>3]))/q;g[Q>>2]=X;u=(+h[H>>3]+(u*+h[F>>3]+v*+h[G>>3]))/q;g[R>>2]=u;lf(o,X,u,Q,R)|0;u=+g[Q>>2];if(j){s=((~~(u+1.0)|0)/2|0)<<1;t=((~~(+g[R>>2]+1.0)|0)/2|0)<<1}else{s=~~(u+.5);t=~~(+g[R>>2]+.5)}if((s|0)>-1?(t|0)<(m|0)&((t|0)>-1&(s|0)<(l|0)):0){Y=($(t,l)|0)+s<<1;I=d[k+Y>>0]|0;Z=p+(($((x|0)/(K|0)|0,f)|0)+((w|0)/(L|0)|0)<<2)|0;c[Z>>2]=(c[Z>>2]|0)+((((I<<4&240|8)+(I&240|8)+((d[k+(Y|1)>>0]|0)&240|8)|0)>>>0)/3|0)}w=w+1|0}while((w|0)<(O|0))}x=x+1|0}while((x|0)<(M|0));break}default:{Me(3,4615,x);S=278;break a}}}while(0);s=$(K,L)|0;if(N){t=0;do{a[r+t>>0]=((c[p+(t<<2)>>2]|0)>>>0)/(s>>>0)|0;t=t+1|0}while((t|0)<(N|0))}Vj(p);p=0}while(0);if((S|0)==278){Vj(p);p=-1}i=T;return p|0}function Fe(b,e,f,g,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;v=i;i=i+32|0;p=v+24|0;o=v+8|0;u=v;a:do if((e+-3|0)>>>0>5){c[f>>2]=-1;c[g>>2]=0;h[j>>3]=-1.0;m=-1}else{c[o>>2]=0;t=e+-1|0;c[o+4>>2]=$(t,e)|0;r=$(e,e)|0;c[o+8>>2]=r+-1;c[o+12>>2]=t;n=a[b+(c[o>>2]|0)>>0]|0;m=(n&255)>0?n:0;n=(n&255)<255?n:-1;s=a[b+(c[o+4>>2]|0)>>0]|0;m=(s&255)>(m&255)?s:m;n=(s&255)<(n&255)?s:n;s=a[b+(c[o+8>>2]|0)>>0]|0;m=(s&255)>(m&255)?s:m;n=(s&255)<(n&255)?s:n;s=a[b+(c[o+12>>2]|0)>>0]|0;m=((s&255)>(m&255)?s:m)&255;n=((s&255)<(n&255)?s:n)&255;if((m-n|0)<30){c[f>>2]=-1;c[g>>2]=0;h[j>>3]=-1.0;m=-2;break}q=(m+n|0)>>>1;a[p>>0]=(d[b+(c[o>>2]|0)>>0]|0)>>>0<q>>>0&1;a[p+1>>0]=(d[b+(c[o+4>>2]|0)>>0]|0)>>>0<q>>>0&1;a[p+2>>0]=(d[b+(c[o+8>>2]|0)>>0]|0)>>>0<q>>>0&1;a[p+3>>0]=(d[b+(c[o+12>>2]|0)>>0]|0)>>>0<q>>>0&1;n=0;while(1){m=n+1|0;if(((a[p+n>>0]|0)==1?(a[p+((m|0)%4|0)>>0]|0)==1:0)?(a[p+((n+2|0)%4|0)>>0]|0)==0:0){m=n;n=10;break}if((m|0)<4)n=m;else{n=12;break}}if((n|0)==10)c[g>>2]=m;else if((n|0)==12?(m|0)==4:0){c[f>>2]=-1;c[g>>2]=0;h[j>>3]=-1.0;m=-3;break}if(!r)s=255;else{m=255;n=0;do{s=b+n|0;p=d[s>>0]|0;o=p-q|0;o=(o|0)<0?0-o|0:o;m=(o|0)<(m|0)?o:m;a[s>>0]=p>>>0<q>>>0&1;n=n+1|0}while((n|0)<(r|0));s=m}switch(c[g>>2]|0){case 0:{if((e|0)>0){r=(e|0)==0;n=0;m=0;g=0;do{p=(g|0)==(t|0);q=$(g,e)|0;if(!r){o=0;do{if((o|g|0)!=0?!(p&((o|0)==0|(o|0)==(t|0))):0){n=fk(n|0,m|0,1)|0;n=(a[b+(o+q)>>0]|0)!=0|n;m=D}o=o+1|0}while((o|0)!=(e|0))}g=g+1|0}while((g|0)<(e|0))}else{n=0;m=0}break}case 1:{if((e|0)>0){r=(e|0)>0;n=0;m=0;g=0;do{p=(g|0)==0;q=(g|0)==(t|0);if(r){o=t;while(1){w=(o|0)==(t|0);if(!(p&w)?!(q&(w|(o|0)==0)):0){n=fk(n|0,m|0,1)|0;n=(a[b+(($(o,e)|0)+g)>>0]|0)!=0|n;m=D}if((o|0)>0)o=o+-1|0;else break}}g=g+1|0}while((g|0)<(e|0))}else{n=0;m=0}break}case 2:{if((e|0)>0){r=(e|0)>0;n=0;m=0;g=t;while(1){q=(g|0)==(t|0)|(g|0)==0;p=$(g,e)|0;if(r){o=t;while(1){if(!(q&(o|0)==(t|0)|(o|g|0)==0)){n=fk(n|0,m|0,1)|0;n=(a[b+(o+p)>>0]|0)!=0|n;m=D}if((o|0)>0)o=o+-1|0;else break}}if((g|0)>0)g=g+-1|0;else break}}else{n=0;m=0}break}case 3:{if((e|0)>0){r=(e|0)>0;n=0;m=0;g=t;while(1){p=(g|0)==(t|0);q=(g|0)==0;if(r){o=0;do{if(!(p&(o|0)==0|(o|g|0)==0|q&(o|0)==(t|0))){n=fk(n|0,m|0,1)|0;n=(a[b+(($(o,e)|0)+g)>>0]|0)!=0|n;m=D}o=o+1|0}while((o|0)<(e|0))}if((g|0)>0)g=g+-1|0;else break}}else{n=0;m=0}break}default:{n=0;m=0}}h[j>>3]=(s|0)>30?1.0:+(s|0)/30.0;switch(k|0){case 259:{w=a[4551+n>>0]|0;k=w<<24>>24;l=u;c[l>>2]=k;c[l+4>>2]=((k|0)<0)<<31>>31;if(w<<24>>24<0){c[f>>2]=-1;h[j>>3]=-1.0;m=-4;break a}break}case 515:{m=a[4423+n>>0]|0;k=m<<24>>24;w=u;c[w>>2]=k;c[w+4>>2]=((k|0)<0)<<31>>31;if(l)c[l>>2]=d[4487+n>>0];if(m<<24>>24<0){c[f>>2]=-1;h[j>>3]=-1.0;m=-4;break a}break}case 772:case 1028:{m=Ie(k,n,m,0,u)|0;if((m|0)<0){c[f>>2]=-1;h[j>>3]=-1.0;m=-4;break a}if((l|0)!=0&(m|0)>0)c[l>>2]=m;break}default:{w=u;c[w>>2]=n;c[w+4>>2]=m}}c[f>>2]=c[u>>2];m=0}while(0);i=v;return m|0}function Ge(a,b,e,f,g,j,k){a=a|0;b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0.0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0.0,z=0,A=0,B=0,C=0,D=0.0;C=i;i=i+16|0;l=C+8|0;n=C;a:do if(!a){c[g>>2]=0;c[j>>2]=0;h[k>>3]=-1.0;b=-1}else switch(b|0){case 0:{o=$(f,f)|0;z=o*3|0;A=Uj(o*12|0)|0;if(!A){Me(3,5472,n);rb(1)}if(!o)b=0;else{b=0;l=0;do{b=((d[e+l>>0]|0)^255)+b|0;l=l+1|0}while((l|0)<(z|0))}l=(b|0)/(z|0)|0;if(!o)m=0.0;else{n=0;b=0;do{x=((d[e+n>>0]|0)^255)-l|0;c[A+(n<<2)>>2]=x;b=($(x,x)|0)+b|0;n=n+1|0}while((n|0)<(z|0));m=+(b|0)}y=+P(+m);if(y/(+(f|0)*1.7320508)<15.0){c[g>>2]=0;c[j>>2]=0;h[k>>3]=-1.0;Vj(A);b=-2;break a}v=c[a>>2]|0;w=a+12|0;x=a+16|0;if((v|0)>0){u=c[a+8>>2]|0;s=(o|0)==0;n=-1;t=0;m=0.0;l=-1;b=-1;do{b:while(1){n=n+1|0;switch(c[u+(n<<2)>>2]|0){case 0:break;case 2:break b;default:{B=17;break b}}}if((B|0)==17){B=0;p=n<<2;q=c[x>>2]|0;r=0;do{a=r+p|0;if(s)o=0;else{e=c[(c[w>>2]|0)+(a<<2)>>2]|0;f=0;o=0;do{o=($(c[e+(f<<2)>>2]|0,c[A+(f<<2)>>2]|0)|0)+o|0;f=f+1|0}while((f|0)<(z|0))}D=+(o|0)/+h[q+(a<<3)>>3]/y;a=D>m;l=a?r:l;b=a?n:b;m=a?D:m;r=r+1|0}while((r|0)!=4)}t=t+1|0}while((t|0)<(v|0))}else{m=0.0;l=-1;b=-1}c[j>>2]=l;c[g>>2]=b;h[k>>3]=m;Vj(A);b=0;break a}case 1:{z=$(f,f)|0;A=Uj(z<<2)|0;if(!A){Me(3,5472,l);rb(1)}if(!z)b=0;else{b=0;l=0;do{b=((d[e+l>>0]|0)^255)+b|0;l=l+1|0}while((l|0)<(z|0))}l=(b|0)/(z|0)|0;if(!z)m=0.0;else{n=0;b=0;do{x=((d[e+n>>0]|0)^255)-l|0;c[A+(n<<2)>>2]=x;b=($(x,x)|0)+b|0;n=n+1|0}while((n|0)<(z|0));m=+(b|0)}y=+P(+m);if(y/+(f|0)<15.0){c[g>>2]=0;c[j>>2]=0;h[k>>3]=-1.0;Vj(A);b=-2;break a}v=c[a>>2]|0;w=a+20|0;x=a+24|0;if((v|0)>0){s=c[a+8>>2]|0;t=(z|0)==0;n=-1;u=0;m=0.0;l=-1;b=-1;do{c:while(1){n=n+1|0;switch(c[s+(n<<2)>>2]|0){case 0:break;case 2:break c;default:{B=37;break c}}}if((B|0)==37){B=0;p=n<<2;q=c[x>>2]|0;r=0;do{a=r+p|0;if(t)o=0;else{e=c[(c[w>>2]|0)+(a<<2)>>2]|0;f=0;o=0;do{o=($(c[e+(f<<2)>>2]|0,c[A+(f<<2)>>2]|0)|0)+o|0;f=f+1|0}while((f|0)<(z|0))}D=+(o|0)/+h[q+(a<<3)>>3]/y;a=D>m;l=a?r:l;b=a?n:b;m=a?D:m;r=r+1|0}while((r|0)!=4)}u=u+1|0}while((u|0)<(v|0))}else{m=0.0;l=-1;b=-1}c[j>>2]=l;c[g>>2]=b;h[k>>3]=m;Vj(A);b=0;break a}default:{b=-1;break a}}while(0);i=C;return b|0}function He(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;e=Re(8,8)|0;f=Re(8,1)|0;g=Re(8,1)|0;i=c[e>>2]|0;j=c[f>>2]|0;k=0;do{p=a+(k<<4)|0;l=k<<4;h[i+(l<<3)>>3]=+h[p>>3];o=a+(k<<4)+8|0;h[i+((l|1)<<3)>>3]=+h[o>>3];h[i+((l|2)<<3)>>3]=1.0;h[i+((l|3)<<3)>>3]=0.0;h[i+((l|4)<<3)>>3]=0.0;h[i+((l|5)<<3)>>3]=0.0;n=b+(k<<4)|0;h[i+((l|6)<<3)>>3]=-(+h[p>>3]*+h[n>>3]);h[i+((l|7)<<3)>>3]=-(+h[o>>3]*+h[n>>3]);h[i+((l|8)<<3)>>3]=0.0;h[i+((l|9)<<3)>>3]=0.0;h[i+((l|10)<<3)>>3]=0.0;h[i+((l|11)<<3)>>3]=+h[p>>3];h[i+((l|12)<<3)>>3]=+h[o>>3];h[i+((l|13)<<3)>>3]=1.0;m=b+(k<<4)+8|0;h[i+((l|14)<<3)>>3]=-(+h[p>>3]*+h[m>>3]);h[i+((l|15)<<3)>>3]=-(+h[o>>3]*+h[m>>3]);l=k<<1;h[j+(l<<3)>>3]=+h[n>>3];h[j+((l|1)<<3)>>3]=+h[m>>3];k=k+1|0}while((k|0)!=4);_e(e)|0;Xe(g,e,f)|0;p=c[g>>2]|0;h[d>>3]=+h[p>>3];h[d+8>>3]=+h[p+8>>3];h[d+16>>3]=+h[p+16>>3];p=c[g>>2]|0;h[d+24>>3]=+h[p+24>>3];h[d+32>>3]=+h[p+32>>3];h[d+40>>3]=+h[p+40>>3];p=c[g>>2]|0;h[d+48>>3]=+h[p+48>>3];h[d+56>>3]=+h[p+56>>3];h[d+64>>3]=1.0;We(e)|0;We(f)|0;We(g)|0;return}function Ie(b,e,f,g,h){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,E=0,F=0,G=0,H=0,I=0;I=i;i=i+2320|0;k=I+2304|0;y=I+864|0;u=I+784|0;H=I+704|0;w=I+624|0;v=I+548|0;G=I+40|0;E=I;switch(b|0){case 772:{g=9;j=1;l=3;break}case 1028:{g=5;j=2;l=3;break}case 2830:{A=900;s=1472;C=64;F=120;z=127;B=g;j=9;l=6;break}default:f=-1}if((l|0)==3){b=0;while(1){a[k+b>>0]=e&1;e=hk(e|0,f|0,1)|0;b=b+1|0;if((b|0)==13)break;else f=D}A=840;s=1408;C=g;F=13;z=15;B=k;l=6}do if((l|0)==6){r=j<<1;k=1;f=0;while(1){g=v+(k<<2)|0;c[g>>2]=0;b=0;e=0;do{if(a[B+e>>0]|0){b=b^c[A+((($(e,k)|0)%(z|0)|0)<<2)>>2];c[g>>2]=b}e=e+1|0}while((e|0)<(F|0));f=(b|0)==0?f:1;c[g>>2]=c[s+(b<<2)>>2];if((k|0)<(r|0))k=k+1|0;else break}x=(f|0)!=0;if(x){c[u>>2]=0;f=c[v+4>>2]|0;c[u+4>>2]=f;c[y>>2]=0;c[y+72>>2]=1;if((r|0)>1){b=1;do{c[y+(b<<2)>>2]=-1;c[y+72+(b<<2)>>2]=0;b=b+1|0}while((b|0)<(r|0))}c[H>>2]=0;c[H+4>>2]=0;c[w>>2]=-1;c[w+4>>2]=0;p=0;q=0;while(1){g=q;q=q+1|0;o=u+(q<<2)|0;if((f|0)==-1){k=g+2|0;c[H+(k<<2)>>2]=p;if((p|0)<0)n=p;else{f=0;while(1){o=y+(q*72|0)+(f<<2)|0;n=c[o>>2]|0;c[y+(k*72|0)+(f<<2)>>2]=n;c[o>>2]=c[s+(n<<2)>>2];if((f|0)<(p|0))f=f+1|0;else{n=p;break}}}}else{b=g;while(1){f=(b|0)>0;if(f&(c[u+(b<<2)>>2]|0)==-1)b=b+-1|0;else break}if(f){e=b;do{f=e;e=e+-1|0;if((c[u+(e<<2)>>2]|0)!=-1)b=(c[w+(b<<2)>>2]|0)<(c[w+(e<<2)>>2]|0)?e:b}while((f|0)>1)}e=H+(b<<2)|0;m=q-b|0;n=m+(c[e>>2]|0)|0;k=g+2|0;n=(p|0)>(n|0)?p:n;c[H+(k<<2)>>2]=n;f=0;do{c[y+(k*72|0)+(f<<2)>>2]=0;f=f+1|0}while((f|0)<(r|0));f=c[e>>2]|0;e=u+(b<<2)|0;if((f|0)>=0){l=0;while(1){g=c[y+(b*72|0)+(l<<2)>>2]|0;if((g|0)!=-1)c[y+(k*72|0)+(m+l<<2)>>2]=c[A+(((g+z+(c[o>>2]|0)-(c[e>>2]|0)|0)%(z|0)|0)<<2)>>2];if((l|0)<(f|0))l=l+1|0;else break}}if((p|0)>=0){f=0;while(1){o=y+(q*72|0)+(f<<2)|0;m=c[o>>2]|0;l=y+(k*72|0)+(f<<2)|0;c[l>>2]=c[l>>2]^m;c[o>>2]=c[s+(m<<2)>>2];if((f|0)<(p|0))f=f+1|0;else break}}}c[w+(k<<2)>>2]=q-n;if((q|0)>=(r|0))break;f=c[v+(k<<2)>>2]|0;if((f|0)==-1)f=0;else f=c[A+(f<<2)>>2]|0;g=u+(k<<2)|0;c[g>>2]=f;if((n|0)>=1){e=1;while(1){b=c[v+(k-e<<2)>>2]|0;if((b|0)!=-1?(t=c[y+(k*72|0)+(e<<2)>>2]|0,(t|0)!=0):0){f=f^c[A+((((c[s+(t<<2)>>2]|0)+b|0)%(z|0)|0)<<2)>>2];c[g>>2]=f}if((e|0)<(n|0))e=e+1|0;else break}}f=c[s+(f<<2)>>2]|0;c[g>>2]=f;if((n|0)>(j|0))break;else p=n}if((n|0)>(j|0)){f=-1;break}if((n|0)>=0){f=0;while(1){w=y+(k*72|0)+(f<<2)|0;c[w>>2]=c[s+(c[w>>2]<<2)>>2];if((f|0)<(n|0))f=f+1|0;else break}}if((n|0)>=1){f=1;while(1){c[E+(f<<2)>>2]=c[y+(k*72|0)+(f<<2)>>2];if((f|0)<(n|0))f=f+1|0;else break}}l=(n|0)<1;f=0;m=1;do{if(l)b=1;else{j=1;b=1;while(1){e=E+(j<<2)|0;g=c[e>>2]|0;if((g|0)!=-1){y=(g+j|0)%(z|0)|0;c[e>>2]=y;b=c[A+(y<<2)>>2]^b}if((j|0)<(n|0))j=j+1|0;else break}}if(!b){c[G+(f<<2)>>2]=z-m;f=f+1|0}m=m+1|0}while((z|0)>=(m|0));if((f|0)!=(n|0)){f=-1;break}if((n|0)>0){f=0;do{E=B+(c[G+(f<<2)>>2]|0)|0;a[E>>0]=d[E>>0]^1;f=f+1|0}while((f|0)<(n|0))}}else k=0;b=h;c[b>>2]=0;c[b+4>>2]=0;b=1;e=0;g=0;j=0;f=F-C|0;while(1){G=ok(d[B+f>>0]|0,0,b|0,e|0)|0;g=gk(G|0,D|0,g|0,j|0)|0;j=D;G=h;c[G>>2]=g;c[G+4>>2]=j;b=fk(b|0,e|0,1)|0;f=f+1|0;if((f|0)>=(F|0))break;else e=D}if(x)f=c[H+(k<<2)>>2]|0;else f=0}while(0);i=I;return f|0}function Je(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0.0;A=i;i=i+32|0;z=A+24|0;g=A+16|0;d=A+8|0;do if(a){if(!b){Me(3,4674,d);d=-1;break}y=a+8|0;f=c[a+4>>2]|0;a:do if((f|0)>0){e=c[y>>2]|0;d=0;do{if(!(c[e+(d<<2)>>2]|0))break a;d=d+1|0}while((d|0)<(f|0))}else d=0;while(0);if((d|0)!=(f|0)){x=Aj(b)|0;if(!x){Me(3,4719,g);d=-1;break}r=a+28|0;s=d<<2;t=a+12|0;u=a+20|0;v=a+16|0;w=a+24|0;f=Gj(x,4742)|0;e=0;b:while(1){q=e+s|0;p=0;b=0;do{n=(p|0)==0;o=(p|0)==2;g=c[r>>2]|0;if((g|0)>0){m=0;do{if((g|0)>0){l=0;do{if(!f){e=17;break b}g=qj(f)|0;f=Gj(0,4742)|0;g=255-g|0;k=((($(c[r>>2]|0,m)|0)+l|0)*3|0)+p|0;c[(c[(c[t>>2]|0)+(q<<2)>>2]|0)+(k<<2)>>2]=g;k=($(c[r>>2]|0,m)|0)+l|0;j=c[(c[u>>2]|0)+(q<<2)>>2]|0;k=j+(k<<2)|0;if(!n){c[k>>2]=(c[k>>2]|0)+g;if(o){k=j+(($(c[r>>2]|0,m)|0)+l<<2)|0;c[k>>2]=(c[k>>2]|0)/3|0}}else c[k>>2]=g;b=g+b|0;l=l+1|0;g=c[r>>2]|0}while((l|0)<(g|0))}m=m+1|0}while((m|0)<(g|0))}p=p+1|0}while((p|0)<3);g=c[r>>2]|0;l=(b|0)/($(g*3|0,g)|0)|0;if(($(g*3|0,g)|0)>0){j=c[(c[t>>2]|0)+(q<<2)>>2]|0;k=0;b=0;do{p=j+(k<<2)|0;g=(c[p>>2]|0)-l|0;c[p>>2]=g;b=($(g,g)|0)+b|0;k=k+1|0;g=c[r>>2]|0}while((k|0)<($(g*3|0,g)|0))}else b=0;B=+P(+(+(b|0)));h[(c[v>>2]|0)+(q<<3)>>3]=B==0.0?1.0e-07:B;if(!($(g,g)|0))b=0;else{g=c[(c[u>>2]|0)+(q<<2)>>2]|0;j=0;b=0;do{o=g+(j<<2)|0;p=(c[o>>2]|0)-l|0;c[o>>2]=p;b=($(p,p)|0)+b|0;j=j+1|0;p=c[r>>2]|0}while((j|0)<($(p,p)|0))}B=+P(+(+(b|0)));h[(c[w>>2]|0)+(q<<3)>>3]=B==0.0?1.0e-07:B;e=e+1|0;if((e|0)>=4){e=32;break}}if((e|0)==17){Me(3,4747,z);Vj(x);d=-1;break}else if((e|0)==32){Vj(x);c[(c[y>>2]|0)+(d<<2)>>2]=1;c[a>>2]=(c[a>>2]|0)+1;break}}else d=-1}else{Me(3,4649,A);d=-1}while(0);i=A;return d|0}function Ke(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0;k=i;i=i+32|0;j=k+16|0;h=k+8|0;e=k;g=_i(d,4854)|0;do if(g){dj(g,0,2)|0;e=gj(g)|0;dj(g,0,0)|0;f=Uj(e+1|0)|0;if(!f){Me(3,5472,h);Wi(g)|0;e=-1;break}h=aj(f,e,1,g)|0;Wi(g)|0;if(!h){c[j>>2]=d;Me(3,4820,j);Vj(f);e=-1;break}else{a[f+e>>0]=0;e=Je(b,f)|0;Vj(f);break}}else{c[e>>2]=d;Me(3,4774,e);e=-1}while(0);i=k;return e|0}function Le(a,b){a=a|0;b=b|0;b=(c[a+8>>2]|0)+(b<<2)|0;if(!(c[b>>2]|0))b=-1;else{c[b>>2]=0;c[a>>2]=(c[a>>2]|0)+-1;b=1}return b|0}function Me(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;j=i;i=i+32|0;h=j+16|0;f=j;c[h>>2]=0;if(((d|0)!=0&(c[496]|0)<=(b|0)?(a[d>>0]|0)!=0:0)?(c[f>>2]=e,g=lj(h,d,f)|0,(g|0)>-1):0){f=c[497]|0;do if(f){if(!(c[498]|0)){Wb[f&15](c[h>>2]|0);break}e=gb()|0;b=c[500]|0;if((e|0)==(c[499]|0)){if((b|0)>0){Wb[f&15](c[502]|0);c[500]=0;f=c[497]|0}Wb[f&15](c[h>>2]|0);break}f=c[501]|0;if((b|0)<(f|0)){d=(c[502]|0)+b|0;if((g|0)<(-3-b+f|0)){yj(d,c[h>>2]|0)|0;c[500]=(c[500]|0)+g;break}else{a[d>>0]=46;a[d+1>>0]=46;a[d+2>>0]=46;a[d+3>>0]=0;c[500]=c[501];break}}}else $i(c[h>>2]|0,c[659]|0)|0;while(0);Vj(c[h>>2]|0)}i=j;return}function Ne(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,f=0,g=0,i=0;i=0;do{d=a+(i<<5)|0;e=a+(i<<5)+8|0;f=a+(i<<5)+16|0;g=0;do{h[c+(i<<5)+(g<<3)>>3]=+h[d>>3]*+h[b+(g<<3)>>3]+ +h[e>>3]*+h[b+32+(g<<3)>>3]+ +h[f>>3]*+h[b+64+(g<<3)>>3];g=g+1|0}while((g|0)!=4);g=c+(i<<5)+24|0;h[g>>3]=+h[a+(i<<5)+24>>3]+ +h[g>>3];i=i+1|0}while((i|0)!=3);return 0}function Oe(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,i=0,j=0,k=0;j=Re(4,4)|0;d=c[j>>2]|0;e=c[j>>2]|0;f=c[j>>2]|0;g=c[j>>2]|0;i=0;do{k=i<<2;h[d+(k<<3)>>3]=+h[a+(i<<5)>>3];h[e+(1+k<<3)>>3]=+h[a+(i<<5)+8>>3];h[f+(2+k<<3)>>3]=+h[a+(i<<5)+16>>3];h[g+(3+k<<3)>>3]=+h[a+(i<<5)+24>>3];i=i+1|0}while((i|0)!=3);d=c[j>>2]|0;e=d+96|0;c[e>>2]=0;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;c[e+16>>2]=0;c[e+20>>2]=0;h[d+120>>3]=1.0;_e(j)|0;d=c[j>>2]|0;e=c[j>>2]|0;f=c[j>>2]|0;g=c[j>>2]|0;i=0;do{k=i<<2;h[b+(i<<5)>>3]=+h[d+(k<<3)>>3];h[b+(i<<5)+8>>3]=+h[e+(1+k<<3)>>3];h[b+(i<<5)+16>>3]=+h[f+(2+k<<3)>>3];h[b+(i<<5)+24>>3]=+h[g+(3+k<<3)>>3];i=i+1|0}while((i|0)!=3);We(j)|0;return 0}function Pe(a){a=a|0;switch(a|0){case 1:case 0:{a=3;break}case 6:case 4:case 3:case 2:{a=4;break}case 14:case 13:case 12:case 5:{a=1;break}case 11:case 10:case 9:case 8:case 7:{a=2;break}default:a=0}return a|0}function Qe(b,c,d,e){b=b|0;c=c|0;d=d|0;e=e|0;var f=0;do if((b|0)!=0&(c|0)!=0&(d|0)!=0){f=Ej(c,47)|0;if(!f){a[b>>0]=0;break}f=f+((e|0)!=0&1)-c|0;if((f+1|0)>>>0<=d>>>0){Dj(b,c,f)|0;a[b+f>>0]=0}else b=0}else b=0;while(0);return b|0}function Re(a,b){a=a|0;b=b|0;var d=0,e=0;d=Uj(12)|0;do if(d){e=Uj($(a<<3,b)|0)|0;c[d>>2]=e;if(!e){Vj(d);d=0;break}else{c[d+4>>2]=a;c[d+8>>2]=b;break}}else d=0;while(0);return d|0}function Se(a){a=a|0;var b=0;b=Re(c[a+4>>2]|0,c[a+8>>2]|0)|0;if(b){if((Ve(b,a)|0)<0){We(b)|0;b=0}}else b=0;return b|0}function Te(a,b){a=a|0;b=b|0;var d=0;d=Re(c[a+4>>2]|0,c[b+8>>2]|0)|0;if(d){if((Xe(d,a,b)|0)<0){We(d)|0;d=0}}else d=0;return d|0}function Ue(a){a=a|0;var b=0;b=Re(c[a+8>>2]|0,c[a+4>>2]|0)|0;if(b){if(($e(b,a)|0)<0){We(b)|0;b=0}}else b=0;return b|0}function Ve(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,i=0,j=0,k=0,l=0,m=0;d=c[a+4>>2]|0;if((d|0)==(c[b+4>>2]|0)?(j=c[a+8>>2]|0,(j|0)==(c[b+8>>2]|0)):0)if((d|0)>0){e=(j|0)>0;l=0;do{f=$(j,l)|0;if(e){g=c[b>>2]|0;i=c[a>>2]|0;k=0;do{m=f+k|0;h[i+(m<<3)>>3]=+h[g+(m<<3)>>3];k=k+1|0}while((k|0)<(j|0))}l=l+1|0}while((l|0)<(d|0));d=0}else d=0;else d=-1;return d|0}function We(a){a=a|0;if(a){Vj(c[a>>2]|0);Vj(a)}return 0}function Xe(a,b,d){a=a|0;b=b|0;d=d|0;var e=0.0,f=0,g=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;n=c[b+8>>2]|0;if(((n|0)==(c[d+4>>2]|0)?(r=c[a+4>>2]|0,(r|0)==(c[b+4>>2]|0)):0)?(o=c[a+8>>2]|0,(o|0)==(c[d+8>>2]|0)):0){s=(o|0)>0?o:0;if((r|0)>0){p=(o|0)>0;q=(n|0)>0;k=c[a>>2]|0;m=0;while(1){a=$(n,m)|0;if(p){f=0;l=k;while(1){h[l>>3]=0.0;if(q){e=0.0;g=0;i=(c[b>>2]|0)+(a<<3)|0;j=(c[d>>2]|0)+(f<<3)|0;while(1){e=e+ +h[i>>3]*+h[j>>3];h[l>>3]=e;g=g+1|0;if((g|0)>=(n|0))break;else{i=i+8|0;j=j+(o<<3)|0}}}f=f+1|0;if((f|0)>=(o|0))break;else l=l+8|0}}m=m+1|0;if((m|0)>=(r|0)){a=0;break}else k=k+(s<<3)|0}}else a=0}else a=-1;return a|0}function Ye(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,i=0.0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0.0,s=0,t=0,u=0;q=c[a+4>>2]|0;s=c[a+8>>2]|0;f=(q|0)<(s|0)?q:s;a:do if(((((!((q|0)<2|(s|0)<2)?(c[b+8>>2]|0)==(s|0):0)?(c[b+4>>2]|0)==(f|0):0)?(t=d+4|0,(c[t>>2]|0)==(f|0)):0)?(g=e+4|0,(c[g>>2]|0)==(s|0)):0)?(u=Se(a)|0,(u|0)!=0):0){r=+P(+(+(q|0)));o=c[u+4>>2]|0;p=c[u+8>>2]|0;if(!((o|0)<1|(p|0)<1)?(c[g>>2]|0)==(p|0):0){if(p){f=c[e>>2]|0;a=0;do{h[f+(a<<3)>>3]=0.0;a=a+1|0}while((a|0)!=(p|0))}n=c[u>>2]|0;if(o){f=(p|0)==0;a=0;j=n;while(1){if(!f){g=0;k=j;l=c[e>>2]|0;while(1){h[l>>3]=+h[k>>3]+ +h[l>>3];g=g+1|0;if((g|0)==(p|0))break;else{k=k+8|0;l=l+8|0}}}a=a+1|0;if((a|0)==(o|0))break;else j=j+(p<<3)|0}}i=+(o|0);if(p){f=c[e>>2]|0;a=0;do{m=f+(a<<3)|0;h[m>>3]=+h[m>>3]/i;a=a+1|0}while((a|0)!=(p|0))}l=(p|0)>0?p:0;if((o|0)>0){f=(p|0)>0;a=0;j=n;while(1){if(f){g=0;k=j;m=c[e>>2]|0;while(1){h[k>>3]=+h[k>>3]-+h[m>>3];g=g+1|0;if((g|0)>=(p|0))break;else{k=k+8|0;m=m+8|0}}}a=a+1|0;if((a|0)>=(o|0))break;else j=j+(l<<3)|0}}f=$(s,q)|0;if((f|0)>0){a=0;do{e=n+(a<<3)|0;h[e>>3]=+h[e>>3]/r;a=a+1|0}while((a|0)<(f|0))}f=Ze(u,b,d)|0;We(u)|0;j=c[t>>2]|0;if((j|0)>0){a=c[d>>2]|0;g=0;i=0.0;do{i=i+ +h[a+(g<<3)>>3];g=g+1|0}while((g|0)<(j|0))}else i=0.0;if((j|0)<=0)break;a=c[d>>2]|0;g=0;while(1){d=a+(g<<3)|0;h[d>>3]=+h[d>>3]/i;g=g+1|0;if((g|0)>=(j|0))break a}}We(u)|0;f=-1}else f=-1;while(0);return f|0}function Ze(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0,k=0.0,l=0,m=0,n=0,o=0,p=0,q=0.0,r=0,s=0,t=0,u=0.0,v=0.0,w=0,x=0.0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,Q=0,R=0,S=0,T=0,U=0,V=0.0,W=0.0,X=0.0,Y=0,Z=0;U=i;i=i+16|0;w=U;F=a+4|0;I=c[F>>2]|0;J=a+8|0;K=c[J>>2]|0;S=(K|0)<(I|0)?K:I;a:do if(((!((I|0)<2|(K|0)<2)?(R=b+8|0,(c[R>>2]|0)==(K|0)):0)?(L=b+4|0,(c[L>>2]|0)==(S|0)):0)?(M=d+4|0,(c[M>>2]|0)==(S|0)):0){T=Re(S,S)|0;N=T+4|0;if((c[N>>2]|0)==(S|0)?(Q=T+8|0,(c[Q>>2]|0)==(S|0)):0){G=(I|0)<(K|0);s=c[F>>2]|0;t=c[J>>2]|0;if(G){if((S|0)!=(s|0)){We(T)|0;e=-1;break}g=c[T>>2]|0;if((S|0)>0){m=(S|0)==0;j=(t|0)>0;n=0;r=g;while(1){l=$(n,t)|0;if(!m){p=0;s=r;while(1){if((p|0)>=(n|0)){e=c[a>>2]|0;h[s>>3]=0.0;if(j){k=0.0;o=e+(l<<3)|0;e=e+(($(p,t)|0)<<3)|0;f=0;while(1){k=k+ +h[o>>3]*+h[e>>3];h[s>>3]=k;f=f+1|0;if((f|0)>=(t|0))break;else{o=o+8|0;e=e+8|0}}}}else h[s>>3]=+h[g+(($(p,S)|0)+n<<3)>>3];p=p+1|0;if((p|0)==(S|0))break;else s=s+8|0}}n=n+1|0;if((n|0)>=(S|0))break;else r=r+(S<<3)|0}}}else{if((S|0)!=(t|0)){We(T)|0;e=-1;break}g=c[T>>2]|0;if((S|0)>0){l=(S|0)==0;j=(s|0)>0;m=0;p=g;while(1){if(!l){o=0;r=p;while(1){if((o|0)>=(m|0)){e=c[a>>2]|0;h[r>>3]=0.0;if(j){k=0.0;n=e+(m<<3)|0;e=e+(o<<3)|0;f=0;while(1){k=k+ +h[n>>3]*+h[e>>3];h[r>>3]=k;f=f+1|0;if((f|0)>=(s|0))break;else{n=n+(S<<3)|0;e=e+(S<<3)|0}}}}else h[r>>3]=+h[g+(($(o,S)|0)+m<<3)>>3];o=o+1|0;if((o|0)==(S|0))break;else r=r+8|0}}m=m+1|0;if((m|0)>=(S|0))break;else p=p+(S<<3)|0}}}do if(((S|0)>=2?(c[M>>2]|0)==(S|0):0)?(H=nf(S)|0,(H|0)!=0):0){E=S+-1|0;c[w+4>>2]=E;c[w>>2]=(c[H>>2]|0)+8;if((rf(T,d,w)|0)<0){of(H)|0;break}B=c[H>>2]|0;h[B>>3]=0.0;if((E|0)>0){C=(S|0)==0;D=E;do{f=D;while(1){if((f|0)<=0)break;v=+O(+(+h[B+(f<<3)>>3]));e=f+-1|0;A=c[d>>2]|0;x=+O(+(+h[A+(e<<3)>>3]));if(v>(x+ +O(+(+h[A+(f<<3)>>3])))*1.0e-06)f=e;else break}y=D;D=D+-1|0;b:do if((f|0)!=(y|0)){o=B+(y<<3)|0;p=B+(f+1<<3)|0;r=(f|0)<(y|0);z=0;do{if((z|0)>99)break b;z=z+1|0;s=c[d>>2]|0;t=s+(D<<3)|0;w=s+(y<<3)|0;k=+h[w>>3];q=(+h[t>>3]-k)*.5;u=+h[o>>3];u=u*u;v=+P(+(u+q*q));if(r){A=f;q=+h[s+(f<<3)>>3]-k+u/(q+(q<0.0?-v:v));u=+h[p>>3];while(1){k=+O(+q);do if(!(k>=+O(+u))){v=-q/u;x=1.0/+P(+(v*v+1.0));v=v*x}else{if(!(k>1.0e-16)){v=1.0;x=0.0;break}k=-u/q;x=1.0/+P(+(k*k+1.0));v=x;x=k*x}while(0);j=s+(A<<3)|0;X=+h[j>>3];n=A;A=A+1|0;l=s+(A<<3)|0;W=+h[l>>3];k=X-W;m=B+(A<<3)|0;V=x*(x*k+v*2.0*+h[m>>3]);h[j>>3]=X-V;h[l>>3]=W+V;if((n|0)>(f|0)){l=B+(n<<3)|0;h[l>>3]=v*+h[l>>3]-u*x}X=+h[m>>3];h[m>>3]=X+x*(v*k-x*2.0*X);j=$(n,S)|0;l=$(A,S)|0;if(C)k=u;else{e=c[T>>2]|0;g=0;do{Z=e+(g+j<<3)|0;q=+h[Z>>3];Y=e+(g+l<<3)|0;k=+h[Y>>3];h[Z>>3]=v*q-x*k;h[Y>>3]=x*q+v*k;g=g+1|0}while((g|0)!=(S|0))}if((n|0)<(D|0)){q=+h[m>>3];Z=B+(n+2<<3)|0;k=+h[Z>>3];h[Z>>3]=v*k;k=-(x*k)}if((A|0)>=(y|0))break;else u=k}}W=+O(+(+h[o>>3]));X=+O(+(+h[t>>3]))}while(W>(X+ +O(+(+h[w>>3])))*1.0e-06)}while(0)}while((y|0)>1)}if(E){l=c[d>>2]|0;m=c[T>>2]|0;n=(S|0)==0;o=0;do{g=l+(o<<3)|0;q=+h[g>>3];j=o;o=o+1|0;if((o|0)<(S|0)){e=j;f=o;k=q;do{X=+h[l+(f<<3)>>3];Z=X>k;k=Z?X:k;e=Z?f:e;f=f+1|0}while((f|0)<(S|0))}else{e=j;k=q}h[l+(e<<3)>>3]=q;h[g>>3]=k;if(!n){g=0;f=m+(($(e,S)|0)<<3)|0;e=m+(($(j,S)|0)<<3)|0;while(1){X=+h[f>>3];h[f>>3]=+h[e>>3];h[e>>3]=X;g=g+1|0;if((g|0)==(S|0))break;else{f=f+8|0;e=e+8|0}}}}while((o|0)!=(E|0))}of(H)|0;c:do if(!G){g=c[b>>2]|0;p=(I|0)>(K|0)?K:I;d:do if((S|0)>0){m=c[d>>2]|0;n=(p|0)==0;e=0;o=c[T>>2]|0;do{if(+h[m+(e<<3)>>3]<1.0e-16)break d;if(!n){f=0;j=o;l=g;while(1){h[l>>3]=+h[j>>3];f=f+1|0;if((f|0)==(p|0))break;else{j=j+8|0;l=l+8|0}}}o=o+(p<<3)|0;g=g+(p<<3)|0;e=e+1|0}while((e|0)<(S|0))}else e=0;while(0);n=(p|0)>0?p:0;if((e|0)<(S|0)){l=c[d>>2]|0;m=(S|0)>0;while(1){h[l+(e<<3)>>3]=0.0;if(m){f=0;j=g;while(1){h[j>>3]=0.0;f=f+1|0;if((f|0)>=(S|0))break;else j=j+8|0}}e=e+1|0;if((e|0)>=(S|0))break;else g=g+(n<<3)|0}}}else{w=c[F>>2]|0;t=c[J>>2]|0;do if(!((w|0)<1|(t|0)<1)){if((c[N>>2]|0)!=(w|0))break;if((c[Q>>2]|0)!=(w|0))break;if((c[L>>2]|0)!=(w|0))break;if((c[R>>2]|0)!=(t|0))break;if((c[M>>2]|0)!=(w|0))break;f=c[b>>2]|0;e:do if((w|0)>0){p=c[d>>2]|0;s=(t|0)==0;r=(w|0)==0;e=0;do{k=+h[p+(e<<3)>>3];if(k<1.0e-16)break e;q=1.0/+P(+(+O(+k)));m=$(e,w)|0;if(!s){n=0;o=f;while(1){if(r)k=0.0;else{g=0;j=(c[T>>2]|0)+(m<<3)|0;l=(c[a>>2]|0)+(n<<3)|0;k=0.0;while(1){k=k+ +h[j>>3]*+h[l>>3];g=g+1|0;if((g|0)==(w|0))break;else{j=j+8|0;l=l+(t<<3)|0}}}h[o>>3]=q*k;n=n+1|0;if((n|0)==(t|0))break;else o=o+8|0}}f=f+(t<<3)|0;e=e+1|0}while((e|0)<(w|0))}else e=0;while(0);n=(t|0)>0?t:0;if((e|0)>=(w|0))break c;l=c[d>>2]|0;m=(t|0)>0;g=f;while(1){h[l+(e<<3)>>3]=0.0;if(m){f=0;j=g;while(1){h[j>>3]=0.0;f=f+1|0;if((f|0)>=(t|0))break;else j=j+8|0}}e=e+1|0;if((e|0)>=(w|0))break c;else g=g+(n<<3)|0}}while(0);We(T)|0;e=-1;break a}while(0);We(T)|0;e=0;break a}while(0);We(T)|0;e=-1;break}We(T)|0;e=-1}else e=-1;while(0);i=U;return e|0}function _e(a){a=a|0;var b=0,d=0,e=0,f=0.0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0.0,x=0;v=i;i=i+2e3|0;u=v;b=c[a>>2]|0;t=c[a+4>>2]|0;a:do if((t|0)<=500){switch(t|0){case 0:{b=0;break a}case 1:{h[b>>3]=1.0/+h[b>>3];break a}default:{}}if((t|0)>0){a=0;do{c[u+(a<<2)>>2]=a;a=a+1|0}while((a|0)<(t|0))}s=b+(t+-1<<3)|0;if((t|0)>0){m=(t|0)==0;p=(t|0)==1;o=(t|0)==0;n=(t|0)==1;q=s;a=0;r=0;while(1){l=b+(($(r,t)|0)<<3)|0;if((r|0)<(t|0)){e=r;f=0.0;d=l;while(1){w=+O(+(+h[d>>3]));k=f<w;a=k?e:a;f=k?w:f;e=e+1|0;if((e|0)>=(t|0))break;else d=d+(t<<3)|0}}else f=0.0;if(f<=1.0e-10){b=0;break a}g=u+(a<<2)|0;j=c[g>>2]|0;k=u+(r<<2)|0;c[g>>2]=c[k>>2];c[k>>2]=j;if(!m){d=0;e=b+(($(a,t)|0)<<3)|0;g=l;while(1){w=+h[e>>3];h[e>>3]=+h[g>>3];h[g>>3]=w;d=d+1|0;if((d|0)==(t|0))break;else{e=e+8|0;g=g+8|0}}}f=+h[l>>3];if(!p){d=1;e=l;do{k=e;e=e+8|0;h[k>>3]=+h[e>>3]/f;d=d+1|0}while((d|0)!=(t|0))}h[q>>3]=1.0/f;if(!o){g=0;j=s;while(1){if((g|0)!=(r|0)){d=b+(($(g,t)|0)<<3)|0;f=+h[d>>3];if(!n){k=1;e=l;while(1){x=d;d=d+8|0;h[x>>3]=+h[d>>3]-f*+h[e>>3];k=k+1|0;if((k|0)==(t|0))break;else e=e+8|0}}h[j>>3]=-(f*+h[q>>3])}g=g+1|0;if((g|0)==(t|0))break;else j=j+(t<<3)|0}}r=r+1|0;if((r|0)>=(t|0))break;else q=q+(t<<3)|0}}if((t|0)>0){g=(t|0)>0;j=0;do{a=u+(j<<2)|0;b:do if((j|0)<(t|0)){d=j;do{if((c[a>>2]|0)==(j|0))break b;d=d+1|0;a=u+(d<<2)|0}while((d|0)<(t|0))}else d=j;while(0);c[a>>2]=c[u+(j<<2)>>2];if(g){e=0;a=b+(d<<3)|0;d=b+(j<<3)|0;while(1){w=+h[a>>3];h[a>>3]=+h[d>>3];h[d>>3]=w;e=e+1|0;if((e|0)>=(t|0))break;else{a=a+(t<<3)|0;d=d+(t<<3)|0}}}j=j+1|0}while((j|0)<(t|0))}}else b=0;while(0);i=v;return ((b|0)==0)<<31>>31|0}function $e(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,i=0,j=0,k=0,l=0;i=c[a+4>>2]|0;if((i|0)==(c[b+8>>2]|0)?(k=c[a+8>>2]|0,(k|0)==(c[b+4>>2]|0)):0){l=(k|0)>0?k:0;if((i|0)>0){j=(k|0)>0;e=c[a>>2]|0;g=0;while(1){if(j){a=0;d=(c[b>>2]|0)+(g<<3)|0;f=e;while(1){h[f>>3]=+h[d>>3];a=a+1|0;if((a|0)>=(k|0))break;else{d=d+(i<<3)|0;f=f+8|0}}}g=g+1|0;if((g|0)>=(i|0)){a=0;break}else e=e+(l<<3)|0}}else a=0}else a=-1;return a|0}function af(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0.0,g=0.0,i=0;f=+(b|0)/+(c[a>>2]|0);g=+(d|0)/+(c[a+4>>2]|0);c[e>>2]=b;c[e+4>>2]=d;b=0;do{h[e+8+(b<<3)>>3]=f*+h[a+8+(b<<3)>>3];h[e+40+(b<<3)>>3]=g*+h[a+40+(b<<3)>>3];h[e+72+(b<<3)>>3]=+h[a+72+(b<<3)>>3];b=b+1|0}while((b|0)!=4);b=c[a+176>>2]|0;switch(b|0){case 4:{h[e+104>>3]=+h[a+104>>3];h[e+112>>3]=+h[a+112>>3];h[e+120>>3]=+h[a+120>>3];h[e+128>>3]=+h[a+128>>3];h[e+136>>3]=f*+h[a+136>>3];h[e+144>>3]=g*+h[a+144>>3];h[e+152>>3]=f*+h[a+152>>3];h[e+160>>3]=g*+h[a+160>>3];h[e+168>>3]=+h[a+168>>3];i=8;break}case 3:{h[e+104>>3]=f*+h[a+104>>3];h[e+112>>3]=g*+h[a+112>>3];h[e+120>>3]=+h[a+120>>3];h[e+128>>3]=+h[a+128>>3];h[e+136>>3]=+h[a+136>>3]/(f*g);h[e+144>>3]=+h[a+144>>3]/(g*(f*f*g));i=8;break}case 2:{h[e+104>>3]=f*+h[a+104>>3];h[e+112>>3]=g*+h[a+112>>3];h[e+120>>3]=+h[a+120>>3];h[e+128>>3]=+h[a+128>>3]/(f*g);h[e+136>>3]=+h[a+136>>3]/(g*(f*f*g));i=8;break}case 1:{h[e+104>>3]=f*+h[a+104>>3];h[e+112>>3]=g*+h[a+112>>3];h[e+120>>3]=+h[a+120>>3];h[e+128>>3]=+h[a+128>>3]/(f*g);i=8;break}default:b=-1}if((i|0)==8){c[e+176>>2]=b;b=0}return b|0}function bf(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,f=0,g=0.0,j=0,k=0.0,l=0,m=0,n=0,o=0.0,p=0.0,q=0,r=0,s=0.0,t=0,u=0,v=0,w=0,x=0.0;f=i;i=i+96|0;e=f;if(!(+h[a+88>>3]>=0.0)){d=0;do{h[e+(d<<5)>>3]=-+h[a+(d<<5)>>3];h[e+(d<<5)+8>>3]=-+h[a+(d<<5)+8>>3];h[e+(d<<5)+16>>3]=-+h[a+(d<<5)+16>>3];h[e+(d<<5)+24>>3]=-+h[a+(d<<5)+24>>3];d=d+1|0}while((d|0)!=3)}else{d=0;do{h[e+(d<<5)>>3]=+h[a+(d<<5)>>3];h[e+(d<<5)+8>>3]=+h[a+(d<<5)+8>>3];h[e+(d<<5)+16>>3]=+h[a+(d<<5)+16>>3];h[e+(d<<5)+24>>3]=+h[a+(d<<5)+24>>3];d=d+1|0}while((d|0)!=3)}h[b>>3]=0.0;h[b+8>>3]=0.0;h[b+16>>3]=0.0;h[b+24>>3]=0.0;h[b+32>>3]=0.0;h[b+40>>3]=0.0;h[b+48>>3]=0.0;h[b+56>>3]=0.0;h[b+64>>3]=0.0;h[b+72>>3]=0.0;h[b+80>>3]=0.0;h[b+88>>3]=0.0;g=+h[e+64>>3];o=+h[e+72>>3];p=+h[e+80>>3];x=+P(+(g*g+o*o+p*p));a=b+80|0;h[a>>3]=x;x=g/x;v=c+64|0;h[v>>3]=x;o=o/+h[a>>3];t=c+72|0;h[t>>3]=o;p=p/+h[a>>3];q=c+80|0;h[q>>3]=p;n=c+88|0;h[n>>3]=+h[e+88>>3]/+h[a>>3];g=+h[e+32>>3];k=+h[e+40>>3];s=+h[e+48>>3];p=x*g+o*k+p*s;m=b+48|0;h[m>>3]=p;g=g-p*+h[v>>3];k=k-p*+h[t>>3];p=s-p*+h[q>>3];s=+P(+(g*g+k*k+p*p));l=b+40|0;h[l>>3]=s;w=c+32|0;h[w>>3]=g/s;u=c+40|0;h[u>>3]=k/+h[l>>3];r=c+48|0;h[r>>3]=p/+h[l>>3];p=+h[e>>3];k=+h[e+8>>3];s=+h[e+16>>3];g=+h[v>>3]*p+ +h[t>>3]*k+ +h[q>>3]*s;d=b+16|0;h[d>>3]=g;o=+h[w>>3]*p+ +h[u>>3]*k+ +h[r>>3]*s;j=b+8|0;h[j>>3]=o;p=p-o*+h[w>>3]-g*+h[v>>3];k=k-o*+h[u>>3]-g*+h[t>>3];g=s-o*+h[r>>3]-g*+h[q>>3];o=+P(+(p*p+k*k+g*g));h[b>>3]=o;h[c>>3]=p/o;h[c+8>>3]=k/+h[b>>3];h[c+16>>3]=g/+h[b>>3];g=+h[n>>3];k=(+h[e+56>>3]-+h[m>>3]*g)/+h[l>>3];h[c+56>>3]=k;h[c+24>>3]=(+h[e+24>>3]-k*+h[j>>3]-+h[d>>3]*g)/+h[b>>3];d=0;do{w=b+(d<<5)|0;h[w>>3]=+h[w>>3]/+h[a>>3];w=b+(d<<5)+8|0;h[w>>3]=+h[w>>3]/+h[a>>3];w=b+(d<<5)+16|0;h[w>>3]=+h[w>>3]/+h[a>>3];d=d+1|0}while((d|0)!=3);i=f;return 0}function cf(a,b,c,d,e,f){a=a|0;b=+b;c=+c;d=d|0;e=e|0;f=f|0;var g=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0;switch(f|0){case 4:{q=+h[a>>3];r=+h[a+8>>3];s=+h[a+16>>3];t=+h[a+24>>3];y=+h[a+32>>3];v=+h[a+40>>3];w=+h[a+48>>3];x=+h[a+56>>3];u=+h[a+64>>3];p=(b-w)/y;j=(c-x)/v;c=p*p;i=j*j;k=s*2.0;l=t*6.0;m=t*2.0;n=s*6.0;a:do if(i!=0.0|c!=0.0){f=1;g=p;b=j;while(1){C=i+c;B=q*C+1.0+C*(r*C);z=c*3.0;A=i*z;g=g-(t*(C+c*2.0)+(b*(k*g)+g*B)-p)/(l*g+(k*b+(q*(i+z)+1.0+r*(i*i+(c*(c*5.0)+A)))));z=m*g;b=b-(s*(i*2.0+C)+b*B+b*z-j)/(n*b+(q*(c+i*3.0)+1.0+r*(i*(i*5.0)+(c*c+A)))+z);if((f|0)==4)break a;c=g*g;i=b*b;if(!(i!=0.0|c!=0.0)){g=0.0;b=0.0;break}else f=f+1|0}}else{g=0.0;b=0.0}while(0);h[d>>3]=w+y*g/u;h[e>>3]=x+v*b/u;f=0;break}case 3:{p=+h[a>>3];g=(b-p)/+h[a+24>>3];o=a+8|0;b=c-+h[o>>3];j=+h[a+32>>3]/1.0e8;k=+h[a+40>>3]/1.0e8/1.0e5;c=g*g+b*b;l=+P(+c);m=j*3.0;n=k*5.0;b:do if(l!=0.0){f=1;i=l;while(1){C=i-(i*(1.0-j*c-c*(k*c))-l)/(1.0-m*c-c*(n*c));g=g*C/i;b=b*C/i;if((f|0)==3)break b;c=g*g+b*b;i=+P(+c);if(!(i!=0.0)){g=0.0;b=0.0;break}else f=f+1|0}}else{g=0.0;b=0.0}while(0);f=a+16|0;h[d>>3]=g/+h[f>>3]+p;h[e>>3]=b/+h[f>>3]+ +h[o>>3];f=0;break}case 2:{p=+h[a>>3];g=b-p;o=a+8|0;b=c-+h[o>>3];j=+h[a+24>>3]/1.0e8;k=+h[a+32>>3]/1.0e8/1.0e5;c=g*g+b*b;l=+P(+c);m=j*3.0;n=k*5.0;c:do if(l!=0.0){f=1;i=l;while(1){C=i-(i*(1.0-j*c-c*(k*c))-l)/(1.0-m*c-c*(n*c));g=g*C/i;b=b*C/i;if((f|0)==3)break c;c=g*g+b*b;i=+P(+c);if(!(i!=0.0)){g=0.0;b=0.0;break}else f=f+1|0}}else{g=0.0;b=0.0}while(0);f=a+16|0;h[d>>3]=g/+h[f>>3]+p;h[e>>3]=b/+h[f>>3]+ +h[o>>3];f=0;break}case 1:{m=+h[a>>3];g=b-m;o=a+8|0;b=c-+h[o>>3];j=+h[a+24>>3]/1.0e8;c=g*g+b*b;k=+P(+c);l=j*3.0;d:do if(k!=0.0){f=1;i=k;while(1){C=i-(i*(1.0-j*c)-k)/(1.0-l*c);g=g*C/i;b=b*C/i;if((f|0)==3)break d;c=g*g+b*b;i=+P(+c);if(!(i!=0.0)){g=0.0;b=0.0;break}else f=f+1|0}}else{g=0.0;b=0.0}while(0);f=a+16|0;h[d>>3]=g/+h[f>>3]+m;h[e>>3]=b/+h[f>>3]+ +h[o>>3];f=0;break}default:f=-1}return f|0}function df(a,b,c,d,e,f){a=a|0;b=+b;c=+c;d=d|0;e=e|0;f=f|0;var g=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0;switch(f|0){case 4:{j=+h[a+16>>3];k=+h[a+24>>3];n=+h[a+32>>3];l=+h[a+40>>3];o=+h[a+48>>3];m=+h[a+56>>3];i=+h[a+64>>3];b=(b-o)*i/n;i=(c-m)*i/l;g=b*b+i*i;c=+h[a>>3]*g+1.0+g*(+h[a+8>>3]*g);h[d>>3]=o+n*(k*(b*(b*2.0)+g)+(j*2.0*b*i+b*c));h[e>>3]=m+l*(k*2.0*b*i+(j*(g+i*(i*2.0))+i*c));f=0;break}case 3:{i=+h[a>>3];o=+h[a+16>>3];g=(b-i)*o;f=a+8|0;b=o*(c-+h[f>>3]);if(g==0.0&b==0.0){h[d>>3]=i;b=+h[f>>3]}else{o=g*g+b*b;o=1.0-o*(+h[a+32>>3]/1.0e8)-o*(o*(+h[a+40>>3]/1.0e8/1.0e5));h[d>>3]=i+ +h[a+24>>3]*(g*o);b=+h[f>>3]+b*o}h[e>>3]=b;f=0;break}case 2:{i=+h[a>>3];o=+h[a+16>>3];g=(b-i)*o;f=a+8|0;b=o*(c-+h[f>>3]);if(g==0.0&b==0.0){h[d>>3]=i;b=+h[f>>3]}else{o=g*g+b*b;o=1.0-o*(+h[a+24>>3]/1.0e8)-o*(o*(+h[a+32>>3]/1.0e8/1.0e5));h[d>>3]=i+g*o;b=+h[f>>3]+b*o}h[e>>3]=b;f=0;break}case 1:{i=+h[a>>3];o=+h[a+16>>3];g=(b-i)*o;f=a+8|0;b=o*(c-+h[f>>3]);if(g==0.0&b==0.0){h[d>>3]=i;b=+h[f>>3]}else{o=1.0-(g*g+b*b)*(+h[a+24>>3]/1.0e8);h[d>>3]=i+g*o;b=+h[f>>3]+b*o}h[e>>3]=b;f=0;break}default:f=-1}return f|0}function ef(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0.0;s=i;i=i+256|0;n=s+232|0;m=s+224|0;l=s+216|0;k=s+208|0;j=s+200|0;g=s+192|0;f=s+184|0;p=s+240|0;q=s;do if((a|0)!=0&(b|0)>0&(d|0)!=0){r=_i(a,4854)|0;if(!r){r=qi()|0;c[f>>2]=c[r>>2];c[f+4>>2]=a;Me(3,4857,f);a=ri(c[r>>2]|0)|0;c[g>>2]=5367;c[g+4>>2]=a;Me(3,5361,g);a=-1;break}dj(r,0,2)|0;a:do if(!(Xi(r)|0)){g=gj(r)|0;jj(r);a=0;do{if((a|0)>=4){o=9;break}f=c[2012+(a<<3)+4>>2]|0;a=a+1|0}while(((g|0)%(f|0)|0|0)!=0);do if((o|0)==9)if((a|0)==4){Me(3,4971,l);a=-1;break a}else{f=c[2012+(0<<3)+4>>2]|0;a=0;break}while(0);if((aj(q,f,1,r)|0)!=1){a=qi()|0;c[m>>2]=c[a>>2];Me(3,5051,m);a=ri(c[a>>2]|0)|0;c[n>>2]=5367;c[n+4>>2]=a;Me(3,5361,n);a=-1;break}l=q+176|0;c[l>>2]=a;ff(q);m=(a|0)==1;n=q+120|0;if(m){t=+h[n>>3];k=q+128|0;h[n>>3]=+h[k>>3];h[k>>3]=t}else k=q+128|0;ik(d|0,q|0,184)|0;c[p>>2]=e;f=d+176|0;if((b|0)>1){j=1;while(1){e=(c[p>>2]|0)+(4-1)&~(4-1);g=c[e>>2]|0;c[p>>2]=e+4;c[g+176>>2]=c[f>>2];if((aj(q,c[2012+((c[f>>2]|0)+-1<<3)+4>>2]|0,1,r)|0)!=1){a=-1;break a}c[l>>2]=a;ff(q);if(m){t=+h[n>>3];h[n>>3]=+h[k>>3];h[k>>3]=t}ik(g|0,q|0,184)|0;j=j+1|0;if((j|0)>=(b|0)){a=0;break}}}else a=0}else{a=qi()|0;c[j>>2]=c[a>>2];Me(3,4926,j);a=ri(c[a>>2]|0)|0;c[k>>2]=5367;c[k+4>>2]=a;Me(3,5361,k);a=-1}while(0);Wi(r)|0}else a=-1;while(0);i=s;return a|0}function ff(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;g=i;i=i+192|0;f=g;hf(a,f);hf(a+4|0,f+4|0);b=0;do{gf(a+8+(b<<5)|0,f+8+(b<<5)|0);gf(a+8+(b<<5)+8|0,f+8+(b<<5)+8|0);gf(a+8+(b<<5)+16|0,f+8+(b<<5)+16|0);gf(a+8+(b<<5)+24|0,f+8+(b<<5)+24|0);b=b+1|0}while((b|0)!=3);d=a+176|0;e=0;do{gf(a+104+(e<<3)|0,f+104+(e<<3)|0);e=e+1|0;b=c[d>>2]|0}while((e|0)<(c[2012+(b+-1<<3)>>2]|0));c[f+176>>2]=b;ik(a|0,f|0,184)|0;i=g;return}function gf(b,c){b=b|0;c=c|0;a[c>>0]=a[b+7>>0]|0;a[c+1>>0]=a[b+6>>0]|0;a[c+2>>0]=a[b+5>>0]|0;a[c+3>>0]=a[b+4>>0]|0;a[c+4>>0]=a[b+3>>0]|0;a[c+5>>0]=a[b+2>>0]|0;a[c+6>>0]=a[b+1>>0]|0;a[c+7>>0]=a[b>>0]|0;return}function hf(b,c){b=b|0;c=c|0;a[c>>0]=a[b+3>>0]|0;a[c+1>>0]=a[b+2>>0]|0;a[c+2>>0]=a[b+1>>0]|0;a[c+3>>0]=a[b>>0]|0;return}function jf(a,b){a=a|0;b=b|0;var d=0,e=0,f=0.0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0.0;x=i;i=i+64|0;t=x+24|0;u=x+16|0;v=x+8|0;w=x;q=Uj(208)|0;if(!q){Me(3,5472,x+32|0);rb(1)}ik(q|0,a|0,184)|0;s=b<<1;r=(c[a>>2]|0)+s|0;c[q+192>>2]=r;s=(c[a+4>>2]|0)+s|0;c[q+196>>2]=s;c[q+200>>2]=b;c[q+204>>2]=b;d=$(r<<3,s)|0;e=Uj(d)|0;c[q+184>>2]=e;if(!e){Me(3,5472,x+40|0);rb(1)}d=Uj(d)|0;c[q+188>>2]=d;if(!d){Me(3,5472,x+48|0);rb(1)}p=a+104|0;m=c[a+176>>2]|0;n=(r|0)>0?r<<1:0;if((s|0)>0){o=(r|0)>0;l=0;while(1){f=+(l-b|0);if(o){a=0;j=e;k=d;while(1){y=+(a-b|0);df(p,y,f,v,w,m)|0;g[j>>2]=+h[v>>3];g[j+4>>2]=+h[w>>3];cf(p,y,f,t,u,m)|0;g[k>>2]=+h[t>>3];g[k+4>>2]=+h[u>>3];a=a+1|0;if((a|0)>=(r|0))break;else{j=j+8|0;k=k+8|0}}}d=d+(n<<2)|0;l=l+1|0;if((l|0)>=(s|0))break;else e=e+(n<<2)|0}}i=x;return q|0}function kf(a){a=a|0;var b=0;if((a|0)!=0?(b=c[a>>2]|0,(b|0)!=0):0){Vj(c[b+184>>2]|0);Vj(c[(c[a>>2]|0)+188>>2]|0);Vj(c[a>>2]|0);c[a>>2]=0;b=0}else b=-1;return b|0}function lf(a,b,d,e,f){a=a|0;b=+b;d=+d;e=e|0;f=f|0;var g=0,h=0,i=0;h=(c[a+16>>2]|0)+~~(b+.5)|0;g=(c[a+20>>2]|0)+~~(d+.5)|0;if(((h|0)>=0?(i=c[a+8>>2]|0,!((g|0)<0|(h|0)>=(i|0))):0)?(g|0)<(c[a+12>>2]|0):0){a=c[a>>2]|0;g=($(i,g)|0)+h<<1;c[e>>2]=c[a+(g<<2)>>2];c[f>>2]=c[a+((g|1)<<2)>>2];g=0}else g=-1;return g|0}function mf(a,b,d,e,f){a=a|0;b=+b;d=+d;e=e|0;f=f|0;var g=0,h=0,i=0;h=(c[a+16>>2]|0)+~~(b+.5)|0;g=(c[a+20>>2]|0)+~~(d+.5)|0;if(((h|0)>=0?(i=c[a+8>>2]|0,!((g|0)<0|(h|0)>=(i|0))):0)?(g|0)<(c[a+12>>2]|0):0){a=c[a+4>>2]|0;g=($(i,g)|0)+h<<1;c[e>>2]=c[a+(g<<2)>>2];c[f>>2]=c[a+((g|1)<<2)>>2];g=0}else g=-1;return g|0}function nf(a){a=a|0;var b=0,d=0;b=Uj(8)|0;do if(b){d=Uj(a<<3)|0;c[b>>2]=d;if(!d){Vj(b);b=0;break}else{c[b+4>>2]=a;break}}else b=0;while(0);return b|0}function of(a){a=a|0;Vj(c[a>>2]|0);Vj(a);return 0}function pf(a){a=a|0;var b=0.0,d=0,e=0.0,f=0,g=0;b=+P(+(+qf(a,a)));if(b!=0.0){f=c[a>>2]|0;e=+h[f>>3];b=e<0.0?-b:b;e=e+b;h[f>>3]=e;e=1.0/+P(+(e*b));a=c[a+4>>2]|0;if((a|0)>0){d=0;do{g=f+(d<<3)|0;h[g>>3]=e*+h[g>>3];d=d+1|0}while((d|0)<(a|0))}}return +-b}function qf(a,b){a=a|0;b=b|0;var d=0.0,e=0,f=0;f=c[a+4>>2]|0;if((f|0)!=(c[b+4>>2]|0))rb(0);if((f|0)>0){e=c[a>>2]|0;a=c[b>>2]|0;b=0;d=0.0;do{d=d+ +h[e+(b<<3)>>3]*+h[a+(b<<3)>>3];b=b+1|0}while((b|0)<(f|0))}else d=0.0;return +d}function rf(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0.0,k=0,l=0,m=0,n=0,o=0,p=0,q=0.0,r=0.0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;E=i;i=i+16|0;C=E+8|0;D=E;w=c[a+8>>2]|0;if(((w|0)==(c[a+4>>2]|0)?(w|0)==(c[b+4>>2]|0):0)?(w|0)==((c[d+4>>2]|0)+1|0):0){z=w+-2|0;A=C+4|0;B=D+4|0;if((w|0)>2){s=w+-1|0;t=0;do{o=$(t,w)|0;p=c[a>>2]|0;h[(c[b>>2]|0)+(t<<3)>>3]=+h[p+(o+t<<3)>>3];k=w-t+-1|0;c[A>>2]=k;u=t;t=t+1|0;l=p+(o+t<<3)|0;c[C>>2]=l;r=+pf(C);h[(c[d>>2]|0)+(u<<3)>>3]=r;if(!(r==0.0)){if((t|0)<(w|0)){m=c[b>>2]|0;n=t;do{if((t|0)<(n|0)){e=c[a>>2]|0;f=t;j=0.0;do{r=+h[e+(($(f,w)|0)+n<<3)>>3];j=j+r*+h[p+(f+o<<3)>>3];f=f+1|0}while((f|0)<(n|0))}else j=0.0;e=$(n,w)|0;if((n|0)<(w|0)){f=c[a>>2]|0;g=n;do{j=j+ +h[f+(g+e<<3)>>3]*+h[p+(g+o<<3)>>3];g=g+1|0}while((g|0)<(w|0))}h[m+(n<<3)>>3]=j;n=n+1|0}while((n|0)<(w|0))}c[B>>2]=k;c[A>>2]=k;c[C>>2]=l;c[D>>2]=(c[b>>2]|0)+(t<<3);j=+qf(C,D)*.5;if((s|0)>(u|0)){e=c[b>>2]|0;k=s;do{q=+h[p+(k+o<<3)>>3];f=e+(k<<3)|0;r=+h[f>>3]-j*q;h[f>>3]=r;f=$(k,w)|0;if((k|0)<(w|0)){g=c[a>>2]|0;l=k;do{n=g+(l+f<<3)|0;h[n>>3]=+h[n>>3]-(q*+h[e+(l<<3)>>3]+r*+h[p+(l+o<<3)>>3]);l=l+1|0}while((l|0)<(w|0))}k=k+-1|0}while((k|0)>(u|0))}}}while((t|0)<(z|0))}if((w|0)<=1){if((w|0)>0){f=0;g=c[a>>2]|0;e=c[b>>2]|0;v=27}}else{v=$(z,w)|0;g=c[a>>2]|0;e=c[b>>2]|0;h[e+(z<<3)>>3]=+h[g+(v+z<<3)>>3];f=w+-1|0;h[(c[d>>2]|0)+(z<<3)>>3]=+h[g+(f+v<<3)>>3];v=27}if((v|0)==27)h[e+(f<<3)>>3]=+h[g+(($(f,w)|0)+f<<3)>>3];if((w|0)>0){m=(w|0)>0;p=w;do{d=p;p=p+-1|0;n=$(p,w)|0;o=c[a>>2]|0;if((d|0)<=(z|0)?(x=w-p+-1|0,y=o+(n+d<<3)|0,(d|0)<(w|0)):0){e=(d|0)<(w|0);k=d;do{c[B>>2]=x;c[A>>2]=x;c[C>>2]=y;f=$(k,w)|0;c[D>>2]=(c[a>>2]|0)+(f+d<<3);j=+qf(C,D);if(e){g=c[a>>2]|0;l=d;do{v=g+(l+f<<3)|0;h[v>>3]=+h[v>>3]-j*+h[o+(l+n<<3)>>3];l=l+1|0}while((l|0)<(w|0))}k=k+1|0}while((k|0)<(w|0))}if(m){e=0;do{h[o+(e+n<<3)>>3]=0.0;e=e+1|0}while((e|0)<(w|0))}h[o+(n+p<<3)>>3]=1.0}while((d|0)>1);e=0}else e=0}else e=-1;i=E;return e|0}function sf(a,b,c){a=a|0;b=b|0;c=c|0;var d=0.0,e=0.0,f=0.0,g=0.0,i=0.0;f=+h[c>>3];g=+h[c+8>>3];e=+h[c+16>>3];d=+h[b+88>>3]+(f*+h[b+64>>3]+g*+h[b+72>>3]+e*+h[b+80>>3]);if(d==0.0)c=-1;else{i=+h[b+56>>3]+(f*+h[b+32>>3]+g*+h[b+40>>3]+e*+h[b+48>>3]);h[a>>3]=(+h[b+24>>3]+(f*+h[b>>3]+g*+h[b+8>>3]+e*+h[b+16>>3]))/d;h[a+8>>3]=i/d;c=0}return c|0}function tf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0.0,g=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0,u=0,v=0.0,w=0,x=0,y=0,z=0,A=0,B=0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0;B=i;i=i+1072|0;y=B+1056|0;x=B+768|0;w=B+192|0;A=B+48|0;z=B;K=+h[d>>3];F=+h[e>>3];s=K*F;J=+h[d+8>>3];t=e+8|0;E=+h[t>>3];v=J*E;j=+h[d+16>>3];G=+h[e+16>>3];l=j*G;m=+h[d+24>>3];I=+h[d+32>>3];H=+h[d+40>>3];n=E*H;k=+h[d+48>>3];o=G*k;p=+h[d+56>>3];D=+h[d+64>>3];C=+h[d+72>>3];q=E*C;f=+h[d+80>>3];r=G*f;g=+h[d+88>>3];h[x>>3]=s;h[x+8>>3]=K*E;h[x+16>>3]=K*G;h[x+24>>3]=F*J;h[x+32>>3]=v;h[x+40>>3]=G*J;h[x+48>>3]=F*j;h[x+56>>3]=E*j;h[x+64>>3]=l;h[x+72>>3]=K;h[x+80>>3]=J;h[x+88>>3]=j;j=F*I;h[x+96>>3]=j;h[x+104>>3]=E*I;h[x+112>>3]=G*I;h[x+120>>3]=F*H;h[x+128>>3]=n;h[x+136>>3]=G*H;h[x+144>>3]=F*k;h[x+152>>3]=E*k;h[x+160>>3]=o;h[x+168>>3]=I;h[x+176>>3]=H;h[x+184>>3]=k;k=D*F;h[x+192>>3]=k;h[x+200>>3]=E*D;h[x+208>>3]=G*D;h[x+216>>3]=F*C;E=+h[t>>3];h[x+224>>3]=C*E;h[x+232>>3]=G*C;h[x+240>>3]=F*f;h[x+248>>3]=E*f;h[x+256>>3]=r;h[x+264>>3]=D;h[x+272>>3]=C;h[x+280>>3]=f;e=w+64|0;d=w;t=d+64|0;do{c[d>>2]=0;d=d+4|0}while((d|0)<(t|0));h[e>>3]=-1.0;e=w+72|0;c[e>>2]=0;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;c[e+16>>2]=0;c[e+20>>2]=0;c[e+24>>2]=0;c[e+28>>2]=0;h[w+104>>3]=1.0;e=w+160|0;d=w+112|0;t=d+48|0;do{c[d>>2]=0;d=d+4|0}while((d|0)<(t|0));h[e>>3]=1.0;e=w+240|0;d=w+168|0;t=d+72|0;do{c[d>>2]=0;d=d+4|0}while((d|0)<(t|0));h[e>>3]=-1.0;e=w+296|0;d=w+248|0;t=d+48|0;do{c[d>>2]=0;d=d+4|0}while((d|0)<(t|0));h[e>>3]=-1.0;e=w+304|0;c[e>>2]=0;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;c[e+16>>2]=0;c[e+20>>2]=0;c[e+24>>2]=0;c[e+28>>2]=0;h[w+336>>3]=1.0;e=w+456|0;d=w+344|0;t=d+112|0;do{c[d>>2]=0;d=d+4|0}while((d|0)<(t|0));h[e>>3]=1.0;e=w+512|0;d=w+464|0;t=d+48|0;do{c[d>>2]=0;d=d+4|0}while((d|0)<(t|0));h[e>>3]=1.0;e=w+568|0;d=w+520|0;t=d+48|0;do{c[d>>2]=0;d=d+4|0}while((d|0)<(t|0));h[e>>3]=1.0;u=0;do{t=0;do{d=A+(u*48|0)+(t<<3)|0;h[d>>3]=0.0;f=0.0;e=0;do{f=f+ +h[x+(u*96|0)+(e<<3)>>3]*+h[w+(e*48|0)+(t<<3)>>3];e=e+1|0}while((e|0)!=12);h[d>>3]=f;t=t+1|0}while((t|0)!=6);u=u+1|0}while((u|0)!=3);J=m+(s+v+l);K=p+(j+n+o);f=g+(k+q+r);g=+h[b>>3];j=+h[b+8>>3];k=+h[b+16>>3];l=+h[b+24>>3]+(J*g+K*j+f*k);m=+h[b+32>>3];n=+h[b+40>>3];o=+h[b+48>>3];p=+h[b+56>>3]+(J*m+K*n+f*o);q=+h[b+64>>3];r=+h[b+72>>3];s=+h[b+80>>3];f=+h[b+88>>3]+(J*q+K*r+f*s);if(f==0.0){Me(3,5089,y);e=-1}else{K=f*f;h[z>>3]=(g*f-l*q)/K;h[z+8>>3]=(f*j-l*r)/K;h[z+16>>3]=(f*k-l*s)/K;h[z+24>>3]=(f*m-p*q)/K;h[z+32>>3]=(f*n-p*r)/K;h[z+40>>3]=(f*o-p*s)/K;d=0;do{f=+h[z+(d*24|0)>>3];g=+h[z+(d*24|0)+8>>3];j=+h[z+(d*24|0)+16>>3];e=0;do{y=a+(d*48|0)+(e<<3)|0;h[y>>3]=0.0;K=f*+h[A+(e<<3)>>3]+0.0;h[y>>3]=K;K=K+g*+h[A+48+(e<<3)>>3];h[y>>3]=K;h[y>>3]=K+j*+h[A+96+(e<<3)>>3];e=e+1|0}while((e|0)!=6);d=d+1|0}while((d|0)!=2);e=0}i=B;return e|0}function uf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;j=i;i=i+48|0;h=j+24|0;g=j+12|0;f=j;c[h+4>>2]=6;c[h+8>>2]=1;c[h>>2]=a;c[g+4>>2]=e;c[g+8>>2]=1;c[g>>2]=b;c[f+4>>2]=e;c[f+8>>2]=6;c[f>>2]=d;b=Ue(f)|0;do if(b){a=Te(b,f)|0;if(!a){We(b)|0;d=-1;break}d=Te(b,g)|0;if(!d){We(b)|0;We(a)|0;d=-1;break}if((_e(a)|0)<0){We(b)|0;We(a)|0;We(d)|0;d=-1;break}else{Xe(h,a,d)|0;We(b)|0;We(a)|0;We(d)|0;d=0;break}}else d=-1;while(0);i=j;return d|0}function vf(a,b){a=a|0;b=b|0;var c=0.0,d=0.0,e=0.0,f=0,g=0.0,j=0.0,k=0.0,l=0,m=0,n=0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0;n=i;i=i+192|0;l=n+96|0;m=n;g=+h[b>>3];k=+h[b+8>>3];d=+h[b+16>>3];c=g*g+k*k+d*d;if(c==0.0){j=0.0;e=0.0;d=1.0;c=0.0}else{c=+P(+c);j=c;e=d/c;d=g/c;c=k/c}u=+h[b+24>>3];r=+h[b+32>>3];k=+h[b+40>>3];o=+R(+j);g=1.0-o;j=+S(+j);h[l>>3]=o+d*d*g;t=c*d*g;s=e*j;h[l+8>>3]=t-s;q=d*e*g;p=c*j;h[l+16>>3]=q+p;h[l+24>>3]=u;h[l+32>>3]=t+s;h[l+40>>3]=o+c*c*g;c=c*e*g;j=d*j;h[l+48>>3]=c-j;h[l+56>>3]=r;h[l+64>>3]=q-p;h[l+72>>3]=c+j;h[l+80>>3]=o+e*e*g;h[l+88>>3]=k;f=0;do{c=+h[a+(f<<5)>>3];d=+h[a+(f<<5)+8>>3];e=+h[a+(f<<5)+16>>3];b=0;do{h[m+(f<<5)+(b<<3)>>3]=c*+h[l+(b<<3)>>3]+d*+h[l+32+(b<<3)>>3]+e*+h[l+64+(b<<3)>>3];b=b+1|0}while((b|0)!=4);b=m+(f<<5)+24|0;h[b>>3]=+h[a+(f<<5)+24>>3]+ +h[b>>3];f=f+1|0}while((f|0)!=3);b=0;do{h[a+(b<<5)>>3]=+h[m+(b<<5)>>3];h[a+(b<<5)+8>>3]=+h[m+(b<<5)+8>>3];h[a+(b<<5)+16>>3]=+h[m+(b<<5)+16>>3];h[a+(b<<5)+24>>3]=+h[m+(b<<5)+24>>3];b=b+1|0}while((b|0)!=3);i=n;return 0}function wf(a){a=a|0;var b=0,d=0;b=Uj(136)|0;if(!b)b=0;else{d=0;do{h[b+(d<<5)>>3]=+h[a+(d<<5)>>3];h[b+(d<<5)+8>>3]=+h[a+(d<<5)+8>>3];h[b+(d<<5)+16>>3]=+h[a+(d<<5)+16>>3];h[b+(d<<5)+24>>3]=+h[a+(d<<5)+24>>3];d=d+1|0}while((d|0)!=3);c[b+96>>2]=10;h[b+104>>3]=.10000000149011612;h[b+112>>3]=.9900000095367432;h[b+120>>3]=4.0;h[b+128>>3]=.5}return b|0}function xf(a){a=a|0;var b=0;b=c[a>>2]|0;if(!b)b=-1;else{Vj(b);c[a>>2]=0;b=0}return b|0}function yf(a,b){a=a|0;b=+b;if(!a)a=-1;else{h[a+128>>3]=b;a=0}return a|0}function zf(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,j=0.0,k=0,l=0,m=0.0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0.0,A=0.0;y=i;i=i+176|0;l=y+168|0;k=y+160|0;u=y+48|0;w=y+64|0;v=y;s=b+8|0;g=c[s>>2]|0;do if((g|0)>=3){x=Uj(g*96|0)|0;if(!x){Me(3,5109,k);g=-1;break}t=Uj(g<<4)|0;if(!t){Me(3,5109,l);Vj(x);g=-1;break}else g=0;do{h[e+(g<<5)>>3]=+h[d+(g<<5)>>3];h[e+(g<<5)+8>>3]=+h[d+(g<<5)+8>>3];h[e+(g<<5)+16>>3]=+h[d+(g<<5)+16>>3];h[e+(g<<5)+24>>3]=+h[d+(g<<5)+24>>3];g=g+1|0}while((g|0)!=3);q=b+4|0;l=u+8|0;d=a+104|0;n=a+120|0;o=a+112|0;p=a+96|0;m=0.0;r=0;a:while(1){Ne(a,e,w)|0;g=c[s>>2]|0;if((g|0)>0){j=0.0;k=0;do{if((sf(u,w,(c[q>>2]|0)+(k*24|0)|0)|0)<0){k=10;break a}g=c[b>>2]|0;A=+h[g+(k<<4)>>3]-+h[u>>3];z=+h[g+(k<<4)+8>>3]-+h[l>>3];j=j+(A*A+z*z);g=k<<1;h[t+(g<<3)>>3]=A;h[t+((g|1)<<3)>>3]=z;k=k+1|0;g=c[s>>2]|0}while((k|0)<(g|0))}else j=0.0;j=j/+(g|0);if(j<+h[d>>3]){k=24;break}if(((r|0)>0?j<+h[n>>3]:0)?j/m>+h[o>>3]:0){k=24;break}if((r|0)==(c[p>>2]|0)){k=24;break}if((g|0)>0){k=0;do{if((tf(x+(k*12<<3)|0,a,e,(c[q>>2]|0)+(k*24|0)|0)|0)<0){k=20;break a}k=k+1|0;g=c[s>>2]|0}while((k|0)<(g|0))}if((uf(v,t,x,g<<1)|0)<0){k=22;break}vf(e,v)|0;m=j;r=r+1|0}if((k|0)==10){Af(x,t);g=-1;break}else if((k|0)==20){Af(x,t);g=-1;break}else if((k|0)==22){Af(x,t);g=-1;break}else if((k|0)==24){h[f>>3]=j;Vj(x);Vj(t);g=0;break}}else g=-1;while(0);i=y;return g|0}function Af(a,b){a=a|0;b=b|0;Vj(a);Vj(b);return}function Bf(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,j=0.0,k=0,l=0,m=0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0.0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;G=i;i=i+192|0;n=G+184|0;m=G+176|0;l=G+168|0;g=G+160|0;B=G+48|0;D=G+64|0;C=G;A=b+8|0;k=c[A>>2]|0;do if((k|0)>=4){o=~~(+(k|0)*+h[a+128>>3])+-1|0;o=(o|0)<3?3:o;F=Uj(k*96|0)|0;if(!F){Me(3,5109,g);g=-1;break}E=Uj(k<<4)|0;if(!E){Me(3,5109,l);Vj(F);g=-1;break}g=k<<3;z=Uj(g)|0;if(!z){Me(3,5109,m);Vj(F);Vj(E);g=-1;break}y=Uj(g)|0;if(!y){Me(3,5109,n);Vj(F);Vj(E);Vj(z);g=-1;break}else g=0;do{h[e+(g<<5)>>3]=+h[d+(g<<5)>>3];h[e+(g<<5)+8>>3]=+h[d+(g<<5)+8>>3];h[e+(g<<5)+16>>3]=+h[d+(g<<5)+16>>3];h[e+(g<<5)+24>>3]=+h[d+(g<<5)+24>>3];g=g+1|0}while((g|0)!=3);w=b+4|0;x=B+8|0;n=y+(o<<3)|0;d=a+104|0;o=a+120|0;t=a+112|0;u=a+96|0;r=0.0;v=0;a:while(1){Ne(a,e,D)|0;g=c[A>>2]|0;if((g|0)>0){k=0;do{if((sf(B,D,(c[w>>2]|0)+(k*24|0)|0)|0)<0){k=14;break a}g=c[b>>2]|0;q=+h[g+(k<<4)>>3]-+h[B>>3];s=+h[g+(k<<4)+8>>3]-+h[x>>3];g=k<<1;h[E+(g<<3)>>3]=q;h[E+((g|1)<<3)>>3]=s;s=q*q+s*s;h[y+(k<<3)>>3]=s;h[z+(k<<3)>>3]=s;k=k+1|0;g=c[A>>2]|0}while((k|0)<(g|0))}rj(y,g,8,1);s=+h[n>>3]*4.0;s=s<16.0?16.0:s;k=c[A>>2]|0;q=s/6.0;if((k|0)>0){j=0.0;g=0;do{p=+h[y+(g<<3)>>3];if(p>s)p=q;else{p=1.0-p/s;p=q*(1.0-p*(p*p))}j=j+p;g=g+1|0}while((g|0)<(k|0))}else j=0.0;j=j/+(k|0);if(j<+h[d>>3]){k=36;break}if(((v|0)>0?j<+h[o>>3]:0)?j/r>+h[t>>3]:0){k=36;break}if((v|0)==(c[u>>2]|0)){k=36;break}if((k|0)>0){m=0;g=0;do{p=+h[z+(m<<3)>>3];if(p<=s){k=g*6|0;l=F+(k<<3)|0;if((tf(l,a,e,(c[w>>2]|0)+(m*24|0)|0)|0)<0){k=28;break a}r=1.0-p/s;r=r*r;h[l>>3]=+h[l>>3]*r;l=F+((k|1)<<3)|0;h[l>>3]=+h[l>>3]*r;l=F+(k+2<<3)|0;h[l>>3]=r*+h[l>>3];l=F+(k+3<<3)|0;h[l>>3]=r*+h[l>>3];l=F+(k+4<<3)|0;h[l>>3]=r*+h[l>>3];l=F+(k+5<<3)|0;h[l>>3]=r*+h[l>>3];l=F+(k+6<<3)|0;h[l>>3]=r*+h[l>>3];l=F+(k+7<<3)|0;h[l>>3]=r*+h[l>>3];l=F+(k+8<<3)|0;h[l>>3]=r*+h[l>>3];l=F+(k+9<<3)|0;h[l>>3]=r*+h[l>>3];l=F+(k+10<<3)|0;h[l>>3]=r*+h[l>>3];k=F+(k+11<<3)|0;h[k>>3]=r*+h[k>>3];k=m<<1;h[E+(g<<3)>>3]=r*+h[E+(k<<3)>>3];h[E+(g+1<<3)>>3]=r*+h[E+((k|1)<<3)>>3];k=c[A>>2]|0;g=g+2|0}m=m+1|0}while((m|0)<(k|0))}else g=0;if((g|0)<6){k=32;break}if((uf(C,E,F,g)|0)<0){k=34;break}vf(e,C)|0;r=j;v=v+1|0}if((k|0)==14){Cf(F,E,z,y);g=-1;break}else if((k|0)==28){Cf(F,E,z,y);g=-1;break}else if((k|0)==32){Cf(F,E,z,y);g=-1;break}else if((k|0)==34){Cf(F,E,z,y);g=-1;break}else if((k|0)==36){h[f>>3]=j;Vj(F);Vj(E);Vj(z);Vj(y);g=0;break}}else g=-1;while(0);i=G;return g|0}function Cf(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;Vj(a);Vj(b);Vj(c);Vj(d);return}function Df(a,b){a=a|0;b=b|0;var c=0.0;c=+h[a>>3]-+h[b>>3];return (c<0.0?-1:c>0.0&1)|0}function Ef(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,j=0.0,k=0.0,l=0,m=0.0,n=0.0,o=0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0,v=0.0,w=0,x=0,y=0,z=0,A=0.0,B=0,C=0,D=0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,Q=0.0,R=0.0,S=0.0,T=0.0,U=0,V=0,W=0,X=0,Y=0,Z=0;U=i;i=i+64|0;D=U+48|0;z=U+40|0;y=U+32|0;x=U+24|0;u=U+16|0;o=U+8|0;l=U;a:do if((e|0)>=4){g=0;while(1){if((g|0)>=(e|0))break;if(+h[d+(g*24|0)+16>>3]!=0.0){g=-1;break a}else g=g+1|0}if((((((((!(+h[a>>3]==0.0)?!(+h[a+32>>3]!=0.0):0)?(B=a+40|0,!(+h[B>>3]==0.0)):0)?!(+h[a+64>>3]!=0.0):0)?!(+h[a+72>>3]!=0.0):0)?!(+h[a+80>>3]!=1.0):0)?!(+h[a+24>>3]!=0.0):0)?!(+h[a+56>>3]!=0.0):0)?!(+h[a+88>>3]!=0.0):0){g=e<<1;C=Re(g,8)|0;if(!C){Me(3,5124,l);g=-1;break}w=Re(g,1)|0;if(!w){We(C)|0;Me(3,5150,o);g=-1;break}if(e){g=c[C>>2]|0;l=c[w>>2]|0;o=0;do{Z=d+(o*24|0)|0;V=o<<4;h[g+(V<<3)>>3]=+h[Z>>3];Y=d+(o*24|0)+8|0;h[g+((V|1)<<3)>>3]=+h[Y>>3];h[g+((V|2)<<3)>>3]=1.0;h[g+((V|3)<<3)>>3]=0.0;h[g+((V|4)<<3)>>3]=0.0;h[g+((V|5)<<3)>>3]=0.0;X=b+(o<<4)|0;h[g+((V|6)<<3)>>3]=-(+h[Z>>3]*+h[X>>3]);h[g+((V|7)<<3)>>3]=-(+h[Y>>3]*+h[X>>3]);h[g+((V|8)<<3)>>3]=0.0;h[g+((V|9)<<3)>>3]=0.0;h[g+((V|10)<<3)>>3]=0.0;h[g+((V|11)<<3)>>3]=+h[Z>>3];h[g+((V|12)<<3)>>3]=+h[Y>>3];h[g+((V|13)<<3)>>3]=1.0;W=b+(o<<4)+8|0;h[g+((V|14)<<3)>>3]=-(+h[Z>>3]*+h[W>>3]);h[g+((V|15)<<3)>>3]=-(+h[Y>>3]*+h[W>>3]);V=o<<1;h[l+(V<<3)>>3]=+h[X>>3];h[l+((V|1)<<3)>>3]=+h[W>>3];o=o+1|0}while((o|0)!=(e|0))}e=Ue(C)|0;if(!e){We(C)|0;We(w)|0;Me(3,5176,u);g=-1;break}o=Te(e,C)|0;if(!o){We(C)|0;We(w)|0;We(e)|0;Me(3,5202,x);g=-1;break}l=Te(e,w)|0;if(!l){We(C)|0;We(w)|0;We(e)|0;We(o)|0;Me(3,5228,y);g=-1;break}if((_e(o)|0)<0){We(C)|0;We(w)|0;We(e)|0;We(o)|0;We(l)|0;Me(3,5254,z);g=-1;break}g=Te(o,l)|0;if(!g){We(C)|0;We(w)|0;We(e)|0;We(o)|0;We(l)|0;Me(3,5280,D);g=-1;break}Z=c[g>>2]|0;p=+h[Z+48>>3];S=+h[a+48>>3];t=+h[B>>3];j=(+h[Z+24>>3]-p*S)/t;s=+h[a+16>>3];T=+h[a+8>>3];r=+h[a>>3];q=(+h[Z>>3]-p*s-j*T)/r;k=+h[Z+56>>3];m=(+h[Z+32>>3]-S*k)/t;n=(+h[Z+8>>3]-s*k-T*m)/r;t=(+h[Z+40>>3]-S)/t;r=(+h[Z+16>>3]-s-T*t)/r;We(C)|0;We(w)|0;We(e)|0;We(o)|0;We(l)|0;We(g)|0;T=+P(+(p*p+(j*j+q*q)));s=+P(+(k*k+(m*m+n*n)));q=q/T;j=j/T;p=p/T;n=n/s;m=m/s;k=k/s;s=(T+s)*.5;r=r/s;T=1.0/s;if(T<0.0){O=-j;k=-k;m=-m;p=-p;n=-n;Q=-q;S=-r;R=-T}else{O=j;Q=q;S=r;R=t/s}j=k*O-m*p;q=n*p-k*Q;r=m*Q-n*O;s=+P(+(r*r+(j*j+q*q)));do if(!(s==0.0)){t=j/s;q=q/s;j=r/s;N=k*p+(m*O+n*Q);N=N<0.0?-N:N;N=(+P(+(N+1.0))+ +P(+(1.0-N)))*.5;if(Q*q-O*t!=0.0){g=0;E=Q;v=O;F=p;I=t;H=q}else{Z=Q*j-p*t!=0.0;g=Z?1:2;E=Z?Q:p;v=Z?p:O;F=Z?O:Q;I=Z?t:j;H=Z?j:q;j=Z?q:t}r=E*H;s=v*I;q=r-s;if(q==0.0){q=O;j=Q;break}G=(v*j-F*H)/q;A=N*H/q;r=s-r;q=(E*j-F*I)/r;r=N*I/r;s=G*G+q*q+1.0;t=G*A+q*r;v=t*t-s*(A*A+r*r+-1.0);if(v<0.0){q=O;j=Q;break}M=+P(+v);L=(M-t)/s;F=A+G*L;K=r+q*L;M=(-t-M)/s;G=A+G*M;r=r+q*M;Z=(g|0)==1;q=Z?H:j;s=Z?j:H;J=Z?L:K;L=Z?K:L;K=Z?M:r;H=Z?r:M;Z=(g|0)==2&(Z^1);r=Z?I:q;q=Z?q:I;M=Z?L:F;L=Z?F:L;j=Z?H:G;I=Z?G:H;if(n*s-m*q!=0.0){g=0;E=n;v=m;F=k;H=q;A=s}else{Z=n*r-k*q!=0.0;g=Z?1:2;E=Z?n:k;v=Z?k:m;F=Z?m:n;H=Z?q:r;A=Z?r:s;r=Z?s:q}s=E*A;t=v*H;q=s-t;if(q==0.0){q=O;j=Q;break}G=(v*r-F*A)/q;A=N*A/q;q=t-s;v=(E*r-F*H)/q;q=N*H/q;r=G*G+v*v+1.0;s=G*A+v*q;t=s*s-r*(A*A+q*q+-1.0);if(t<0.0){q=O;j=Q;break}t=+P(+t);k=(t-s)/r;Q=A+G*k;O=q+v*k;t=(-s-t)/r;p=A+G*t;n=q+v*t;Z=(g|0)==1;m=Z?k:O;k=Z?O:k;v=Z?t:n;t=Z?n:t;Z=(g|0)==2&(Z^1);n=Z?k:Q;k=Z?Q:k;A=Z?t:p;t=Z?p:t;p=L*k+(J*m+M*n);p=p<0.0?-p:p;q=L*t+(J*v+M*A);q=q<0.0?-q:q;r=I*k+(K*m+j*n);r=r<0.0?-r:r;s=I*t+(K*v+j*A);s=s<0.0?-s:s;if(p<q)if(p<r){if(p<s){q=J;p=L;j=M;break}q=K;k=t;m=v;p=I;n=A;break}else{if(r<s){q=K;p=I;break}q=K;k=t;m=v;p=I;n=A;break}else if(q<r){if(q<s){q=J;k=t;m=v;p=L;n=A;j=M;break}q=K;k=t;m=v;p=I;n=A;break}else{if(r<s){q=K;p=I;break}q=K;k=t;m=v;p=I;n=A;break}}else{q=O;j=Q}while(0);M=k*q-m*p;N=n*p-k*j;O=m*j-n*q;Q=+P(+(O*O+(M*M+N*N)));h[f>>3]=j;h[f+32>>3]=q;h[f+64>>3]=p;h[f+8>>3]=n;h[f+40>>3]=m;h[f+72>>3]=k;h[f+16>>3]=M/Q;h[f+48>>3]=N/Q;h[f+80>>3]=O/Q;h[f+24>>3]=S;h[f+56>>3]=R;h[f+88>>3]=T;g=0}else g=-1}else g=-1;while(0);i=U;return g|0}function Ff(a){a=a|0;Vj(c[a>>2]|0);Vj(a);return 0}function Gf(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return +(+If(a,b,c,d,0))}function Hf(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return +(+If(a,b,c,d,1))}function If(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0.0,j=0,k=0,l=0,m=0,n=0.0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;F=i;i=i+208|0;z=F+200|0;y=F+192|0;A=F+96|0;B=F;C=e+4|0;p=c[C>>2]|0;q=e+112|0;r=e+120|0;if((p|0)>0){u=c[e>>2]|0;v=(d|0)>0;w=(d|0)>0;x=0;do{if(!(c[u+(x*320|0)+4>>2]|0)){if(v){k=c[u+(x*320|0)>>2]|0;l=0;j=-1;do{if((c[b+(l<<8)+8>>2]|0)==(k|0)?(n=+h[b+(l<<8)+40>>3],!(n<+h[q>>3])):0)if(!((j|0)!=-1?!(+h[b+(j<<8)+40>>3]<n):0))j=l;l=l+1|0}while((l|0)<(d|0))}else j=-1;c[u+(x*320|0)+304>>2]=j;if((j|0)>-1)c[b+(j<<8)+16>>2]=c[b+(j<<8)+20>>2]}else{l=u+(x*320|0)+312|0;m=u+(x*320|0)|0;if(w){o=0;j=-1;do{k=c[b+(o<<8)+12>>2]|0;if((k|0)==0?(t=b+(o<<8)+248|0,s=c[t>>2]|0,t=c[t+4>>2]|0,!((s|0)==0&(t|0)==0)):0){k=l;if((s|0)==(c[k>>2]|0)?(t|0)==(c[k+4>>2]|0):0)E=20}else if((k|0)==(c[m>>2]|0))E=20;if((E|0)==20){E=0;g=+h[b+(o<<8)+48>>3];if(!(g<+h[r>>3]))if(!((j|0)!=-1?!(+h[b+(j<<8)+48>>3]<g):0))j=o}o=o+1|0}while((o|0)<(d|0))}else j=-1;c[u+(x*320|0)+304>>2]=j;if((j|0)>-1)c[b+(j<<8)+16>>2]=c[b+(j<<8)+24>>2]}x=x+1|0}while((x|0)<(p|0))}if((p|0)>0){q=0;j=0;p=0;k=0;while(1){l=c[e>>2]|0;m=c[l+(q*320|0)+304>>2]|0;do if((m|0)<0)l=p;else{o=b+(m<<8)|0;if(+ke(a,o,+h[l+(q*320|0)+8>>3],B)>4.0){c[(c[e>>2]|0)+(q*320|0)+304>>2]=-1;l=b+(m<<8)+236|0;if(c[l>>2]|0){l=p;break}c[l>>2]=7;l=p;break}l=c[o>>2]|0;if((k|0)==0|(p|0)<(l|0)){j=0;do{h[A+(j<<5)>>3]=+h[B+(j<<5)>>3];h[A+(j<<5)+8>>3]=+h[B+(j<<5)+8>>3];h[A+(j<<5)+16>>3]=+h[B+(j<<5)+16>>3];h[A+(j<<5)+24>>3]=+h[B+(j<<5)+24>>3];j=j+1|0}while((j|0)!=3);j=q}else l=p;k=k+1|0}while(0);q=q+1|0;if((q|0)>=(c[C>>2]|0))break;else p=l}}else{j=0;k=0}do if((k|0)!=0?(k|0)>=(c[e+128>>2]|0):0){Ne(A,(c[e>>2]|0)+(j*320|0)+112|0,B)|0;p=k<<2;r=Uj(k<<6)|0;if(!r){Me(3,5472,y);rb(1)}q=Uj(k*96|0)|0;if(!q){Me(3,5472,z);rb(1)}l=c[C>>2]|0;if((l|0)>0){m=c[e>>2]|0;o=0;j=0;do{k=c[m+(o*320|0)+304>>2]|0;if((k|0)>=0){y=c[b+(k<<8)+16>>2]|0;d=(4-y|0)%4|0;z=j<<3;h[r+(z<<3)>>3]=+h[b+(k<<8)+168+(d<<4)>>3];h[r+((z|1)<<3)>>3]=+h[b+(k<<8)+168+(d<<4)+8>>3];d=(5-y|0)%4|0;h[r+((z|2)<<3)>>3]=+h[b+(k<<8)+168+(d<<4)>>3];h[r+((z|3)<<3)>>3]=+h[b+(k<<8)+168+(d<<4)+8>>3];d=(6-y|0)%4|0;h[r+((z|4)<<3)>>3]=+h[b+(k<<8)+168+(d<<4)>>3];h[r+((z|5)<<3)>>3]=+h[b+(k<<8)+168+(d<<4)+8>>3];y=(7-y|0)%4|0;h[r+((z|6)<<3)>>3]=+h[b+(k<<8)+168+(y<<4)>>3];h[r+((z|7)<<3)>>3]=+h[b+(k<<8)+168+(y<<4)+8>>3];z=j*12|0;h[q+(z<<3)>>3]=+h[m+(o*320|0)+208>>3];h[q+((z|1)<<3)>>3]=+h[m+(o*320|0)+216>>3];h[q+((z|2)<<3)>>3]=+h[m+(o*320|0)+224>>3];h[q+((z|3)<<3)>>3]=+h[m+(o*320|0)+232>>3];h[q+(z+4<<3)>>3]=+h[m+(o*320|0)+240>>3];h[q+(z+5<<3)>>3]=+h[m+(o*320|0)+248>>3];h[q+(z+6<<3)>>3]=+h[m+(o*320|0)+256>>3];h[q+(z+7<<3)>>3]=+h[m+(o*320|0)+264>>3];h[q+(z+8<<3)>>3]=+h[m+(o*320|0)+272>>3];h[q+(z+9<<3)>>3]=+h[m+(o*320|0)+280>>3];y=c[e>>2]|0;h[q+(z+10<<3)>>3]=+h[y+(o*320|0)+288>>3];h[q+(z+11<<3)>>3]=+h[y+(o*320|0)+296>>3];j=j+1|0}o=o+1|0}while((o|0)<(l|0))}m=e+104|0;k=(f|0)!=0;if(!(c[m>>2]|0)){j=e+8|0;g=+me(a,B,r,q,p,j);if(k&g>=20.0){yf(c[a>>2]|0,.8)|0;g=+ne(a,B,r,q,p,j);if(g>=20.0){yf(c[a>>2]|0,.6)|0;g=+ne(a,B,r,q,p,j);if(g>=20.0){yf(c[a>>2]|0,.4)|0;g=+ne(a,B,r,q,p,j);if(g>=20.0){yf(c[a>>2]|0,0.0)|0;g=+ne(a,B,r,q,p,j)}}}}Vj(q);Vj(r)}else{g=+me(a,B,r,q,p,A);l=e+8|0;n=+me(a,l,r,q,p,l);j=g<n;do if(k){if(j){j=0;do{h[e+8+(j<<5)>>3]=+h[A+(j<<5)>>3];h[e+8+(j<<5)+8>>3]=+h[A+(j<<5)+8>>3];h[e+8+(j<<5)+16>>3]=+h[A+(j<<5)+16>>3];h[e+8+(j<<5)+24>>3]=+h[A+(j<<5)+24>>3];j=j+1|0}while((j|0)!=3)}else g=n;if(g>=20.0){yf(c[a>>2]|0,.8)|0;g=+ne(a,B,r,q,p,A);n=+ne(a,l,r,q,p,l);if(g<n){j=0;do{h[e+8+(j<<5)>>3]=+h[A+(j<<5)>>3];h[e+8+(j<<5)+8>>3]=+h[A+(j<<5)+8>>3];h[e+8+(j<<5)+16>>3]=+h[A+(j<<5)+16>>3];h[e+8+(j<<5)+24>>3]=+h[A+(j<<5)+24>>3];j=j+1|0}while((j|0)!=3)}else g=n;if(g>=20.0){yf(c[a>>2]|0,.6)|0;g=+ne(a,B,r,q,p,A);n=+ne(a,l,r,q,p,l);if(g<n){j=0;do{h[e+8+(j<<5)>>3]=+h[A+(j<<5)>>3];h[e+8+(j<<5)+8>>3]=+h[A+(j<<5)+8>>3];h[e+8+(j<<5)+16>>3]=+h[A+(j<<5)+16>>3];h[e+8+(j<<5)+24>>3]=+h[A+(j<<5)+24>>3];j=j+1|0}while((j|0)!=3)}else g=n;if(g>=20.0){yf(c[a>>2]|0,.4)|0;g=+ne(a,B,r,q,p,A);n=+ne(a,l,r,q,p,l);if(g<n){j=0;do{h[e+8+(j<<5)>>3]=+h[A+(j<<5)>>3];h[e+8+(j<<5)+8>>3]=+h[A+(j<<5)+8>>3];h[e+8+(j<<5)+16>>3]=+h[A+(j<<5)+16>>3];h[e+8+(j<<5)+24>>3]=+h[A+(j<<5)+24>>3];j=j+1|0}while((j|0)!=3)}else g=n;if(g>=20.0){yf(c[a>>2]|0,0.0)|0;g=+ne(a,B,r,q,p,A);n=+ne(a,l,r,q,p,l);if(g<n)j=0;else{g=n;break}do{h[e+8+(j<<5)>>3]=+h[A+(j<<5)>>3];h[e+8+(j<<5)+8>>3]=+h[A+(j<<5)+8>>3];h[e+8+(j<<5)+16>>3]=+h[A+(j<<5)+16>>3];h[e+8+(j<<5)+24>>3]=+h[A+(j<<5)+24>>3];j=j+1|0}while((j|0)!=3)}}}}}else if(j){j=0;do{h[e+8+(j<<5)>>3]=+h[A+(j<<5)>>3];h[e+8+(j<<5)+8>>3]=+h[A+(j<<5)+8>>3];h[e+8+(j<<5)+16>>3]=+h[A+(j<<5)+16>>3];h[e+8+(j<<5)+24>>3]=+h[A+(j<<5)+24>>3];j=j+1|0}while((j|0)!=3)}else g=n;while(0);Vj(q);Vj(r)}if(g<20.0){c[m>>2]=1;break}c[m>>2]=0;m=c[C>>2]|0;if((m|0)>0){j=c[e>>2]|0;l=0;do{k=c[j+(l*320|0)+304>>2]|0;if((k|0)>=0?(D=b+(k<<8)+236|0,(c[D>>2]|0)==0):0)c[D>>2]=8;l=l+1|0}while((l|0)<(m|0))}}else E=38;while(0);if((E|0)==38){c[e+104>>2]=0;g=-1.0}i=F;return +g}function Jf(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0.0,W=0.0;U=i;i=i+2544|0;S=U+208|0;R=U+200|0;G=U+184|0;Q=U+176|0;F=U+168|0;E=U+152|0;P=U+144|0;D=U+136|0;M=U+128|0;L=U+120|0;K=U+112|0;C=U+104|0;j=U+96|0;g=U+88|0;f=U+80|0;e=U+72|0;d=U+64|0;H=U;I=U+2280|0;J=U+232|0;z=U+224|0;O=U+220|0;A=U+216|0;B=U+212|0;T=_i(a,5306)|0;a:do if(!T){c[d>>2]=a;Me(3,5308,d);d=ri(c[(qi()|0)>>2]|0)|0;c[e>>2]=5367;c[e+4>>2]=d;Me(3,5361,e);d=0}else{Kf(I,T);c[f>>2]=O;if((kj(I,5368,f)|0)!=1){c[g>>2]=a;Me(3,5371,g);Wi(T)|0;d=0;break}d=c[O>>2]|0;N=Uj(d*320|0)|0;if(!N){Me(3,5472,j);rb(1)}r=H+8|0;s=H+16|0;t=H+24|0;u=H+32|0;v=H+40|0;w=H+48|0;x=H+56|0;y=(b|0)==0;b:do if((d|0)>0){d=0;f=0;c:while(1){Kf(I,T);e=N+(d*320|0)|0;g=N+(d*320|0)+312|0;c[C>>2]=g;c[C+4>>2]=z;if((kj(I,5489,C)|0)==1){q=c[g>>2]|0;c[e>>2]=(q&-32768|0)==0&0==0?q&32767:0;c[N+(d*320|0)+4>>2]=1;f=f|2}else{if(y){e=10;break}if(!(Qe(J,a,2048,1)|0)){e=12;break}Cj(J,I,2047-(Bj(J)|0)|0)|0;q=Ke(b,J)|0;c[e>>2]=q;if((q|0)<0){e=14;break}c[N+(d*320|0)+4>>2]=0;f=f|1}Kf(I,T);e=N+(d*320|0)+8|0;c[D>>2]=e;if((kj(I,5785,D)|0)!=1){e=18;break}Kf(I,T);o=N+(d*320|0)+16|0;p=N+(d*320|0)+24|0;q=N+(d*320|0)+40|0;c[E>>2]=o;c[E+4>>2]=p;c[E+8>>2]=N+(d*320|0)+32;c[E+12>>2]=q;if((kj(I,5894,E)|0)!=4){c[F>>2]=A;c[F+4>>2]=B;if((kj(I,5910,F)|0)==2)g=0;else{e=21;break}}else g=1;do{Kf(I,T);c[G>>2]=N+(d*320|0)+16+(g<<5);c[G+4>>2]=N+(d*320|0)+16+(g<<5)+8;c[G+8>>2]=N+(d*320|0)+16+(g<<5)+16;c[G+12>>2]=N+(d*320|0)+16+(g<<5)+24;if((kj(I,5894,G)|0)!=4){e=23;break c}g=g+1|0}while((g|0)<3);Oe(o,N+(d*320|0)+112|0)|0;W=+h[e>>3];V=W*-.5;h[H>>3]=V;W=W*.5;h[r>>3]=W;h[s>>3]=W;h[t>>3]=W;h[u>>3]=W;h[v>>3]=V;h[w>>3]=V;h[x>>3]=V;e=N+(d*320|0)+48|0;g=N+(d*320|0)+56|0;j=N+(d*320|0)+72|0;k=N+(d*320|0)+80|0;l=N+(d*320|0)+88|0;m=N+(d*320|0)+104|0;n=0;do{V=+h[H+(n<<4)>>3];W=+h[H+(n<<4)+8>>3];h[N+(d*320|0)+208+(n*24|0)>>3]=+h[q>>3]+(+h[o>>3]*V+ +h[p>>3]*W);h[N+(d*320|0)+208+(n*24|0)+8>>3]=+h[j>>3]+(+h[e>>3]*V+ +h[g>>3]*W);h[N+(d*320|0)+208+(n*24|0)+16>>3]=+h[m>>3]+(+h[k>>3]*V+ +h[l>>3]*W);n=n+1|0}while((n|0)!=4);d=d+1|0;if((d|0)>=(c[O>>2]|0))break b}if((e|0)==10){c[K>>2]=a;c[K+4>>2]=I;Me(3,5496,K)}else if((e|0)==12){c[L>>2]=a;Me(3,5624,L)}else if((e|0)==14){c[M>>2]=a;c[M+4>>2]=J;Me(3,5708,M)}else if((e|0)==18){c[P>>2]=a;c[P+4>>2]=d+1;Me(3,5789,P)}else if((e|0)==21){c[Q>>2]=a;c[Q+4>>2]=d+1;Me(3,5916,Q)}else if((e|0)==23){c[R>>2]=a;c[R+4>>2]=d+1;Me(3,5916,R)}Wi(T)|0;Vj(N);d=0;break a}else f=0;while(0);Wi(T)|0;d=Uj(136)|0;if(!d){Me(3,5472,S);rb(1)}c[d>>2]=N;c[d+4>>2]=c[O>>2];c[d+104>>2]=0;do if((f&3|0)!=3){e=d+108|0;if(!(f&1)){c[e>>2]=1;break}else{c[e>>2]=0;break}}else c[d+108>>2]=2;while(0);h[d+112>>3]=.5;h[d+120>>3]=.5}while(0);i=U;return d|0}function Kf(b,c){b=b|0;c=c|0;var d=0,e=0;a:do if(Zi(b,256,c)|0)while(1){d=Bj(b)|0;b:do if(d)while(1){d=d+-1|0;e=b+d|0;switch(a[e>>0]|0){case 13:case 10:break;default:break b}a[e>>0]=0;if(!d)break b}while(0);switch(a[b>>0]|0){case 0:case 35:break;default:break a}if(!(Zi(b,256,c)|0))break a}while(0);return}function Lf(a,b,d,e){a=a|0;b=+b;d=+d;e=e|0;var f=0,g=0.0,j=0.0,k=0,l=0.0,m=0.0,n=0,o=0,p=0,q=0,r=0;r=i;i=i+400|0;n=r+296|0;q=r+200|0;o=r+128|0;p=r;k=c[a>>2]|0;f=c[a+4>>2]|0;if((bf(a+8|0,n,q)|0)<0)Me(3,6025,r+392|0);else{j=+(f+-1|0);f=n+32|0;h[f>>3]=j*+h[n+64>>3]-+h[f>>3];f=n+40|0;h[f>>3]=j*+h[n+72>>3]-+h[f>>3];f=n+48|0;h[f>>3]=j*+h[n+80>>3]-+h[f>>3];f=n+56|0;h[f>>3]=j*+h[n+88>>3]-+h[f>>3];g=+h[n+80>>3];f=0;do{h[o+(f*24|0)>>3]=+h[n+(f<<5)>>3]/g;h[o+(f*24|0)+8>>3]=+h[n+(f<<5)+8>>3]/g;h[o+(f*24|0)+16>>3]=+h[n+(f<<5)+16>>3]/g;f=f+1|0}while((f|0)!=3);g=+(k+-1|0);h[p>>3]=+h[o>>3]*2.0/g;h[p+8>>3]=+h[o+8>>3]*2.0/g;h[p+16>>3]=+h[o+16>>3]*2.0/g+-1.0;k=p+24|0;c[k>>2]=0;c[k+4>>2]=0;c[k+8>>2]=0;c[k+12>>2]=0;h[p+40>>3]=+h[o+32>>3]*2.0/j;h[p+48>>3]=+h[o+40>>3]*2.0/j+-1.0;k=p+56|0;g=d-b;c[k>>2]=0;c[k+4>>2]=0;c[k+8>>2]=0;c[k+12>>2]=0;c[k+16>>2]=0;c[k+20>>2]=0;h[p+80>>3]=(b+d)/g;h[p+88>>3]=d*-2.0*b/g;k=p+96|0;c[k>>2]=0;c[k+4>>2]=0;c[k+8>>2]=0;c[k+12>>2]=0;h[p+112>>3]=1.0;h[p+120>>3]=0.0;g=+h[q+24>>3];j=+h[q+56>>3];d=+h[q+88>>3];k=0;do{b=+h[p+(k<<5)>>3];f=p+(k<<5)+8|0;a=p+(k<<5)+16|0;l=+h[f>>3];m=+h[a>>3];n=0;do{h[e+((n<<2)+k<<3)>>3]=b*+h[q+(n<<3)>>3]+l*+h[q+32+(n<<3)>>3]+m*+h[q+64+(n<<3)>>3];n=n+1|0}while((n|0)!=3);h[e+(k+12<<3)>>3]=+h[p+(k<<5)+24>>3]+(b*g+ +h[f>>3]*j+ +h[a>>3]*d);k=k+1|0}while((k|0)!=4)}i=r;return}function Mf(a){a=a|0;c[496]=a;return}function Nf(){return c[496]|0}function Of(a){a=a|0;var b=0,d=0;b=a+212|0;d=c[b>>2]|0;if(d){ze(d)|0;Qd(c[b>>2]|0)|0;c[b>>2]=0}b=a+224|0;if(c[b>>2]|0){Ld(b)|0;c[b>>2]=0}b=a+192|0;if(c[b>>2]|0){kf(b)|0;c[b>>2]=0}return}function Pf(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;g=i;i=i+16|0;d=g;c[d>>2]=a;if(!(Cg(2044,d)|0))a=-1;else{f=Dg(2044,d)|0;a=f+196|0;b=c[a>>2]|0;if(b){Vj(b);c[a>>2]=0;c[f+200>>2]=0}Of(f);Ce(c[f+216>>2]|0)|0;Eg(2044,d)|0;d=f+248|0;e=f+252|0;a=c[d>>2]|0;if((c[e>>2]|0)!=(a|0)){b=0;do{Ff(c[a+(b<<3)+4>>2]|0)|0;b=b+1|0;a=c[d>>2]|0}while(b>>>0<(c[e>>2]|0)-a>>3>>>0)}Fg(d);Lh(d);Fg(f+248|0);Lh(f);a=0}i=g;return a|0}function Qf(b){b=b|0;var d=0,e=0,f=0,g=0,h=0;h=i;i=i+208|0;g=h+192|0;f=h;e=h+196|0;if(!(a[b>>0]&1))d=b+1|0;else d=c[b+8>>2]|0;if((ef(d,1,f,h+184|0)|0)<0){if(!(a[b>>0]&1))d=b+1|0;else d=c[b+8>>2]|0;c[g>>2]=d;Me(3,6093,g);d=-1}else{d=c[521]|0;c[521]=d+1;c[e>>2]=d;ik(Gg(2064,e)|0,f|0,184)|0}i=h;return d|0}function Rf(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,j=0,k=0,l=0,m=0,n=0;n=i;i=i+48|0;m=n+24|0;l=n+16|0;j=n+8|0;f=n;d=n+32|0;e=n+28|0;c[d>>2]=a;c[e>>2]=b;do if((Cg(2044,d)|0)!=0?(k=Dg(2044,d)|0,(Hg(2064,e)|0)!=0):0){g=k+8|0;ik(g|0,Gg(2064,e)|0,184)|0;e=c[g>>2]|0;d=k+204|0;b=c[k+12>>2]|0;a=k+208|0;if(!((e|0)==(c[d>>2]|0)?(b|0)==(c[a>>2]|0):0)){c[f>>2]=e;c[f+4>>2]=b;Me(2,6152,f);af(g,c[d>>2]|0,c[a>>2]|0,g)|0}Of(k);d=jf(g,15)|0;a=k+192|0;c[a>>2]=d;if(!d){Me(3,6199,j);d=-1;break}d=Md(d)|0;b=k+212|0;c[b>>2]=d;if(!d){Me(3,6237,l);d=-1;break}Nd(d,2)|0;l=Jd(g)|0;c[k+224>>2]=l;if(!l){Me(3,6274,m);d=-1;break}else{ye(c[b>>2]|0,c[k+216>>2]|0)|0;Lf(c[a>>2]|0,+h[k+232>>3],+h[k+240>>3],k+264|0);d=0;break}}else d=-1;while(0);i=n;return d|0}function Sf(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;j=i;i=i+16|0;h=j+8|0;g=j;e=j+12|0;c[e>>2]=b;if(Cg(2044,e)|0){f=Dg(2044,e)|0;if(!(a[d>>0]&1))d=d+1|0;else d=c[d+8>>2]|0;b=f+216|0;e=Ke(c[b>>2]|0,d)|0;c[f+260>>2]=e;if((e|0)<0){c[g>>2]=d;Me(3,6312,g);Ce(c[b>>2]|0)|0;Me(3,6358,h);e=-1}}else e=-1;i=j;return e|0}function Tf(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0;l=i;i=i+32|0;g=l+16|0;f=l+8|0;e=l+20|0;k=l;c[e>>2]=b;do if(Cg(2044,e)|0){j=Dg(2044,e)|0;if(!(a[d>>0]&1))e=d+1|0;else e=c[d+8>>2]|0;b=c[j+212>>2]|0;d=j+216|0;h=j+220|0;e=Jf(e,c[d>>2]|0)|0;c[h>>2]=e;if(!e){Me(3,6402,f);Ce(c[d>>2]|0)|0;Me(3,6429,g);e=-1;break}switch(c[e+108>>2]|0){case 0:{Zd(b,0)|0;break}case 1:{Zd(b,2)|0;break}default:Zd(b,3)|0}b=j+248|0;d=j+252|0;f=c[d>>2]|0;e=f-(c[b>>2]|0)>>3;g=k;c[g>>2]=0;c[g+4>>2]=0;c[k>>2]=e;c[k+4>>2]=c[h>>2];if((f|0)==(c[j+256>>2]|0)){Ig(b,k);break}else{j=k;e=c[j>>2]|0;j=c[j+4>>2]|0;k=f;c[k>>2]=e;c[k+4>>2]=j;c[d>>2]=(c[d>>2]|0)+8;break}}else e=-1;while(0);i=l;return e|0}function Uf(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;g=i;i=i+16|0;d=g;c[d>>2]=a;if(((Cg(2044,d)|0)!=0?(e=Dg(2044,d)|0,(b|0)>=0):0)?(f=c[e+248>>2]|0,(c[e+252>>2]|0)-f>>3>>>0>b>>>0):0)d=c[(c[f+(b<<3)+4>>2]|0)+4>>2]|0;else d=-1;i=g;return d|0}function Vf(a){a=a|0;var b=0,d=0;d=i;i=i+16|0;b=d;c[b>>2]=a;if(!(Cg(2044,b)|0))b=-1;else{b=Dg(2044,b)|0;b=(c[b+252>>2]|0)-(c[b+248>>2]|0)>>3}i=d;return b|0}function Wf(a,b){a=a|0;b=+b;var d=0,e=0;e=i;i=i+16|0;d=e;c[d>>2]=a;if(Cg(2044,d)|0)h[(Dg(2044,d)|0)+232>>3]=b;i=e;return}function Xf(a){a=a|0;var b=0.0,d=0,e=0;e=i;i=i+16|0;d=e;c[d>>2]=a;if(!(Cg(2044,d)|0))b=-1.0;else b=+h[(Dg(2044,d)|0)+232>>3];i=e;return +b}function Yf(a,b){a=a|0;b=+b;var d=0,e=0;e=i;i=i+16|0;d=e;c[d>>2]=a;if(Cg(2044,d)|0)h[(Dg(2044,d)|0)+240>>3]=b;i=e;return}function Zf(a){a=a|0;var b=0.0,d=0,e=0;e=i;i=i+16|0;d=e;c[d>>2]=a;if(!(Cg(2044,d)|0))b=-1.0;else b=+h[(Dg(2044,d)|0)+240>>3];i=e;return +b}function _f(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;f=i;i=i+16|0;e=f;d=f+4|0;c[d>>2]=a;if((Cg(2044,d)|0)!=0?(Zd(c[(Dg(2044,d)|0)+212>>2]|0,b)|0)==0:0){c[e>>2]=b;Me(1,6478,e)}i=f;return}function $f(a){a=a|0;var b=0,d=0,e=0;e=i;i=i+16|0;b=e+4|0;d=e;c[b>>2]=a;if(!(Cg(2044,b)|0)){i=e;return -1}else{a=(ae(c[(Dg(2044,b)|0)+212>>2]|0,d)|0)==0;i=e;return (a?c[d>>2]|0:-1)|0}return 0}function ag(a,b){a=a|0;b=+b;var d=0,e=0,f=0.0,g=0,j=0,k=0;k=i;i=i+16|0;j=k;d=k+8|0;c[d>>2]=a;if((((Cg(2044,d)|0)!=0?(e=Dg(2044,d)|0,!(b<=0.0|b>=1.0)):0)?(f=b,g=c[e+212>>2]|0,(g|0)!=0):0)?(be(g,f)|0)==0:0){h[j>>3]=f;Me(1,6513,j)}i=k;return}function bg(a){a=a|0;var b=0,d=0,e=0,f=0;f=i;i=i+16|0;b=f+8|0;e=f;c[b>>2]=a;if((Cg(2044,b)|0)!=0?(d=c[(Dg(2044,b)|0)+212>>2]|0,(d|0)!=0):0){a=(ce(d,e)|0)==0;i=f;return +(a?+h[e>>3]:-1.0)}i=f;return -1.0}function cg(a,b){a=a|0;b=b|0;var d=0,e=0;e=i;i=i+16|0;d=e;c[d>>2]=a;if(Cg(2044,d)|0)_d(c[(Dg(2044,d)|0)+212>>2]|0,b)|0;i=e;return}function dg(a){a=a|0;var b=0,d=0,e=0;e=i;i=i+16|0;b=e+4|0;d=e;c[b>>2]=a;if(!(Cg(2044,b)|0))b=-1;else{$d(c[(Dg(2044,b)|0)+212>>2]|0,d)|0;b=c[d>>2]|0}i=e;return b|0}function eg(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;f=i;i=i+16|0;e=f;d=f+4|0;c[d>>2]=a;if((Cg(2044,d)|0)!=0?(Sd(c[(Dg(2044,d)|0)+212>>2]|0,b)|0)==0:0){c[e>>2]=b;Me(1,6544,e)}i=f;return}function fg(a){a=a|0;var b=0,d=0,e=0;e=i;i=i+16|0;b=e+4|0;d=e;c[b>>2]=a;if(!(Cg(2044,b)|0)){i=e;return -1}else{a=(Td(c[(Dg(2044,b)|0)+212>>2]|0,d)|0)==0;i=e;return (a?c[d>>2]|0:-1)|0}return 0}function gg(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;g=i;i=i+16|0;f=g;d=g+4|0;c[d>>2]=a;if(((Cg(2044,d)|0)!=0?(e=Dg(2044,d)|0,b>>>0<=255):0)?(Ud(c[e+212>>2]|0,b)|0)==0:0){c[f>>2]=b;Me(1,6569,f)}i=g;return}function hg(a){a=a|0;var b=0,d=0,e=0;e=i;i=i+16|0;b=e+4|0;d=e;c[b>>2]=a;if(!(Cg(2044,b)|0)){i=e;return -1}else{a=(Vd(c[(Dg(2044,b)|0)+212>>2]|0,d)|0)==0;i=e;return (a?c[d>>2]|0:-1)|0}return 0}function ig(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;f=i;i=i+16|0;e=f;d=f+4|0;c[d>>2]=a;if((Cg(2044,d)|0)!=0?(Pd(c[(Dg(2044,d)|0)+212>>2]|0,b)|0)==0:0){c[e>>2]=b;Me(1,6590,e)}i=f;return}function jg(a){a=a|0;var b=0,d=0,e=0;e=i;i=i+16|0;b=e+4|0;d=e;c[b>>2]=a;if(!(Cg(2044,b)|0)){i=e;return -1}else{a=(Wd(c[(Dg(2044,b)|0)+212>>2]|0,d)|0)==0;i=e;return (a?c[d>>2]|0:-1)|0}return 0}function kg(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;f=i;i=i+16|0;e=f;d=f+4|0;c[d>>2]=a;if(!(Cg(2044,d)|0))b=0;else{a=(b|0)!=0;Od(c[(Dg(2044,d)|0)+212>>2]|0,a&1)|0;c[e>>2]=a?6616:6620;Me(1,6625,e)}i=f;return b|0}function lg(a){a=a|0;var b=0,d=0;d=i;i=i+16|0;b=d;c[b>>2]=a;if(!(Cg(2044,b)|0))b=0;else b=c[(c[(Dg(2044,b)|0)+212>>2]|0)+4834148>>2]|0;i=d;return b|0}function mg(a){a=a|0;var b=0,d=0,e=0;e=i;i=i+16|0;b=e+4|0;d=e;c[b>>2]=a;if(!(Cg(2044,b)|0))b=0;else{Rd(c[(Dg(2044,b)|0)+212>>2]|0,d)|0;b=c[d>>2]|0}i=e;return b|0}function ng(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;f=i;i=i+16|0;e=f;d=f+4|0;c[d>>2]=a;if((Cg(2044,d)|0)!=0?(Xd(c[(Dg(2044,d)|0)+212>>2]|0,b)|0)==0:0){c[e>>2]=b;Me(1,6647,e)}i=f;return}function og(a){a=a|0;var b=0,d=0,e=0;e=i;i=i+16|0;b=e+4|0;d=e;c[b>>2]=a;if(!(Cg(2044,b)|0)){i=e;return -1}else{a=(Yd(c[(Dg(2044,b)|0)+212>>2]|0,d)|0)==0;i=e;return (a?c[d>>2]|0:-1)|0}return 0}function pg(a,b){a=a|0;b=b|0;var c=0;c=0;do{h[b+(c<<5)>>3]=+h[a+(c<<5)>>3];h[b+(c<<5)+8>>3]=+h[a+(c<<5)+8>>3];h[b+(c<<5)+16>>3]=+h[a+(c<<5)+16>>3];h[b+(c<<5)+24>>3]=+h[a+(c<<5)+24>>3];c=c+1|0}while((c|0)!=3);return}function qg(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;f=i;i=i+16|0;e=f;c[e>>2]=a;do if(Cg(2044,e)|0){e=Dg(2044,e)|0;a=c[e+212>>2]|0;if((c[a+44>>2]|0)>(b|0)){+ke(c[e+224>>2]|0,(b|0)<0?8:a+48+(b<<8)|0,+(d|0),264);e=0;break}else{e=c[523]|0;break}}else e=c[522]|0;while(0);i=f;return e|0}function rg(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;f=i;i=i+16|0;e=f;c[e>>2]=a;do if(Cg(2044,e)|0){e=Dg(2044,e)|0;a=c[e+212>>2]|0;if((c[a+44>>2]|0)>(b|0)){+le(c[e+224>>2]|0,(b|0)<0?8:a+48+(b<<8)|0,264,+(d|0),264);e=0;break}else{e=c[523]|0;break}}else e=c[522]|0;while(0);i=f;return e|0}function sg(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;f=i;i=i+16|0;e=f;c[e>>2]=a;do if(Cg(2044,e)|0){e=c[(Dg(2044,e)|0)+212>>2]|0;if((c[e+44>>2]|0)>(b|0)){c[((b|0)<0?8:e+48+(b<<8)|0)+16>>2]=d;e=0;break}else{e=c[523]|0;break}}else e=c[522]|0;while(0);i=f;return e|0}function tg(a,b){a=a|0;b=b|0;var d=0,e=0,f=0.0,g=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0;e=i;i=i+16|0;d=e;c[d>>2]=a;do if(Cg(2044,d)|0){d=c[(Dg(2044,d)|0)+212>>2]|0;if((c[d+44>>2]|0)>(b|0)){d=(b|0)<0?8:d+48+(b<<8)|0;o=+h[33];h[d+168>>3]=o;k=+h[34];h[d+176>>3]=k;n=+h[35];h[d+184>>3]=n;j=+h[36];h[d+192>>3]=j;m=+h[37];h[d+200>>3]=m;g=+h[38];h[d+208>>3]=g;l=+h[39];h[d+216>>3]=l;f=+h[40];h[d+224>>3]=f;h[d+56>>3]=(o+n+m+l)*.25;h[d+64>>3]=(k+j+g+f)*.25;d=0;break}else{d=c[523]|0;break}}else d=c[522]|0;while(0);i=e;return d|0}function ug(a,b){a=a|0;b=b|0;var d=0,e=0;e=i;i=i+16|0;d=e;c[d>>2]=a;do if(Cg(2044,d)|0){d=Dg(2044,d)|0;a=c[d+248>>2]|0;if((b|0)<0?1:(c[d+252>>2]|0)-a>>3>>>0<=b>>>0){d=c[524]|0;break}else{b=c[a+(b<<3)+4>>2]|0;a=c[d+212>>2]|0;+Hf(c[d+224>>2]|0,a+48|0,c[a+44>>2]|0,b);pg(b+8|0,264);d=0;break}}else d=c[522]|0;while(0);i=e;return d|0}function vg(a,b){a=a|0;b=b|0;var d=0,e=0;e=i;i=i+16|0;d=e;c[d>>2]=a;do if(Cg(2044,d)|0){d=Dg(2044,d)|0;a=c[d+248>>2]|0;if((b|0)<0?1:(c[d+252>>2]|0)-a>>3>>>0<=b>>>0){d=c[524]|0;break}else{b=c[a+(b<<3)+4>>2]|0;a=c[d+212>>2]|0;+Gf(c[d+224>>2]|0,a+48|0,c[a+44>>2]|0,b);pg(b+8|0,264);d=0;break}}else d=c[522]|0;while(0);i=e;return d|0}function wg(a){a=a|0;var b=0,d=0;d=i;i=i+16|0;b=d;c[b>>2]=a;if(!(Cg(2044,b)|0))b=c[522]|0;else{b=Dg(2044,b)|0;b=de(c[b+212>>2]|0,c[b+196>>2]|0)|0}i=d;return b|0}function xg(a){a=a|0;var b=0,d=0;d=i;i=i+16|0;b=d;c[b>>2]=a;if(!(Cg(2044,b)|0))b=2088;else b=(c[(Dg(2044,b)|0)+212>>2]|0)+44|0;i=d;return c[b>>2]|0}function yg(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;f=i;i=i+16|0;e=f;c[e>>2]=a;do if(Cg(2044,e)|0){a=Dg(2044,e)|0;e=c[a+248>>2]|0;if((b|0)<0?1:(c[a+252>>2]|0)-e>>3>>>0<=b>>>0){e=c[524]|0;break}e=c[e+(b<<3)+4>>2]|0;if((d|0)<0?1:(c[e+4>>2]|0)<=(d|0)){e=c[523]|0;break}else{e=c[e>>2]|0;pg(e+(d*320|0)+16|0,264);Lb(0,c[e+(d*320|0)+304>>2]|0,c[e+(d*320|0)>>2]|0,c[e+(d*320|0)+4>>2]|0,+(+h[e+(d*320|0)+8>>3]))|0;e=0;break}}else e=c[522]|0;while(0);i=f;return e|0}function zg(a,b){a=a|0;b=b|0;var d=0,e=0;e=i;i=i+16|0;d=e;c[d>>2]=a;do if(Cg(2044,d)|0){d=c[(Dg(2044,d)|0)+212>>2]|0;if((c[d+44>>2]|0)>(b|0)){d=(b|0)<0?8:d+48+(b<<8)|0;Qa(1,c[d>>2]|0,c[d+4>>2]|0,c[d+8>>2]|0,c[d+12>>2]|0,c[d+16>>2]|0,c[d+20>>2]|0,c[d+24>>2]|0,+(+h[d+32>>3]),+(+h[d+40>>3]),+(+h[d+48>>3]),+(+h[d+56>>3]),+(+h[d+64>>3]),+(+h[d+72>>3]),+(+h[d+80>>3]),+(+h[d+88>>3]),+(+h[d+96>>3]),+(+h[d+104>>3]),+(+h[d+112>>3]),+(+h[d+120>>3]),+(+h[d+128>>3]),+(+h[d+136>>3]),+(+h[d+144>>3]),+(+h[d+152>>3]),+(+h[d+160>>3]),+(+h[d+168>>3]),+(+h[d+176>>3]),+(+h[d+184>>3]),+(+h[d+192>>3]),+(+h[d+200>>3]),+(+h[d+208>>3]),+(+h[d+216>>3]),+(+h[d+224>>3]),c[d+240>>2]|0)|0;d=0;break}else{d=c[523]|0;break}}else d=c[522]|0;while(0);i=e;return d|0}function Ag(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;h=i;i=i+16|0;g=h+8|0;f=h+12|0;e=c[525]|0;c[525]=e+1;c[f>>2]=e;f=Dg(2044,f)|0;c[f>>2]=e;c[f+204>>2]=a;c[f+208>>2]=b;j=$(a<<2,b)|0;b=f+200|0;c[b>>2]=j;a=f+196|0;c[a>>2]=Uj(j)|0;j=Ae()|0;c[f+216>>2]=j;if(!j)Me(3,8285,h);Rf(e,d)|0;c[g>>2]=c[b>>2];Me(1,8322,g);Kb(2,c[f>>2]|0,c[a>>2]|0,c[b>>2]|0,f+264|0,264)|0;i=h;return c[f>>2]|0}function Bg(a){a=a|0;var b=0;a=i;i=i+16|0;b=a;Jg(8591,7);Kg(8597,3);Lg(8606,2);Lg(8617,3);Mg(8633,4);Kg(8651,4);Ng(8671,5);Jg(8683,8);Mg(8700,5);Jg(8720,9);Jg(8738,10);Mg(8760,6);Mg(8783,7);Kg(8812,6);Kg(8825,7);Jg(8838,11);Mg(8857,8);Mg(8867,9);Kg(8880,8);Kg(8893,9);Og(8912,10);Pg(8924,1);Qg(8936,1);Rg(8959,1);Qg(8982,2);Rg(9004,2);Sg(9026,1);Kg(9043,10);Sg(9060,2);Kg(9073,11);Sg(9086,3);Kg(9110,12);Tg(9134,3);Rg(9147,3);Sg(9160,4);Kg(9178,13);Sg(9196,5);Kg(9212,14);Sg(9228,6);Kg(9245,15);Ug(9262,2088);Ug(9291,2096);Ug(9319,2092);Cb(9352,680,0);Cb(9369,680,1);Cb(9385,680,0);Cb(9407,680,0);Cb(9432,680,1);Cb(9457,680,1);Cb(9482,680,100);Cb(9509,680,0);Cb(9535,680,1);Cb(9561,680,0);Cb(9588,680,0);Cb(9615,680,1);Cb(9641,680,2);Cb(9666,680,3);Cb(9704,680,4);Cb(9741,680,0);Cb(9775,680,0);Cb(9799,680,1);Cb(9825,680,2);Cb(9852,680,2);Cb(9886,680,5);h[b>>3]=.5;Vg(9904,b);Cb(9925,680,0);Cb(9944,680,1);Cb(9962,680,2);Cb(9980,680,3);Cb(9999,680,4);Cb(10021,680,3);Cb(10040,680,515);Cb(10069,680,259);Cb(10097,680,4);Cb(10116,680,772);Cb(10146,680,1028);Cb(10176,680,0);Cb(10207,680,1);Cb(10243,680,2);Cb(10277,680,3);Cb(10315,680,0);Cb(10348,680,1);Cb(10395,680,2);Cb(10437,680,3);Cb(10480,680,4);Cb(10532,680,5);Cb(10583,680,6);Cb(10628,680,7);Cb(10667,680,8);Cb(10712,680,9);i=a;return}function Cg(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=c[b>>2]|0;f=c[a+4>>2]|0;a:do if(f){g=f+-1|0;h=(g&f|0)==0;if(h)e=g&d;else e=(d>>>0)%(f>>>0)|0;b=c[(c[a>>2]|0)+(e<<2)>>2]|0;if(b)do{b=c[b>>2]|0;if(!b){b=0;break a}a=c[b+4>>2]|0;if(h)a=a&g;else a=(a>>>0)%(f>>>0)|0;if((a|0)!=(e|0)){b=0;break a}}while((c[b+8>>2]|0)!=(d|0));else b=0}else b=0;while(0);return b|0}function Dg(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;g=i;i=i+32|0;f=g+8|0;e=g;d=Cg(a,b)|0;if(!d){wh(f,a,b);xh(e,a,c[f>>2]|0);d=c[e>>2]|0;c[f>>2]=0}i=g;return d+16|0}function Eg(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;f=i;i=i+16|0;d=f+4|0;e=f;b=Cg(a,b)|0;if(!b)b=0;else{c[e>>2]=b;c[d>>2]=c[e>>2];uh(a,d)|0;b=1}i=f;return b|0}function Fg(a){a=a|0;var b=0,d=0;d=c[a>>2]|0;if(d){b=a+4|0;a=c[b>>2]|0;if((a|0)!=(d|0)){do a=a+-8|0;while((a|0)!=(d|0));c[b>>2]=a}Lh(d)}return}function Gg(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;g=i;i=i+32|0;f=g+8|0;e=g;d=Hg(a,b)|0;if(!d){qh(f,a,b);rh(e,a,c[f>>2]|0);d=c[e>>2]|0;c[f>>2]=0}i=g;return d+16|0}function Hg(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=c[b>>2]|0;f=c[a+4>>2]|0;a:do if(f){g=f+-1|0;h=(g&f|0)==0;if(h)e=g&d;else e=(d>>>0)%(f>>>0)|0;b=c[(c[a>>2]|0)+(e<<2)>>2]|0;if(b)do{b=c[b>>2]|0;if(!b){b=0;break a}a=c[b+4>>2]|0;if(h)a=a&g;else a=(a>>>0)%(f>>>0)|0;if((a|0)!=(e|0)){b=0;break a}}while((c[b+8>>2]|0)!=(d|0));else b=0}else b=0;while(0);return b|0}function Ig(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0;j=i;i=i+32|0;h=j;g=a+4|0;d=c[a>>2]|0;f=((c[g>>2]|0)-d>>3)+1|0;if(f>>>0>536870911)Jh(a);e=d;d=(c[a+8>>2]|0)-e|0;if(d>>3>>>0<268435455){d=d>>2;d=d>>>0<f>>>0?f:d}else d=536870911;nh(h,d,(c[g>>2]|0)-e>>3,a+8|0);g=h+8|0;f=c[g>>2]|0;d=b;e=c[d+4>>2]|0;b=f;c[b>>2]=c[d>>2];c[b+4>>2]=e;c[g>>2]=f+8;oh(a,h);ph(h);i=j;return}function Jg(a,b){a=a|0;b=b|0;Oa(a|0,4,2200,10911,1,b|0);return}function Kg(a,b){a=a|0;b=b|0;Oa(a|0,2,2192,10801,10,b|0);return}function Lg(a,b){a=a|0;b=b|0;Oa(a|0,3,2180,10906,12,b|0);return}function Mg(a,b){a=a|0;b=b|0;Oa(a|0,3,2168,10906,13,b|0);return}function Ng(a,b){a=a|0;b=b|0;Oa(a|0,2,2160,10801,11,b|0);return}function Og(a,b){a=a|0;b=b|0;Oa(a|0,2,2152,10797,7,b|0);return}function Pg(a,b){a=a|0;b=b|0;Oa(a|0,1,2148,10794,16,b|0);return}function Qg(a,b){a=a|0;b=b|0;Oa(a|0,3,2136,10789,1,b|0);return}function Rg(a,b){a=a|0;b=b|0;Oa(a|0,2,2128,10785,1,b|0);return}function Sg(a,b){a=a|0;b=b|0;Oa(a|0,3,2116,10780,1,b|0);return}function Tg(a,b){a=a|0;b=b|0;Oa(a|0,3,2104,10775,2,b|0);return}function Ug(a,b){a=a|0;b=b|0;Cb(a|0,680,c[b>>2]|0);return}function Vg(a,b){a=a|0;b=b|0;Cb(a|0,720,~~+h[b>>3]>>>0|0);return}function Wg(){c[511]=0;c[512]=0;c[513]=0;c[514]=0;g[515]=1.0;ub(11,2044,n|0)|0;c[516]=0;c[517]=0;c[518]=0;c[519]=0;g[520]=1.0;ub(12,2064,n|0)|0;Bg(0);return}function Xg(a){a=a|0;$g(a);return}function Yg(a){a=a|0;Zg(a);return}function Zg(a){a=a|0;var b=0;_g(a,c[a+8>>2]|0);b=c[a>>2]|0;c[a>>2]=0;if(b)Lh(b);return}function _g(a,b){a=a|0;b=b|0;if(b)do{a=b;b=c[b>>2]|0;Lh(a)}while((b|0)!=0);return}function $g(a){a=a|0;var b=0;ah(a,c[a+8>>2]|0);b=c[a>>2]|0;c[a>>2]=0;if(b)Lh(b);return}function ah(a,b){a=a|0;b=b|0;if(b)do{a=b;b=c[b>>2]|0;Fg(a+264|0);Lh(a)}while((b|0)!=0);return}function bh(a,b,c){a=a|0;b=b|0;c=+c;Tb[a&3](b,c);return}function ch(a,b,c){a=a|0;b=b|0;c=c|0;Xb[a&7](b,c);return}function dh(a,b){a=a|0;b=b|0;return +(+Ub[a&3](b))}function eh(a,b,c){a=a|0;b=b|0;c=+c;Tb[a&3](b,c);return}function fh(a){a=a|0;return Vb[a&1]()|0}function gh(a,b){a=a|0;b=b|0;Wb[a&15](b);return}function hh(a,b){a=a|0;b=b|0;var c=0,d=0;c=i;i=i+16|0;d=c;ih(d,b);a=Yb[a&31](d)|0;bk(d);i=c;return a|0}function ih(a,b){a=a|0;b=b|0;ak(a,b+4|0,c[b>>2]|0);return}function jh(a,b,c){a=a|0;b=b|0;c=c|0;return cc[a&15](b,c)|0}function kh(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0;d=i;i=i+16|0;e=d;ih(e,c);a=cc[a&15](b,e)|0;bk(e);i=d;return a|0}function lh(a,b){a=a|0;b=b|0;return Yb[a&31](b)|0}function mh(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return Qb[a&15](b,c,d)|0}function nh(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;c[a+12>>2]=0;c[a+16>>2]=e;if(!b)e=0;else e=Kh(b<<3)|0;c[a>>2]=e;d=e+(d<<3)|0;c[a+8>>2]=d;c[a+4>>2]=d;c[a+12>>2]=e+(b<<3);return}function oh(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;e=c[a>>2]|0;g=a+4|0;d=b+4|0;f=(c[g>>2]|0)-e|0;h=(c[d>>2]|0)+(0-(f>>3)<<3)|0;c[d>>2]=h;ik(h|0,e|0,f|0)|0;f=c[a>>2]|0;c[a>>2]=c[d>>2];c[d>>2]=f;f=b+8|0;e=c[g>>2]|0;c[g>>2]=c[f>>2];c[f>>2]=e;f=a+8|0;a=b+12|0;e=c[f>>2]|0;c[f>>2]=c[a>>2];c[a>>2]=e;c[b>>2]=c[d>>2];return}function ph(a){a=a|0;var b=0,d=0,e=0;d=c[a+4>>2]|0;e=a+8|0;b=c[e>>2]|0;if((b|0)!=(d|0)){do b=b+-8|0;while((b|0)!=(d|0));c[e>>2]=b}b=c[a>>2]|0;if(b)Lh(b);return}function qh(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=Kh(200)|0;c[e+8>>2]=c[d>>2];ek(e+16|0,0,184)|0;c[a>>2]=e;a=a+4|0;c[a>>2]=b+8;c[a+4>>2]=257;return}function rh(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,h=0,i=0,j=0.0,k=0.0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;m=c[e+8>>2]|0;s=e+4|0;c[s>>2]=m;r=d+4|0;l=c[r>>2]|0;q=(l|0)==0;a:do if(!q){n=l+-1|0;o=(n&l|0)==0;if(o)h=n&m;else h=(m>>>0)%(l>>>0)|0;f=c[(c[d>>2]|0)+(h<<2)>>2]|0;if(!f)p=12;else while(1){i=c[f>>2]|0;if(!i){p=12;break a}f=c[i+4>>2]|0;if(o)f=f&n;else f=(f>>>0)%(l>>>0)|0;if((f|0)!=(h|0)){p=12;break a}if((c[i+8>>2]|0)==(m|0)){f=0;e=i;break}else f=i}}else{h=0;p=12}while(0);if((p|0)==12){m=d+12|0;j=+(((c[m>>2]|0)+1|0)>>>0);k=+g[d+16>>2];do if(q|j>+(l>>>0)*k){if(l>>>0>2)f=(l+-1&l|0)==0;else f=0;i=(f&1|l<<1)^1;f=~~+_(+(j/k))>>>0;sh(d,i>>>0<f>>>0?f:i);i=c[r>>2]|0;f=c[s>>2]|0;h=i+-1|0;if(!(h&i)){l=i;h=h&f;break}else{l=i;h=(f>>>0)%(i>>>0)|0;break}}while(0);f=c[(c[d>>2]|0)+(h<<2)>>2]|0;if(!f){f=d+8|0;c[e>>2]=c[f>>2];c[f>>2]=e;c[(c[d>>2]|0)+(h<<2)>>2]=f;f=c[e>>2]|0;if(f){f=c[f+4>>2]|0;h=l+-1|0;if(!(h&l))f=f&h;else f=(f>>>0)%(l>>>0)|0;c[(c[d>>2]|0)+(f<<2)>>2]=e}}else{c[e>>2]=c[f>>2];c[f>>2]=e}c[m>>2]=(c[m>>2]|0)+1;f=1}c[b>>2]=e;a[b+4>>0]=f;return}
function zd(e,f,g,j,k){e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;E=i;i=i+16|0;C=E;p=c[k>>2]|0;B=g+-1|0;if((f|0)>0){l=0;m=p;n=p+(($(B,f)|0)<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(f|0))break;else{m=m+2|0;n=n+2|0}}}A=j*3|0;z=f+-1|0;if((g|0)>0){l=0;j=p;m=p+(z<<1)|0;while(1){b[m>>1]=0;b[j>>1]=0;l=l+1|0;if((l|0)>=(g|0))break;else{j=j+(f<<1)|0;m=m+(f<<1)|0}}}m=k+1179664|0;l=f+1|0;w=0-f|0;u=1-f|0;v=~f;a:do if((B|0)>1){x=(z|0)>1;o=(c[k+4>>2]|0)+l|0;y=1;n=e+(l*3|0)|0;e=p+(l<<1)|0;j=0;b:while(1){if(x){l=o;t=1;s=n;r=j;while(1){do if(((d[s+1>>0]|0)+(d[s>>0]|0)+(d[s+2>>0]|0)|0)>(A|0)){a[l>>0]=-1;j=b[e+(w<<1)>>1]|0;if(j<<16>>16>0){b[e>>1]=j;j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;q=k+1310736+(j+-5<<2)|0;c[q>>2]=(c[q>>2]|0)+y;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}o=b[e+(u<<1)>>1]|0;p=o<<16>>16;j=b[e+(v<<1)>>1]|0;q=j<<16>>16;n=j<<16>>16>0;if(o<<16>>16<=0){if(n){b[e>>1]=j;j=q*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+t;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+y;n=k+1310736+(j+-3<<2)|0;if((c[n>>2]|0)<(t|0))c[n>>2]=t;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}j=b[e+-2>>1]|0;if(j<<16>>16>0){b[e>>1]=j;j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;q=k+1310736+(j+-5<<2)|0;c[q>>2]=(c[q>>2]|0)+y;j=k+1310736+(j+-3<<2)|0;if((c[j>>2]|0)>=(t|0)){j=r;break}c[j>>2]=t;j=r;break}else{j=r+1|0;if((r|0)>32767)break b;b[e>>1]=j;c[k+1179664+(r<<2)>>2]=j<<16>>16;r=r*7|0;c[k+1310736+(r<<2)>>2]=1;c[k+1310736+(r+1<<2)>>2]=t;c[k+1310736+(r+2<<2)>>2]=y;c[k+1310736+(r+3<<2)>>2]=t;c[k+1310736+(r+4<<2)>>2]=t;c[k+1310736+(r+5<<2)>>2]=y;c[k+1310736+(r+6<<2)>>2]=y;break}}if(n){j=c[k+1179664+(p+-1<<2)>>2]|0;p=c[k+1179664+(q+-1<<2)>>2]|0;if((j|0)>(p|0)){b[e>>1]=p;if((r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(j|0))c[o>>2]=p;n=n+1|0;if((n|0)>=(r|0)){j=p;break}else o=o+4|0}}else j=p}else{b[e>>1]=j;if((j|0)<(p|0)&(r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(p|0))c[o>>2]=j;n=n+1|0;if((n|0)>=(r|0))break;else o=o+4|0}}}j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;q=k+1310736+(j+-5<<2)|0;c[q>>2]=(c[q>>2]|0)+y;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}n=b[e+-2>>1]|0;if(n<<16>>16<=0){b[e>>1]=o;j=p*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+t;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+y;n=k+1310736+(j+-4<<2)|0;if((c[n>>2]|0)>(t|0))c[n>>2]=t;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}j=c[k+1179664+(p+-1<<2)>>2]|0;p=c[k+1179664+((n<<16>>16)+-1<<2)>>2]|0;if((j|0)>(p|0)){b[e>>1]=p;if((r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(j|0))c[o>>2]=p;n=n+1|0;if((n|0)>=(r|0)){j=p;break}else o=o+4|0}}else j=p}else{b[e>>1]=j;if((j|0)<(p|0)&(r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(p|0))c[o>>2]=j;n=n+1|0;if((n|0)>=(r|0))break;else o=o+4|0}}}j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;j=k+1310736+(j+-5<<2)|0;c[j>>2]=(c[j>>2]|0)+y;j=r}else{b[e>>1]=0;a[l>>0]=0;j=r}while(0);t=t+1|0;n=s+3|0;e=e+2|0;l=l+1|0;if((t|0)>=(z|0))break;else{s=n;r=j}}}else l=o;y=y+1|0;if((y|0)>=(B|0)){p=j;D=52;break a}else{o=l+2|0;n=n+6|0;e=e+4|0}}Me(3,3904,C);l=-1}else{p=0;D=52}while(0);if((D|0)==52){e=k+12|0;if((p|0)<1)j=1;else{n=1;j=1;while(1){l=c[m>>2]|0;if((l|0)==(n|0)){l=j;j=j+1|0}else l=c[k+1179664+(l+-1<<2)>>2]|0;c[m>>2]=l;if((n|0)<(p|0)){n=n+1|0;m=m+4|0}else break}}o=k+8|0;l=j+-1|0;c[o>>2]=l;if(l){ek(e|0,0,l<<2|0)|0;ek(k+655376|0,0,l<<4|0)|0;if((j|0)>1){l=0;do{D=l<<2;c[k+131084+(D<<2)>>2]=f;c[k+131084+((D|1)<<2)>>2]=0;c[k+131084+((D|2)<<2)>>2]=g;c[k+131084+((D|3)<<2)>>2]=0;l=l+1|0}while((l|0)<(c[o>>2]|0))}if((p|0)>0){e=0;do{m=(c[k+1179664+(e<<2)>>2]|0)+-1|0;n=e*7|0;l=k+12+(m<<2)|0;c[l>>2]=(c[l>>2]|0)+(c[k+1310736+(n<<2)>>2]|0);l=m<<1;j=k+655376+(l<<3)|0;h[j>>3]=+h[j>>3]+ +(c[k+1310736+(n+1<<2)>>2]|0);l=k+655376+((l|1)<<3)|0;h[l>>3]=+h[l>>3]+ +(c[k+1310736+(n+2<<2)>>2]|0);m=m<<2;l=k+131084+(m<<2)|0;j=c[k+1310736+(n+3<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;l=k+131084+((m|1)<<2)|0;j=c[k+1310736+(n+4<<2)>>2]|0;if((c[l>>2]|0)<(j|0))c[l>>2]=j;l=k+131084+((m|2)<<2)|0;j=c[k+1310736+(n+5<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;j=k+131084+((m|3)<<2)|0;l=c[k+1310736+(n+6<<2)>>2]|0;if((c[j>>2]|0)<(l|0))c[j>>2]=l;e=e+1|0}while((e|0)<(p|0))}if((c[o>>2]|0)>0){l=0;do{f=k+12+(l<<2)|0;g=l<<1;D=k+655376+(g<<3)|0;h[D>>3]=+h[D>>3]/+(c[f>>2]|0);g=k+655376+((g|1)<<3)|0;h[g>>3]=+h[g>>3]/+(c[f>>2]|0);l=l+1|0}while((l|0)<(c[o>>2]|0));l=0}else l=0}else l=0}i=E;return l|0}function Ad(e,f,g,j,k){e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;E=i;i=i+16|0;C=E;p=c[k>>2]|0;B=g+-1|0;if((f|0)>0){l=0;m=p;n=p+(($(B,f)|0)<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(f|0))break;else{m=m+2|0;n=n+2|0}}}A=j*3|0;z=f+-1|0;if((g|0)>0){l=0;j=p;m=p+(z<<1)|0;while(1){b[m>>1]=0;b[j>>1]=0;l=l+1|0;if((l|0)>=(g|0))break;else{j=j+(f<<1)|0;m=m+(f<<1)|0}}}m=k+1179664|0;l=f+1|0;w=0-f|0;u=1-f|0;v=~f;a:do if((B|0)>1){x=(z|0)>1;o=(c[k+4>>2]|0)+l|0;y=1;n=e+(l<<1)|0;e=p+(l<<1)|0;j=0;b:while(1){if(x){l=o;t=1;s=n;r=j;while(1){p=d[s>>0]|0;q=d[s+1>>0]|0;do if(((p&248)+10+(p<<5&224)+(q>>>3&28)+(q<<3&248)|0)>(A|0)){a[l>>0]=-1;j=b[e+(w<<1)>>1]|0;if(j<<16>>16>0){b[e>>1]=j;j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;q=k+1310736+(j+-5<<2)|0;c[q>>2]=(c[q>>2]|0)+y;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}o=b[e+(u<<1)>>1]|0;p=o<<16>>16;j=b[e+(v<<1)>>1]|0;q=j<<16>>16;n=j<<16>>16>0;if(o<<16>>16<=0){if(n){b[e>>1]=j;j=q*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+t;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+y;n=k+1310736+(j+-3<<2)|0;if((c[n>>2]|0)<(t|0))c[n>>2]=t;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}j=b[e+-2>>1]|0;if(j<<16>>16>0){b[e>>1]=j;j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;q=k+1310736+(j+-5<<2)|0;c[q>>2]=(c[q>>2]|0)+y;j=k+1310736+(j+-3<<2)|0;if((c[j>>2]|0)>=(t|0)){j=r;break}c[j>>2]=t;j=r;break}else{j=r+1|0;if((r|0)>32767)break b;b[e>>1]=j;c[k+1179664+(r<<2)>>2]=j<<16>>16;r=r*7|0;c[k+1310736+(r<<2)>>2]=1;c[k+1310736+(r+1<<2)>>2]=t;c[k+1310736+(r+2<<2)>>2]=y;c[k+1310736+(r+3<<2)>>2]=t;c[k+1310736+(r+4<<2)>>2]=t;c[k+1310736+(r+5<<2)>>2]=y;c[k+1310736+(r+6<<2)>>2]=y;break}}if(n){j=c[k+1179664+(p+-1<<2)>>2]|0;p=c[k+1179664+(q+-1<<2)>>2]|0;if((j|0)>(p|0)){b[e>>1]=p;if((r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(j|0))c[o>>2]=p;n=n+1|0;if((n|0)>=(r|0)){j=p;break}else o=o+4|0}}else j=p}else{b[e>>1]=j;if((j|0)<(p|0)&(r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(p|0))c[o>>2]=j;n=n+1|0;if((n|0)>=(r|0))break;else o=o+4|0}}}j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;q=k+1310736+(j+-5<<2)|0;c[q>>2]=(c[q>>2]|0)+y;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}n=b[e+-2>>1]|0;if(n<<16>>16<=0){b[e>>1]=o;j=p*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+t;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+y;n=k+1310736+(j+-4<<2)|0;if((c[n>>2]|0)>(t|0))c[n>>2]=t;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}j=c[k+1179664+(p+-1<<2)>>2]|0;p=c[k+1179664+((n<<16>>16)+-1<<2)>>2]|0;if((j|0)>(p|0)){b[e>>1]=p;if((r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(j|0))c[o>>2]=p;n=n+1|0;if((n|0)>=(r|0)){j=p;break}else o=o+4|0}}else j=p}else{b[e>>1]=j;if((j|0)<(p|0)&(r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(p|0))c[o>>2]=j;n=n+1|0;if((n|0)>=(r|0))break;else o=o+4|0}}}j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;j=k+1310736+(j+-5<<2)|0;c[j>>2]=(c[j>>2]|0)+y;j=r}else{b[e>>1]=0;a[l>>0]=0;j=r}while(0);t=t+1|0;n=s+2|0;e=e+2|0;l=l+1|0;if((t|0)>=(z|0))break;else{s=n;r=j}}}else l=o;y=y+1|0;if((y|0)>=(B|0)){p=j;D=52;break a}else{o=l+2|0;n=n+4|0;e=e+4|0}}Me(3,3904,C);l=-1}else{p=0;D=52}while(0);if((D|0)==52){e=k+12|0;if((p|0)<1)j=1;else{n=1;j=1;while(1){l=c[m>>2]|0;if((l|0)==(n|0)){l=j;j=j+1|0}else l=c[k+1179664+(l+-1<<2)>>2]|0;c[m>>2]=l;if((n|0)<(p|0)){n=n+1|0;m=m+4|0}else break}}o=k+8|0;l=j+-1|0;c[o>>2]=l;if(l){ek(e|0,0,l<<2|0)|0;ek(k+655376|0,0,l<<4|0)|0;if((j|0)>1){l=0;do{D=l<<2;c[k+131084+(D<<2)>>2]=f;c[k+131084+((D|1)<<2)>>2]=0;c[k+131084+((D|2)<<2)>>2]=g;c[k+131084+((D|3)<<2)>>2]=0;l=l+1|0}while((l|0)<(c[o>>2]|0))}if((p|0)>0){e=0;do{m=(c[k+1179664+(e<<2)>>2]|0)+-1|0;n=e*7|0;l=k+12+(m<<2)|0;c[l>>2]=(c[l>>2]|0)+(c[k+1310736+(n<<2)>>2]|0);l=m<<1;j=k+655376+(l<<3)|0;h[j>>3]=+h[j>>3]+ +(c[k+1310736+(n+1<<2)>>2]|0);l=k+655376+((l|1)<<3)|0;h[l>>3]=+h[l>>3]+ +(c[k+1310736+(n+2<<2)>>2]|0);m=m<<2;l=k+131084+(m<<2)|0;j=c[k+1310736+(n+3<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;l=k+131084+((m|1)<<2)|0;j=c[k+1310736+(n+4<<2)>>2]|0;if((c[l>>2]|0)<(j|0))c[l>>2]=j;l=k+131084+((m|2)<<2)|0;j=c[k+1310736+(n+5<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;j=k+131084+((m|3)<<2)|0;l=c[k+1310736+(n+6<<2)>>2]|0;if((c[j>>2]|0)<(l|0))c[j>>2]=l;e=e+1|0}while((e|0)<(p|0))}if((c[o>>2]|0)>0){l=0;do{f=k+12+(l<<2)|0;g=l<<1;D=k+655376+(g<<3)|0;h[D>>3]=+h[D>>3]/+(c[f>>2]|0);g=k+655376+((g|1)<<3)|0;h[g>>3]=+h[g>>3]/+(c[f>>2]|0);l=l+1|0}while((l|0)<(c[o>>2]|0));l=0}else l=0}else l=0}i=E;return l|0}function Bd(e,f,g,j,k){e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;E=i;i=i+16|0;C=E;p=c[k>>2]|0;B=g+-1|0;if((f|0)>0){l=0;m=p;n=p+(($(B,f)|0)<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(f|0))break;else{m=m+2|0;n=n+2|0}}}A=j*3|0;z=f+-1|0;if((g|0)>0){l=0;j=p;m=p+(z<<1)|0;while(1){b[m>>1]=0;b[j>>1]=0;l=l+1|0;if((l|0)>=(g|0))break;else{j=j+(f<<1)|0;m=m+(f<<1)|0}}}m=k+1179664|0;l=f+1|0;w=0-f|0;u=1-f|0;v=~f;a:do if((B|0)>1){x=(z|0)>1;o=(c[k+4>>2]|0)+l|0;y=1;n=e+(l<<2)|0;e=p+(l<<1)|0;j=0;b:while(1){if(x){l=o;t=1;s=n;r=j;while(1){do if(((d[s+1>>0]|0)+(d[s>>0]|0)+(d[s+2>>0]|0)|0)>(A|0)){a[l>>0]=-1;j=b[e+(w<<1)>>1]|0;if(j<<16>>16>0){b[e>>1]=j;j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;q=k+1310736+(j+-5<<2)|0;c[q>>2]=(c[q>>2]|0)+y;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}o=b[e+(u<<1)>>1]|0;p=o<<16>>16;j=b[e+(v<<1)>>1]|0;q=j<<16>>16;n=j<<16>>16>0;if(o<<16>>16<=0){if(n){b[e>>1]=j;j=q*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+t;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+y;n=k+1310736+(j+-3<<2)|0;if((c[n>>2]|0)<(t|0))c[n>>2]=t;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}j=b[e+-2>>1]|0;if(j<<16>>16>0){b[e>>1]=j;j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;q=k+1310736+(j+-5<<2)|0;c[q>>2]=(c[q>>2]|0)+y;j=k+1310736+(j+-3<<2)|0;if((c[j>>2]|0)>=(t|0)){j=r;break}c[j>>2]=t;j=r;break}else{j=r+1|0;if((r|0)>32767)break b;b[e>>1]=j;c[k+1179664+(r<<2)>>2]=j<<16>>16;r=r*7|0;c[k+1310736+(r<<2)>>2]=1;c[k+1310736+(r+1<<2)>>2]=t;c[k+1310736+(r+2<<2)>>2]=y;c[k+1310736+(r+3<<2)>>2]=t;c[k+1310736+(r+4<<2)>>2]=t;c[k+1310736+(r+5<<2)>>2]=y;c[k+1310736+(r+6<<2)>>2]=y;break}}if(n){j=c[k+1179664+(p+-1<<2)>>2]|0;p=c[k+1179664+(q+-1<<2)>>2]|0;if((j|0)>(p|0)){b[e>>1]=p;if((r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(j|0))c[o>>2]=p;n=n+1|0;if((n|0)>=(r|0)){j=p;break}else o=o+4|0}}else j=p}else{b[e>>1]=j;if((j|0)<(p|0)&(r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(p|0))c[o>>2]=j;n=n+1|0;if((n|0)>=(r|0))break;else o=o+4|0}}}j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;q=k+1310736+(j+-5<<2)|0;c[q>>2]=(c[q>>2]|0)+y;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}n=b[e+-2>>1]|0;if(n<<16>>16<=0){b[e>>1]=o;j=p*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+t;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+y;n=k+1310736+(j+-4<<2)|0;if((c[n>>2]|0)>(t|0))c[n>>2]=t;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}j=c[k+1179664+(p+-1<<2)>>2]|0;p=c[k+1179664+((n<<16>>16)+-1<<2)>>2]|0;if((j|0)>(p|0)){b[e>>1]=p;if((r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(j|0))c[o>>2]=p;n=n+1|0;if((n|0)>=(r|0)){j=p;break}else o=o+4|0}}else j=p}else{b[e>>1]=j;if((j|0)<(p|0)&(r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(p|0))c[o>>2]=j;n=n+1|0;if((n|0)>=(r|0))break;else o=o+4|0}}}j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;j=k+1310736+(j+-5<<2)|0;c[j>>2]=(c[j>>2]|0)+y;j=r}else{b[e>>1]=0;a[l>>0]=0;j=r}while(0);t=t+1|0;n=s+4|0;e=e+2|0;l=l+1|0;if((t|0)>=(z|0))break;else{s=n;r=j}}}else l=o;y=y+1|0;if((y|0)>=(B|0)){p=j;D=52;break a}else{o=l+2|0;n=n+8|0;e=e+4|0}}Me(3,3904,C);l=-1}else{p=0;D=52}while(0);if((D|0)==52){e=k+12|0;if((p|0)<1)j=1;else{n=1;j=1;while(1){l=c[m>>2]|0;if((l|0)==(n|0)){l=j;j=j+1|0}else l=c[k+1179664+(l+-1<<2)>>2]|0;c[m>>2]=l;if((n|0)<(p|0)){n=n+1|0;m=m+4|0}else break}}o=k+8|0;l=j+-1|0;c[o>>2]=l;if(l){ek(e|0,0,l<<2|0)|0;ek(k+655376|0,0,l<<4|0)|0;if((j|0)>1){l=0;do{D=l<<2;c[k+131084+(D<<2)>>2]=f;c[k+131084+((D|1)<<2)>>2]=0;c[k+131084+((D|2)<<2)>>2]=g;c[k+131084+((D|3)<<2)>>2]=0;l=l+1|0}while((l|0)<(c[o>>2]|0))}if((p|0)>0){e=0;do{m=(c[k+1179664+(e<<2)>>2]|0)+-1|0;n=e*7|0;l=k+12+(m<<2)|0;c[l>>2]=(c[l>>2]|0)+(c[k+1310736+(n<<2)>>2]|0);l=m<<1;j=k+655376+(l<<3)|0;h[j>>3]=+h[j>>3]+ +(c[k+1310736+(n+1<<2)>>2]|0);l=k+655376+((l|1)<<3)|0;h[l>>3]=+h[l>>3]+ +(c[k+1310736+(n+2<<2)>>2]|0);m=m<<2;l=k+131084+(m<<2)|0;j=c[k+1310736+(n+3<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;l=k+131084+((m|1)<<2)|0;j=c[k+1310736+(n+4<<2)>>2]|0;if((c[l>>2]|0)<(j|0))c[l>>2]=j;l=k+131084+((m|2)<<2)|0;j=c[k+1310736+(n+5<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;j=k+131084+((m|3)<<2)|0;l=c[k+1310736+(n+6<<2)>>2]|0;if((c[j>>2]|0)<(l|0))c[j>>2]=l;e=e+1|0}while((e|0)<(p|0))}if((c[o>>2]|0)>0){l=0;do{f=k+12+(l<<2)|0;g=l<<1;D=k+655376+(g<<3)|0;h[D>>3]=+h[D>>3]/+(c[f>>2]|0);g=k+655376+((g|1)<<3)|0;h[g>>3]=+h[g>>3]/+(c[f>>2]|0);l=l+1|0}while((l|0)<(c[o>>2]|0));l=0}else l=0}else l=0}i=E;return l|0}function Cd(e,f,g,j,k){e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;E=i;i=i+16|0;C=E;p=c[k>>2]|0;B=g+-1|0;if((f|0)>0){l=0;m=p;n=p+(($(B,f)|0)<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(f|0))break;else{m=m+2|0;n=n+2|0}}}A=j*3|0;z=f+-1|0;if((g|0)>0){l=0;j=p;m=p+(z<<1)|0;while(1){b[m>>1]=0;b[j>>1]=0;l=l+1|0;if((l|0)>=(g|0))break;else{j=j+(f<<1)|0;m=m+(f<<1)|0}}}m=k+1179664|0;l=f+1|0;w=0-f|0;u=1-f|0;v=~f;a:do if((B|0)>1){x=(z|0)>1;o=(c[k+4>>2]|0)+l|0;y=1;n=e+(l<<1)|0;e=p+(l<<1)|0;j=0;b:while(1){if(x){l=o;t=1;s=n;r=j;while(1){q=d[s>>0]|0;do if(((q&240)+24+(q<<4&240)+((d[s+1>>0]|0)&240)|0)>(A|0)){a[l>>0]=-1;j=b[e+(w<<1)>>1]|0;if(j<<16>>16>0){b[e>>1]=j;j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;q=k+1310736+(j+-5<<2)|0;c[q>>2]=(c[q>>2]|0)+y;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}o=b[e+(u<<1)>>1]|0;p=o<<16>>16;j=b[e+(v<<1)>>1]|0;q=j<<16>>16;n=j<<16>>16>0;if(o<<16>>16<=0){if(n){b[e>>1]=j;j=q*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+t;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+y;n=k+1310736+(j+-3<<2)|0;if((c[n>>2]|0)<(t|0))c[n>>2]=t;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}j=b[e+-2>>1]|0;if(j<<16>>16>0){b[e>>1]=j;j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;q=k+1310736+(j+-5<<2)|0;c[q>>2]=(c[q>>2]|0)+y;j=k+1310736+(j+-3<<2)|0;if((c[j>>2]|0)>=(t|0)){j=r;break}c[j>>2]=t;j=r;break}else{j=r+1|0;if((r|0)>32767)break b;b[e>>1]=j;c[k+1179664+(r<<2)>>2]=j<<16>>16;r=r*7|0;c[k+1310736+(r<<2)>>2]=1;c[k+1310736+(r+1<<2)>>2]=t;c[k+1310736+(r+2<<2)>>2]=y;c[k+1310736+(r+3<<2)>>2]=t;c[k+1310736+(r+4<<2)>>2]=t;c[k+1310736+(r+5<<2)>>2]=y;c[k+1310736+(r+6<<2)>>2]=y;break}}if(n){j=c[k+1179664+(p+-1<<2)>>2]|0;p=c[k+1179664+(q+-1<<2)>>2]|0;if((j|0)>(p|0)){b[e>>1]=p;if((r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(j|0))c[o>>2]=p;n=n+1|0;if((n|0)>=(r|0)){j=p;break}else o=o+4|0}}else j=p}else{b[e>>1]=j;if((j|0)<(p|0)&(r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(p|0))c[o>>2]=j;n=n+1|0;if((n|0)>=(r|0))break;else o=o+4|0}}}j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;q=k+1310736+(j+-5<<2)|0;c[q>>2]=(c[q>>2]|0)+y;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}n=b[e+-2>>1]|0;if(n<<16>>16<=0){b[e>>1]=o;j=p*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+t;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+y;n=k+1310736+(j+-4<<2)|0;if((c[n>>2]|0)>(t|0))c[n>>2]=t;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}j=c[k+1179664+(p+-1<<2)>>2]|0;p=c[k+1179664+((n<<16>>16)+-1<<2)>>2]|0;if((j|0)>(p|0)){b[e>>1]=p;if((r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(j|0))c[o>>2]=p;n=n+1|0;if((n|0)>=(r|0)){j=p;break}else o=o+4|0}}else j=p}else{b[e>>1]=j;if((j|0)<(p|0)&(r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(p|0))c[o>>2]=j;n=n+1|0;if((n|0)>=(r|0))break;else o=o+4|0}}}j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;j=k+1310736+(j+-5<<2)|0;c[j>>2]=(c[j>>2]|0)+y;j=r}else{b[e>>1]=0;a[l>>0]=0;j=r}while(0);t=t+1|0;n=s+2|0;e=e+2|0;l=l+1|0;if((t|0)>=(z|0))break;else{s=n;r=j}}}else l=o;y=y+1|0;if((y|0)>=(B|0)){p=j;D=52;break a}else{o=l+2|0;n=n+4|0;e=e+4|0}}Me(3,3904,C);l=-1}else{p=0;D=52}while(0);if((D|0)==52){e=k+12|0;if((p|0)<1)j=1;else{n=1;j=1;while(1){l=c[m>>2]|0;if((l|0)==(n|0)){l=j;j=j+1|0}else l=c[k+1179664+(l+-1<<2)>>2]|0;c[m>>2]=l;if((n|0)<(p|0)){n=n+1|0;m=m+4|0}else break}}o=k+8|0;l=j+-1|0;c[o>>2]=l;if(l){ek(e|0,0,l<<2|0)|0;ek(k+655376|0,0,l<<4|0)|0;if((j|0)>1){l=0;do{D=l<<2;c[k+131084+(D<<2)>>2]=f;c[k+131084+((D|1)<<2)>>2]=0;c[k+131084+((D|2)<<2)>>2]=g;c[k+131084+((D|3)<<2)>>2]=0;l=l+1|0}while((l|0)<(c[o>>2]|0))}if((p|0)>0){e=0;do{m=(c[k+1179664+(e<<2)>>2]|0)+-1|0;n=e*7|0;l=k+12+(m<<2)|0;c[l>>2]=(c[l>>2]|0)+(c[k+1310736+(n<<2)>>2]|0);l=m<<1;j=k+655376+(l<<3)|0;h[j>>3]=+h[j>>3]+ +(c[k+1310736+(n+1<<2)>>2]|0);l=k+655376+((l|1)<<3)|0;h[l>>3]=+h[l>>3]+ +(c[k+1310736+(n+2<<2)>>2]|0);m=m<<2;l=k+131084+(m<<2)|0;j=c[k+1310736+(n+3<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;l=k+131084+((m|1)<<2)|0;j=c[k+1310736+(n+4<<2)>>2]|0;if((c[l>>2]|0)<(j|0))c[l>>2]=j;l=k+131084+((m|2)<<2)|0;j=c[k+1310736+(n+5<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;j=k+131084+((m|3)<<2)|0;l=c[k+1310736+(n+6<<2)>>2]|0;if((c[j>>2]|0)<(l|0))c[j>>2]=l;e=e+1|0}while((e|0)<(p|0))}if((c[o>>2]|0)>0){l=0;do{f=k+12+(l<<2)|0;g=l<<1;D=k+655376+(g<<3)|0;h[D>>3]=+h[D>>3]/+(c[f>>2]|0);g=k+655376+((g|1)<<3)|0;h[g>>3]=+h[g>>3]/+(c[f>>2]|0);l=l+1|0}while((l|0)<(c[o>>2]|0));l=0}else l=0}else l=0}i=E;return l|0}function Dd(e,f,g,j,k){e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;E=i;i=i+16|0;C=E;p=c[k>>2]|0;B=g+-1|0;if((f|0)>0){l=0;m=p;n=p+(($(B,f)|0)<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(f|0))break;else{m=m+2|0;n=n+2|0}}}A=j*3|0;z=f+-1|0;if((g|0)>0){l=0;j=p;m=p+(z<<1)|0;while(1){b[m>>1]=0;b[j>>1]=0;l=l+1|0;if((l|0)>=(g|0))break;else{j=j+(f<<1)|0;m=m+(f<<1)|0}}}m=k+1179664|0;l=f+1|0;w=0-f|0;u=1-f|0;v=~f;a:do if((B|0)>1){x=(z|0)>1;o=(c[k+4>>2]|0)+l|0;y=1;n=e+(l<<1)|0;e=p+(l<<1)|0;j=0;b:while(1){if(x){l=o;t=1;s=n;r=j;while(1){p=d[s>>0]|0;q=d[s+1>>0]|0;do if(((p&248)+12+(p<<5&224)+(q>>>3&24)+(q<<2&248)|0)>(A|0)){a[l>>0]=-1;j=b[e+(w<<1)>>1]|0;if(j<<16>>16>0){b[e>>1]=j;j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;q=k+1310736+(j+-5<<2)|0;c[q>>2]=(c[q>>2]|0)+y;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}o=b[e+(u<<1)>>1]|0;p=o<<16>>16;j=b[e+(v<<1)>>1]|0;q=j<<16>>16;n=j<<16>>16>0;if(o<<16>>16<=0){if(n){b[e>>1]=j;j=q*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+t;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+y;n=k+1310736+(j+-3<<2)|0;if((c[n>>2]|0)<(t|0))c[n>>2]=t;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}j=b[e+-2>>1]|0;if(j<<16>>16>0){b[e>>1]=j;j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;q=k+1310736+(j+-5<<2)|0;c[q>>2]=(c[q>>2]|0)+y;j=k+1310736+(j+-3<<2)|0;if((c[j>>2]|0)>=(t|0)){j=r;break}c[j>>2]=t;j=r;break}else{j=r+1|0;if((r|0)>32767)break b;b[e>>1]=j;c[k+1179664+(r<<2)>>2]=j<<16>>16;r=r*7|0;c[k+1310736+(r<<2)>>2]=1;c[k+1310736+(r+1<<2)>>2]=t;c[k+1310736+(r+2<<2)>>2]=y;c[k+1310736+(r+3<<2)>>2]=t;c[k+1310736+(r+4<<2)>>2]=t;c[k+1310736+(r+5<<2)>>2]=y;c[k+1310736+(r+6<<2)>>2]=y;break}}if(n){j=c[k+1179664+(p+-1<<2)>>2]|0;p=c[k+1179664+(q+-1<<2)>>2]|0;if((j|0)>(p|0)){b[e>>1]=p;if((r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(j|0))c[o>>2]=p;n=n+1|0;if((n|0)>=(r|0)){j=p;break}else o=o+4|0}}else j=p}else{b[e>>1]=j;if((j|0)<(p|0)&(r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(p|0))c[o>>2]=j;n=n+1|0;if((n|0)>=(r|0))break;else o=o+4|0}}}j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;q=k+1310736+(j+-5<<2)|0;c[q>>2]=(c[q>>2]|0)+y;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}n=b[e+-2>>1]|0;if(n<<16>>16<=0){b[e>>1]=o;j=p*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+t;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+y;n=k+1310736+(j+-4<<2)|0;if((c[n>>2]|0)>(t|0))c[n>>2]=t;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}j=c[k+1179664+(p+-1<<2)>>2]|0;p=c[k+1179664+((n<<16>>16)+-1<<2)>>2]|0;if((j|0)>(p|0)){b[e>>1]=p;if((r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(j|0))c[o>>2]=p;n=n+1|0;if((n|0)>=(r|0)){j=p;break}else o=o+4|0}}else j=p}else{b[e>>1]=j;if((j|0)<(p|0)&(r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(p|0))c[o>>2]=j;n=n+1|0;if((n|0)>=(r|0))break;else o=o+4|0}}}j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;j=k+1310736+(j+-5<<2)|0;c[j>>2]=(c[j>>2]|0)+y;j=r}else{b[e>>1]=0;a[l>>0]=0;j=r}while(0);t=t+1|0;n=s+2|0;e=e+2|0;l=l+1|0;if((t|0)>=(z|0))break;else{s=n;r=j}}}else l=o;y=y+1|0;if((y|0)>=(B|0)){p=j;D=52;break a}else{o=l+2|0;n=n+4|0;e=e+4|0}}Me(3,3904,C);l=-1}else{p=0;D=52}while(0);if((D|0)==52){e=k+12|0;if((p|0)<1)j=1;else{n=1;j=1;while(1){l=c[m>>2]|0;if((l|0)==(n|0)){l=j;j=j+1|0}else l=c[k+1179664+(l+-1<<2)>>2]|0;c[m>>2]=l;if((n|0)<(p|0)){n=n+1|0;m=m+4|0}else break}}o=k+8|0;l=j+-1|0;c[o>>2]=l;if(l){ek(e|0,0,l<<2|0)|0;ek(k+655376|0,0,l<<4|0)|0;if((j|0)>1){l=0;do{D=l<<2;c[k+131084+(D<<2)>>2]=f;c[k+131084+((D|1)<<2)>>2]=0;c[k+131084+((D|2)<<2)>>2]=g;c[k+131084+((D|3)<<2)>>2]=0;l=l+1|0}while((l|0)<(c[o>>2]|0))}if((p|0)>0){e=0;do{m=(c[k+1179664+(e<<2)>>2]|0)+-1|0;n=e*7|0;l=k+12+(m<<2)|0;c[l>>2]=(c[l>>2]|0)+(c[k+1310736+(n<<2)>>2]|0);l=m<<1;j=k+655376+(l<<3)|0;h[j>>3]=+h[j>>3]+ +(c[k+1310736+(n+1<<2)>>2]|0);l=k+655376+((l|1)<<3)|0;h[l>>3]=+h[l>>3]+ +(c[k+1310736+(n+2<<2)>>2]|0);m=m<<2;l=k+131084+(m<<2)|0;j=c[k+1310736+(n+3<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;l=k+131084+((m|1)<<2)|0;j=c[k+1310736+(n+4<<2)>>2]|0;if((c[l>>2]|0)<(j|0))c[l>>2]=j;l=k+131084+((m|2)<<2)|0;j=c[k+1310736+(n+5<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;j=k+131084+((m|3)<<2)|0;l=c[k+1310736+(n+6<<2)>>2]|0;if((c[j>>2]|0)<(l|0))c[j>>2]=l;e=e+1|0}while((e|0)<(p|0))}if((c[o>>2]|0)>0){l=0;do{f=k+12+(l<<2)|0;g=l<<1;D=k+655376+(g<<3)|0;h[D>>3]=+h[D>>3]/+(c[f>>2]|0);g=k+655376+((g|1)<<3)|0;h[g>>3]=+h[g>>3]/+(c[f>>2]|0);l=l+1|0}while((l|0)<(c[o>>2]|0));l=0}else l=0}else l=0}i=E;return l|0}function Ed(e,f,g,j,k){e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;E=i;i=i+16|0;C=E;p=c[k>>2]|0;B=g+-1|0;if((f|0)>0){l=0;m=p;n=p+(($(B,f)|0)<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(f|0))break;else{m=m+2|0;n=n+2|0}}}A=j*3|0;z=f+-1|0;if((g|0)>0){l=0;j=p;m=p+(z<<1)|0;while(1){b[m>>1]=0;b[j>>1]=0;l=l+1|0;if((l|0)>=(g|0))break;else{j=j+(f<<1)|0;m=m+(f<<1)|0}}}m=k+1179664|0;l=f+1|0;w=0-f|0;u=1-f|0;v=~f;a:do if((B|0)>1){x=(z|0)>1;o=(c[k+4>>2]|0)+l|0;y=1;n=e+(l<<2)|0;e=p+(l<<1)|0;j=0;b:while(1){if(x){l=o;t=1;s=n;r=j;while(1){do if(((d[s+2>>0]|0)+(d[s+1>>0]|0)+(d[s+3>>0]|0)|0)>(A|0)){a[l>>0]=-1;j=b[e+(w<<1)>>1]|0;if(j<<16>>16>0){b[e>>1]=j;j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;q=k+1310736+(j+-5<<2)|0;c[q>>2]=(c[q>>2]|0)+y;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}o=b[e+(u<<1)>>1]|0;p=o<<16>>16;j=b[e+(v<<1)>>1]|0;q=j<<16>>16;n=j<<16>>16>0;if(o<<16>>16<=0){if(n){b[e>>1]=j;j=q*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+t;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+y;n=k+1310736+(j+-3<<2)|0;if((c[n>>2]|0)<(t|0))c[n>>2]=t;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}j=b[e+-2>>1]|0;if(j<<16>>16>0){b[e>>1]=j;j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;q=k+1310736+(j+-5<<2)|0;c[q>>2]=(c[q>>2]|0)+y;j=k+1310736+(j+-3<<2)|0;if((c[j>>2]|0)>=(t|0)){j=r;break}c[j>>2]=t;j=r;break}else{j=r+1|0;if((r|0)>32767)break b;b[e>>1]=j;c[k+1179664+(r<<2)>>2]=j<<16>>16;r=r*7|0;c[k+1310736+(r<<2)>>2]=1;c[k+1310736+(r+1<<2)>>2]=t;c[k+1310736+(r+2<<2)>>2]=y;c[k+1310736+(r+3<<2)>>2]=t;c[k+1310736+(r+4<<2)>>2]=t;c[k+1310736+(r+5<<2)>>2]=y;c[k+1310736+(r+6<<2)>>2]=y;break}}if(n){j=c[k+1179664+(p+-1<<2)>>2]|0;p=c[k+1179664+(q+-1<<2)>>2]|0;if((j|0)>(p|0)){b[e>>1]=p;if((r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(j|0))c[o>>2]=p;n=n+1|0;if((n|0)>=(r|0)){j=p;break}else o=o+4|0}}else j=p}else{b[e>>1]=j;if((j|0)<(p|0)&(r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(p|0))c[o>>2]=j;n=n+1|0;if((n|0)>=(r|0))break;else o=o+4|0}}}j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;q=k+1310736+(j+-5<<2)|0;c[q>>2]=(c[q>>2]|0)+y;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}n=b[e+-2>>1]|0;if(n<<16>>16<=0){b[e>>1]=o;j=p*7|0;n=k+1310736+(j+-7<<2)|0;c[n>>2]=(c[n>>2]|0)+1;n=k+1310736+(j+-6<<2)|0;c[n>>2]=(c[n>>2]|0)+t;n=k+1310736+(j+-5<<2)|0;c[n>>2]=(c[n>>2]|0)+y;n=k+1310736+(j+-4<<2)|0;if((c[n>>2]|0)>(t|0))c[n>>2]=t;c[k+1310736+(j+-1<<2)>>2]=y;j=r;break}j=c[k+1179664+(p+-1<<2)>>2]|0;p=c[k+1179664+((n<<16>>16)+-1<<2)>>2]|0;if((j|0)>(p|0)){b[e>>1]=p;if((r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(j|0))c[o>>2]=p;n=n+1|0;if((n|0)>=(r|0)){j=p;break}else o=o+4|0}}else j=p}else{b[e>>1]=j;if((j|0)<(p|0)&(r|0)>0){n=0;o=m;while(1){if((c[o>>2]|0)==(p|0))c[o>>2]=j;n=n+1|0;if((n|0)>=(r|0))break;else o=o+4|0}}}j=(j<<16>>16)*7|0;q=k+1310736+(j+-7<<2)|0;c[q>>2]=(c[q>>2]|0)+1;q=k+1310736+(j+-6<<2)|0;c[q>>2]=(c[q>>2]|0)+t;j=k+1310736+(j+-5<<2)|0;c[j>>2]=(c[j>>2]|0)+y;j=r}else{b[e>>1]=0;a[l>>0]=0;j=r}while(0);t=t+1|0;n=s+4|0;e=e+2|0;l=l+1|0;if((t|0)>=(z|0))break;else{s=n;r=j}}}else l=o;y=y+1|0;if((y|0)>=(B|0)){p=j;D=52;break a}else{o=l+2|0;n=n+8|0;e=e+4|0}}Me(3,3904,C);l=-1}else{p=0;D=52}while(0);if((D|0)==52){e=k+12|0;if((p|0)<1)j=1;else{n=1;j=1;while(1){l=c[m>>2]|0;if((l|0)==(n|0)){l=j;j=j+1|0}else l=c[k+1179664+(l+-1<<2)>>2]|0;c[m>>2]=l;if((n|0)<(p|0)){n=n+1|0;m=m+4|0}else break}}o=k+8|0;l=j+-1|0;c[o>>2]=l;if(l){ek(e|0,0,l<<2|0)|0;ek(k+655376|0,0,l<<4|0)|0;if((j|0)>1){l=0;do{D=l<<2;c[k+131084+(D<<2)>>2]=f;c[k+131084+((D|1)<<2)>>2]=0;c[k+131084+((D|2)<<2)>>2]=g;c[k+131084+((D|3)<<2)>>2]=0;l=l+1|0}while((l|0)<(c[o>>2]|0))}if((p|0)>0){e=0;do{m=(c[k+1179664+(e<<2)>>2]|0)+-1|0;n=e*7|0;l=k+12+(m<<2)|0;c[l>>2]=(c[l>>2]|0)+(c[k+1310736+(n<<2)>>2]|0);l=m<<1;j=k+655376+(l<<3)|0;h[j>>3]=+h[j>>3]+ +(c[k+1310736+(n+1<<2)>>2]|0);l=k+655376+((l|1)<<3)|0;h[l>>3]=+h[l>>3]+ +(c[k+1310736+(n+2<<2)>>2]|0);m=m<<2;l=k+131084+(m<<2)|0;j=c[k+1310736+(n+3<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;l=k+131084+((m|1)<<2)|0;j=c[k+1310736+(n+4<<2)>>2]|0;if((c[l>>2]|0)<(j|0))c[l>>2]=j;l=k+131084+((m|2)<<2)|0;j=c[k+1310736+(n+5<<2)>>2]|0;if((c[l>>2]|0)>(j|0))c[l>>2]=j;j=k+131084+((m|3)<<2)|0;l=c[k+1310736+(n+6<<2)>>2]|0;if((c[j>>2]|0)<(l|0))c[j>>2]=l;e=e+1|0}while((e|0)<(p|0))}if((c[o>>2]|0)>0){l=0;do{f=k+12+(l<<2)|0;g=l<<1;D=k+655376+(g<<3)|0;h[D>>3]=+h[D>>3]/+(c[f>>2]|0);g=k+655376+((g|1)<<3)|0;h[g>>3]=+h[g>>3]/+(c[f>>2]|0);l=l+1|0}while((l|0)<(c[o>>2]|0));l=0}else l=0}else l=0}i=E;return l|0}function Fd(e,f,g,j,k){e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;E=i;i=i+16|0;C=E;o=c[k>>2]|0;B=g+-1|0;if((f|0)>0){l=0;m=o;n=o+(($(B,f)|0)<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(f|0))break;else{m=m+2|0;n=n+2|0}}}A=f+-1|0;if((g|0)>0){l=0;m=o;n=o+(A<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(g|0))break;else{m=m+(f<<1)|0;n=n+(f<<1)|0}}}n=k+1179664|0;l=f+1|0;x=0-f|0;v=1-f|0;w=~f;a:do if((B|0)>1){y=(A|0)>1;p=(c[k+4>>2]|0)+l|0;z=1;e=e+l|0;o=o+(l<<1)|0;m=0;b:while(1){if(y){l=p;u=1;t=e;s=m;while(1){do if((d[t>>0]|0|0)>(j|0)){a[l>>0]=-1;m=b[o+(x<<1)>>1]|0;if(m<<16>>16>0){b[o>>1]=m;m=(m<<16>>16)*7|0;r=k+1310736+(m+-7<<2)|0;c[r>>2]=(c[r>>2]|0)+1;r=k+1310736+(m+-6<<2)|0;c[r>>2]=(c[r>>2]|0)+u;r=k+1310736+(m+-5<<2)|0;c[r>>2]=(c[r>>2]|0)+z;c[k+1310736+(m+-1<<2)>>2]=z;m=s;break}p=b[o+(v<<1)>>1]|0;q=p<<16>>16;m=b[o+(w<<1)>>1]|0;r=m<<16>>16;e=m<<16>>16>0;if(p<<16>>16<=0){if(e){b[o>>1]=m;m=r*7|0;e=k+1310736+(m+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=k+1310736+(m+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+u;e=k+1310736+(m+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+z;e=k+1310736+(m+-3<<2)|0;if((c[e>>2]|0)<(u|0))c[e>>2]=u;c[k+1310736+(m+-1<<2)>>2]=z;m=s;break}m=b[o+-2>>1]|0;if(m<<16>>16>0){b[o>>1]=m;m=(m<<16>>16)*7|0;r=k+1310736+(m+-7<<2)|0;c[r>>2]=(c[r>>2]|0)+1;r=k+1310736+(m+-6<<2)|0;c[r>>2]=(c[r>>2]|0)+u;r=k+1310736+(m+-5<<2)|0;c[r>>2]=(c[r>>2]|0)+z;m=k+1310736+(m+-3<<2)|0;if((c[m>>2]|0)>=(u|0)){m=s;break}c[m>>2]=u;m=s;break}else{m=s+1|0;if((s|0)>32767)break b;b[o>>1]=m;c[k+1179664+(s<<2)>>2]=m<<16>>16;s=s*7|0;c[k+1310736+(s<<2)>>2]=1;c[k+1310736+(s+1<<2)>>2]=u;c[k+1310736+(s+2<<2)>>2]=z;c[k+1310736+(s+3<<2)>>2]=u;c[k+1310736+(s+4<<2)>>2]=u;c[k+1310736+(s+5<<2)>>2]=z;c[k+1310736+(s+6<<2)>>2]=z;break}}if(e){m=c[k+1179664+(q+-1<<2)>>2]|0;q=c[k+1179664+(r+-1<<2)>>2]|0;if((m|0)>(q|0)){b[o>>1]=q;if((s|0)>0){e=0;p=n;while(1){if((c[p>>2]|0)==(m|0))c[p>>2]=q;e=e+1|0;if((e|0)>=(s|0)){m=q;break}else p=p+4|0}}else m=q}else{b[o>>1]=m;if((m|0)<(q|0)&(s|0)>0){e=0;p=n;while(1){if((c[p>>2]|0)==(q|0))c[p>>2]=m;e=e+1|0;if((e|0)>=(s|0))break;else p=p+4|0}}}m=(m<<16>>16)*7|0;r=k+1310736+(m+-7<<2)|0;c[r>>2]=(c[r>>2]|0)+1;r=k+1310736+(m+-6<<2)|0;c[r>>2]=(c[r>>2]|0)+u;r=k+1310736+(m+-5<<2)|0;c[r>>2]=(c[r>>2]|0)+z;c[k+1310736+(m+-1<<2)>>2]=z;m=s;break}e=b[o+-2>>1]|0;if(e<<16>>16<=0){b[o>>1]=p;m=q*7|0;e=k+1310736+(m+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=k+1310736+(m+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+u;e=k+1310736+(m+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+z;e=k+1310736+(m+-4<<2)|0;if((c[e>>2]|0)>(u|0))c[e>>2]=u;c[k+1310736+(m+-1<<2)>>2]=z;m=s;break}m=c[k+1179664+(q+-1<<2)>>2]|0;q=c[k+1179664+((e<<16>>16)+-1<<2)>>2]|0;if((m|0)>(q|0)){b[o>>1]=q;if((s|0)>0){e=0;p=n;while(1){if((c[p>>2]|0)==(m|0))c[p>>2]=q;e=e+1|0;if((e|0)>=(s|0)){m=q;break}else p=p+4|0}}else m=q}else{b[o>>1]=m;if((m|0)<(q|0)&(s|0)>0){e=0;p=n;while(1){if((c[p>>2]|0)==(q|0))c[p>>2]=m;e=e+1|0;if((e|0)>=(s|0))break;else p=p+4|0}}}m=(m<<16>>16)*7|0;r=k+1310736+(m+-7<<2)|0;c[r>>2]=(c[r>>2]|0)+1;r=k+1310736+(m+-6<<2)|0;c[r>>2]=(c[r>>2]|0)+u;m=k+1310736+(m+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+z;m=s}else{b[o>>1]=0;a[l>>0]=0;m=s}while(0);u=u+1|0;e=t+1|0;o=o+2|0;l=l+1|0;if((u|0)>=(A|0))break;else{t=e;s=m}}}else l=p;z=z+1|0;if((z|0)>=(B|0)){q=m;D=52;break a}else{p=l+2|0;e=e+2|0;o=o+4|0}}Me(3,3904,C);l=-1}else{q=0;D=52}while(0);if((D|0)==52){o=k+12|0;if((q|0)<1)m=1;else{e=1;m=1;while(1){l=c[n>>2]|0;if((l|0)==(e|0)){l=m;m=m+1|0}else l=c[k+1179664+(l+-1<<2)>>2]|0;c[n>>2]=l;if((e|0)<(q|0)){e=e+1|0;n=n+4|0}else break}}p=k+8|0;l=m+-1|0;c[p>>2]=l;if(l){ek(o|0,0,l<<2|0)|0;ek(k+655376|0,0,l<<4|0)|0;if((m|0)>1){l=0;do{D=l<<2;c[k+131084+(D<<2)>>2]=f;c[k+131084+((D|1)<<2)>>2]=0;c[k+131084+((D|2)<<2)>>2]=g;c[k+131084+((D|3)<<2)>>2]=0;l=l+1|0}while((l|0)<(c[p>>2]|0))}if((q|0)>0){o=0;do{n=(c[k+1179664+(o<<2)>>2]|0)+-1|0;e=o*7|0;l=k+12+(n<<2)|0;c[l>>2]=(c[l>>2]|0)+(c[k+1310736+(e<<2)>>2]|0);l=n<<1;m=k+655376+(l<<3)|0;h[m>>3]=+h[m>>3]+ +(c[k+1310736+(e+1<<2)>>2]|0);l=k+655376+((l|1)<<3)|0;h[l>>3]=+h[l>>3]+ +(c[k+1310736+(e+2<<2)>>2]|0);n=n<<2;l=k+131084+(n<<2)|0;m=c[k+1310736+(e+3<<2)>>2]|0;if((c[l>>2]|0)>(m|0))c[l>>2]=m;l=k+131084+((n|1)<<2)|0;m=c[k+1310736+(e+4<<2)>>2]|0;if((c[l>>2]|0)<(m|0))c[l>>2]=m;l=k+131084+((n|2)<<2)|0;m=c[k+1310736+(e+5<<2)>>2]|0;if((c[l>>2]|0)>(m|0))c[l>>2]=m;m=k+131084+((n|3)<<2)|0;l=c[k+1310736+(e+6<<2)>>2]|0;if((c[m>>2]|0)<(l|0))c[m>>2]=l;o=o+1|0}while((o|0)<(q|0))}if((c[p>>2]|0)>0){l=0;do{f=k+12+(l<<2)|0;g=l<<1;D=k+655376+(g<<3)|0;h[D>>3]=+h[D>>3]/+(c[f>>2]|0);g=k+655376+((g|1)<<3)|0;h[g>>3]=+h[g>>3]/+(c[f>>2]|0);l=l+1|0}while((l|0)<(c[p>>2]|0));l=0}else l=0}else l=0}i=E;return l|0}function Gd(e,f,g,j,k){e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;E=i;i=i+16|0;C=E;o=c[k>>2]|0;B=g+-1|0;if((f|0)>0){l=0;m=o;n=o+(($(B,f)|0)<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(f|0))break;else{m=m+2|0;n=n+2|0}}}A=f+-1|0;if((g|0)>0){l=0;m=o;n=o+(A<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(g|0))break;else{m=m+(f<<1)|0;n=n+(f<<1)|0}}}n=k+1179664|0;l=f+1|0;x=0-f|0;v=1-f|0;w=~f;a:do if((B|0)>1){y=(A|0)>1;p=(c[k+4>>2]|0)+l|0;z=1;e=e+(l<<1)|0;o=o+(l<<1)|0;m=0;b:while(1){if(y){l=p;u=1;t=e;s=m;while(1){do if((d[t+1>>0]|0|0)>(j|0)){a[l>>0]=-1;m=b[o+(x<<1)>>1]|0;if(m<<16>>16>0){b[o>>1]=m;m=(m<<16>>16)*7|0;r=k+1310736+(m+-7<<2)|0;c[r>>2]=(c[r>>2]|0)+1;r=k+1310736+(m+-6<<2)|0;c[r>>2]=(c[r>>2]|0)+u;r=k+1310736+(m+-5<<2)|0;c[r>>2]=(c[r>>2]|0)+z;c[k+1310736+(m+-1<<2)>>2]=z;m=s;break}p=b[o+(v<<1)>>1]|0;q=p<<16>>16;m=b[o+(w<<1)>>1]|0;r=m<<16>>16;e=m<<16>>16>0;if(p<<16>>16<=0){if(e){b[o>>1]=m;m=r*7|0;e=k+1310736+(m+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=k+1310736+(m+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+u;e=k+1310736+(m+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+z;e=k+1310736+(m+-3<<2)|0;if((c[e>>2]|0)<(u|0))c[e>>2]=u;c[k+1310736+(m+-1<<2)>>2]=z;m=s;break}m=b[o+-2>>1]|0;if(m<<16>>16>0){b[o>>1]=m;m=(m<<16>>16)*7|0;r=k+1310736+(m+-7<<2)|0;c[r>>2]=(c[r>>2]|0)+1;r=k+1310736+(m+-6<<2)|0;c[r>>2]=(c[r>>2]|0)+u;r=k+1310736+(m+-5<<2)|0;c[r>>2]=(c[r>>2]|0)+z;m=k+1310736+(m+-3<<2)|0;if((c[m>>2]|0)>=(u|0)){m=s;break}c[m>>2]=u;m=s;break}else{m=s+1|0;if((s|0)>32767)break b;b[o>>1]=m;c[k+1179664+(s<<2)>>2]=m<<16>>16;s=s*7|0;c[k+1310736+(s<<2)>>2]=1;c[k+1310736+(s+1<<2)>>2]=u;c[k+1310736+(s+2<<2)>>2]=z;c[k+1310736+(s+3<<2)>>2]=u;c[k+1310736+(s+4<<2)>>2]=u;c[k+1310736+(s+5<<2)>>2]=z;c[k+1310736+(s+6<<2)>>2]=z;break}}if(e){m=c[k+1179664+(q+-1<<2)>>2]|0;q=c[k+1179664+(r+-1<<2)>>2]|0;if((m|0)>(q|0)){b[o>>1]=q;if((s|0)>0){e=0;p=n;while(1){if((c[p>>2]|0)==(m|0))c[p>>2]=q;e=e+1|0;if((e|0)>=(s|0)){m=q;break}else p=p+4|0}}else m=q}else{b[o>>1]=m;if((m|0)<(q|0)&(s|0)>0){e=0;p=n;while(1){if((c[p>>2]|0)==(q|0))c[p>>2]=m;e=e+1|0;if((e|0)>=(s|0))break;else p=p+4|0}}}m=(m<<16>>16)*7|0;r=k+1310736+(m+-7<<2)|0;c[r>>2]=(c[r>>2]|0)+1;r=k+1310736+(m+-6<<2)|0;c[r>>2]=(c[r>>2]|0)+u;r=k+1310736+(m+-5<<2)|0;c[r>>2]=(c[r>>2]|0)+z;c[k+1310736+(m+-1<<2)>>2]=z;m=s;break}e=b[o+-2>>1]|0;if(e<<16>>16<=0){b[o>>1]=p;m=q*7|0;e=k+1310736+(m+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=k+1310736+(m+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+u;e=k+1310736+(m+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+z;e=k+1310736+(m+-4<<2)|0;if((c[e>>2]|0)>(u|0))c[e>>2]=u;c[k+1310736+(m+-1<<2)>>2]=z;m=s;break}m=c[k+1179664+(q+-1<<2)>>2]|0;q=c[k+1179664+((e<<16>>16)+-1<<2)>>2]|0;if((m|0)>(q|0)){b[o>>1]=q;if((s|0)>0){e=0;p=n;while(1){if((c[p>>2]|0)==(m|0))c[p>>2]=q;e=e+1|0;if((e|0)>=(s|0)){m=q;break}else p=p+4|0}}else m=q}else{b[o>>1]=m;if((m|0)<(q|0)&(s|0)>0){e=0;p=n;while(1){if((c[p>>2]|0)==(q|0))c[p>>2]=m;e=e+1|0;if((e|0)>=(s|0))break;else p=p+4|0}}}m=(m<<16>>16)*7|0;r=k+1310736+(m+-7<<2)|0;c[r>>2]=(c[r>>2]|0)+1;r=k+1310736+(m+-6<<2)|0;c[r>>2]=(c[r>>2]|0)+u;m=k+1310736+(m+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+z;m=s}else{b[o>>1]=0;a[l>>0]=0;m=s}while(0);u=u+1|0;e=t+2|0;o=o+2|0;l=l+1|0;if((u|0)>=(A|0))break;else{t=e;s=m}}}else l=p;z=z+1|0;if((z|0)>=(B|0)){q=m;D=52;break a}else{p=l+2|0;e=e+4|0;o=o+4|0}}Me(3,3904,C);l=-1}else{q=0;D=52}while(0);if((D|0)==52){o=k+12|0;if((q|0)<1)m=1;else{e=1;m=1;while(1){l=c[n>>2]|0;if((l|0)==(e|0)){l=m;m=m+1|0}else l=c[k+1179664+(l+-1<<2)>>2]|0;c[n>>2]=l;if((e|0)<(q|0)){e=e+1|0;n=n+4|0}else break}}p=k+8|0;l=m+-1|0;c[p>>2]=l;if(l){ek(o|0,0,l<<2|0)|0;ek(k+655376|0,0,l<<4|0)|0;if((m|0)>1){l=0;do{D=l<<2;c[k+131084+(D<<2)>>2]=f;c[k+131084+((D|1)<<2)>>2]=0;c[k+131084+((D|2)<<2)>>2]=g;c[k+131084+((D|3)<<2)>>2]=0;l=l+1|0}while((l|0)<(c[p>>2]|0))}if((q|0)>0){o=0;do{n=(c[k+1179664+(o<<2)>>2]|0)+-1|0;e=o*7|0;l=k+12+(n<<2)|0;c[l>>2]=(c[l>>2]|0)+(c[k+1310736+(e<<2)>>2]|0);l=n<<1;m=k+655376+(l<<3)|0;h[m>>3]=+h[m>>3]+ +(c[k+1310736+(e+1<<2)>>2]|0);l=k+655376+((l|1)<<3)|0;h[l>>3]=+h[l>>3]+ +(c[k+1310736+(e+2<<2)>>2]|0);n=n<<2;l=k+131084+(n<<2)|0;m=c[k+1310736+(e+3<<2)>>2]|0;if((c[l>>2]|0)>(m|0))c[l>>2]=m;l=k+131084+((n|1)<<2)|0;m=c[k+1310736+(e+4<<2)>>2]|0;if((c[l>>2]|0)<(m|0))c[l>>2]=m;l=k+131084+((n|2)<<2)|0;m=c[k+1310736+(e+5<<2)>>2]|0;if((c[l>>2]|0)>(m|0))c[l>>2]=m;m=k+131084+((n|3)<<2)|0;l=c[k+1310736+(e+6<<2)>>2]|0;if((c[m>>2]|0)<(l|0))c[m>>2]=l;o=o+1|0}while((o|0)<(q|0))}if((c[p>>2]|0)>0){l=0;do{f=k+12+(l<<2)|0;g=l<<1;D=k+655376+(g<<3)|0;h[D>>3]=+h[D>>3]/+(c[f>>2]|0);g=k+655376+((g|1)<<3)|0;h[g>>3]=+h[g>>3]/+(c[f>>2]|0);l=l+1|0}while((l|0)<(c[p>>2]|0));l=0}else l=0}else l=0}i=E;return l|0}function Hd(e,f,g,j,k){e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;E=i;i=i+16|0;C=E;o=c[k>>2]|0;B=g+-1|0;if((f|0)>0){l=0;m=o;n=o+(($(B,f)|0)<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(f|0))break;else{m=m+2|0;n=n+2|0}}}A=f+-1|0;if((g|0)>0){l=0;m=o;n=o+(A<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(g|0))break;else{m=m+(f<<1)|0;n=n+(f<<1)|0}}}n=k+1179664|0;l=f+1|0;x=0-f|0;v=1-f|0;w=~f;a:do if((B|0)>1){y=(A|0)>1;p=(c[k+4>>2]|0)+l|0;z=1;e=e+(l<<1)|0;o=o+(l<<1)|0;m=0;b:while(1){if(y){l=p;u=1;t=e;s=m;while(1){do if((d[t>>0]|0|0)>(j|0)){a[l>>0]=-1;m=b[o+(x<<1)>>1]|0;if(m<<16>>16>0){b[o>>1]=m;m=(m<<16>>16)*7|0;r=k+1310736+(m+-7<<2)|0;c[r>>2]=(c[r>>2]|0)+1;r=k+1310736+(m+-6<<2)|0;c[r>>2]=(c[r>>2]|0)+u;r=k+1310736+(m+-5<<2)|0;c[r>>2]=(c[r>>2]|0)+z;c[k+1310736+(m+-1<<2)>>2]=z;m=s;break}p=b[o+(v<<1)>>1]|0;q=p<<16>>16;m=b[o+(w<<1)>>1]|0;r=m<<16>>16;e=m<<16>>16>0;if(p<<16>>16<=0){if(e){b[o>>1]=m;m=r*7|0;e=k+1310736+(m+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=k+1310736+(m+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+u;e=k+1310736+(m+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+z;e=k+1310736+(m+-3<<2)|0;if((c[e>>2]|0)<(u|0))c[e>>2]=u;c[k+1310736+(m+-1<<2)>>2]=z;m=s;break}m=b[o+-2>>1]|0;if(m<<16>>16>0){b[o>>1]=m;m=(m<<16>>16)*7|0;r=k+1310736+(m+-7<<2)|0;c[r>>2]=(c[r>>2]|0)+1;r=k+1310736+(m+-6<<2)|0;c[r>>2]=(c[r>>2]|0)+u;r=k+1310736+(m+-5<<2)|0;c[r>>2]=(c[r>>2]|0)+z;m=k+1310736+(m+-3<<2)|0;if((c[m>>2]|0)>=(u|0)){m=s;break}c[m>>2]=u;m=s;break}else{m=s+1|0;if((s|0)>32767)break b;b[o>>1]=m;c[k+1179664+(s<<2)>>2]=m<<16>>16;s=s*7|0;c[k+1310736+(s<<2)>>2]=1;c[k+1310736+(s+1<<2)>>2]=u;c[k+1310736+(s+2<<2)>>2]=z;c[k+1310736+(s+3<<2)>>2]=u;c[k+1310736+(s+4<<2)>>2]=u;c[k+1310736+(s+5<<2)>>2]=z;c[k+1310736+(s+6<<2)>>2]=z;break}}if(e){m=c[k+1179664+(q+-1<<2)>>2]|0;q=c[k+1179664+(r+-1<<2)>>2]|0;if((m|0)>(q|0)){b[o>>1]=q;if((s|0)>0){e=0;p=n;while(1){if((c[p>>2]|0)==(m|0))c[p>>2]=q;e=e+1|0;if((e|0)>=(s|0)){m=q;break}else p=p+4|0}}else m=q}else{b[o>>1]=m;if((m|0)<(q|0)&(s|0)>0){e=0;p=n;while(1){if((c[p>>2]|0)==(q|0))c[p>>2]=m;e=e+1|0;if((e|0)>=(s|0))break;else p=p+4|0}}}m=(m<<16>>16)*7|0;r=k+1310736+(m+-7<<2)|0;c[r>>2]=(c[r>>2]|0)+1;r=k+1310736+(m+-6<<2)|0;c[r>>2]=(c[r>>2]|0)+u;r=k+1310736+(m+-5<<2)|0;c[r>>2]=(c[r>>2]|0)+z;c[k+1310736+(m+-1<<2)>>2]=z;m=s;break}e=b[o+-2>>1]|0;if(e<<16>>16<=0){b[o>>1]=p;m=q*7|0;e=k+1310736+(m+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=k+1310736+(m+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+u;e=k+1310736+(m+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+z;e=k+1310736+(m+-4<<2)|0;if((c[e>>2]|0)>(u|0))c[e>>2]=u;c[k+1310736+(m+-1<<2)>>2]=z;m=s;break}m=c[k+1179664+(q+-1<<2)>>2]|0;q=c[k+1179664+((e<<16>>16)+-1<<2)>>2]|0;if((m|0)>(q|0)){b[o>>1]=q;if((s|0)>0){e=0;p=n;while(1){if((c[p>>2]|0)==(m|0))c[p>>2]=q;e=e+1|0;if((e|0)>=(s|0)){m=q;break}else p=p+4|0}}else m=q}else{b[o>>1]=m;if((m|0)<(q|0)&(s|0)>0){e=0;p=n;while(1){if((c[p>>2]|0)==(q|0))c[p>>2]=m;e=e+1|0;if((e|0)>=(s|0))break;else p=p+4|0}}}m=(m<<16>>16)*7|0;r=k+1310736+(m+-7<<2)|0;c[r>>2]=(c[r>>2]|0)+1;r=k+1310736+(m+-6<<2)|0;c[r>>2]=(c[r>>2]|0)+u;m=k+1310736+(m+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+z;m=s}else{b[o>>1]=0;a[l>>0]=0;m=s}while(0);u=u+1|0;e=t+2|0;o=o+2|0;l=l+1|0;if((u|0)>=(A|0))break;else{t=e;s=m}}}else l=p;z=z+1|0;if((z|0)>=(B|0)){q=m;D=52;break a}else{p=l+2|0;e=e+4|0;o=o+4|0}}Me(3,3904,C);l=-1}else{q=0;D=52}while(0);if((D|0)==52){o=k+12|0;if((q|0)<1)m=1;else{e=1;m=1;while(1){l=c[n>>2]|0;if((l|0)==(e|0)){l=m;m=m+1|0}else l=c[k+1179664+(l+-1<<2)>>2]|0;c[n>>2]=l;if((e|0)<(q|0)){e=e+1|0;n=n+4|0}else break}}p=k+8|0;l=m+-1|0;c[p>>2]=l;if(l){ek(o|0,0,l<<2|0)|0;ek(k+655376|0,0,l<<4|0)|0;if((m|0)>1){l=0;do{D=l<<2;c[k+131084+(D<<2)>>2]=f;c[k+131084+((D|1)<<2)>>2]=0;c[k+131084+((D|2)<<2)>>2]=g;c[k+131084+((D|3)<<2)>>2]=0;l=l+1|0}while((l|0)<(c[p>>2]|0))}if((q|0)>0){o=0;do{n=(c[k+1179664+(o<<2)>>2]|0)+-1|0;e=o*7|0;l=k+12+(n<<2)|0;c[l>>2]=(c[l>>2]|0)+(c[k+1310736+(e<<2)>>2]|0);l=n<<1;m=k+655376+(l<<3)|0;h[m>>3]=+h[m>>3]+ +(c[k+1310736+(e+1<<2)>>2]|0);l=k+655376+((l|1)<<3)|0;h[l>>3]=+h[l>>3]+ +(c[k+1310736+(e+2<<2)>>2]|0);n=n<<2;l=k+131084+(n<<2)|0;m=c[k+1310736+(e+3<<2)>>2]|0;if((c[l>>2]|0)>(m|0))c[l>>2]=m;l=k+131084+((n|1)<<2)|0;m=c[k+1310736+(e+4<<2)>>2]|0;if((c[l>>2]|0)<(m|0))c[l>>2]=m;l=k+131084+((n|2)<<2)|0;m=c[k+1310736+(e+5<<2)>>2]|0;if((c[l>>2]|0)>(m|0))c[l>>2]=m;m=k+131084+((n|3)<<2)|0;l=c[k+1310736+(e+6<<2)>>2]|0;if((c[m>>2]|0)<(l|0))c[m>>2]=l;o=o+1|0}while((o|0)<(q|0))}if((c[p>>2]|0)>0){l=0;do{f=k+12+(l<<2)|0;g=l<<1;D=k+655376+(g<<3)|0;h[D>>3]=+h[D>>3]/+(c[f>>2]|0);g=k+655376+((g|1)<<3)|0;h[g>>3]=+h[g>>3]/+(c[f>>2]|0);l=l+1|0}while((l|0)<(c[p>>2]|0));l=0}else l=0}else l=0}i=E;return l|0}function Id(e,f,g,j,k){e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;E=i;i=i+16|0;C=E;o=c[k>>2]|0;B=g+-1|0;if((f|0)>0){l=0;m=o;n=o+(($(B,f)|0)<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(f|0))break;else{m=m+2|0;n=n+2|0}}}A=f+-1|0;if((g|0)>0){l=0;m=o;n=o+(A<<1)|0;while(1){b[n>>1]=0;b[m>>1]=0;l=l+1|0;if((l|0)>=(g|0))break;else{m=m+(f<<1)|0;n=n+(f<<1)|0}}}n=k+1179664|0;m=f+1|0;x=0-f|0;v=1-f|0;w=~f;a:do if((B|0)>1){y=(A|0)>1;l=(c[k+4>>2]|0)+m|0;z=1;e=e+m|0;o=o+(m<<1)|0;j=j+m|0;m=0;b:while(1){if(y){u=1;t=e;s=m;while(1){do if((d[t>>0]|0)>(d[j>>0]|0)){a[l>>0]=-1;m=b[o+(x<<1)>>1]|0;if(m<<16>>16>0){b[o>>1]=m;m=(m<<16>>16)*7|0;r=k+1310736+(m+-7<<2)|0;c[r>>2]=(c[r>>2]|0)+1;r=k+1310736+(m+-6<<2)|0;c[r>>2]=(c[r>>2]|0)+u;r=k+1310736+(m+-5<<2)|0;c[r>>2]=(c[r>>2]|0)+z;c[k+1310736+(m+-1<<2)>>2]=z;m=s;break}p=b[o+(v<<1)>>1]|0;q=p<<16>>16;m=b[o+(w<<1)>>1]|0;r=m<<16>>16;e=m<<16>>16>0;if(p<<16>>16<=0){if(e){b[o>>1]=m;m=r*7|0;e=k+1310736+(m+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=k+1310736+(m+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+u;e=k+1310736+(m+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+z;e=k+1310736+(m+-3<<2)|0;if((c[e>>2]|0)<(u|0))c[e>>2]=u;c[k+1310736+(m+-1<<2)>>2]=z;m=s;break}m=b[o+-2>>1]|0;if(m<<16>>16>0){b[o>>1]=m;m=(m<<16>>16)*7|0;r=k+1310736+(m+-7<<2)|0;c[r>>2]=(c[r>>2]|0)+1;r=k+1310736+(m+-6<<2)|0;c[r>>2]=(c[r>>2]|0)+u;r=k+1310736+(m+-5<<2)|0;c[r>>2]=(c[r>>2]|0)+z;m=k+1310736+(m+-3<<2)|0;if((c[m>>2]|0)>=(u|0)){m=s;break}c[m>>2]=u;m=s;break}else{m=s+1|0;if((s|0)>32767)break b;b[o>>1]=m;c[k+1179664+(s<<2)>>2]=m<<16>>16;s=s*7|0;c[k+1310736+(s<<2)>>2]=1;c[k+1310736+(s+1<<2)>>2]=u;c[k+1310736+(s+2<<2)>>2]=z;c[k+1310736+(s+3<<2)>>2]=u;c[k+1310736+(s+4<<2)>>2]=u;c[k+1310736+(s+5<<2)>>2]=z;c[k+1310736+(s+6<<2)>>2]=z;break}}if(e){m=c[k+1179664+(q+-1<<2)>>2]|0;q=c[k+1179664+(r+-1<<2)>>2]|0;if((m|0)>(q|0)){b[o>>1]=q;if((s|0)>0){e=0;p=n;while(1){if((c[p>>2]|0)==(m|0))c[p>>2]=q;e=e+1|0;if((e|0)>=(s|0)){m=q;break}else p=p+4|0}}else m=q}else{b[o>>1]=m;if((m|0)<(q|0)&(s|0)>0){e=0;p=n;while(1){if((c[p>>2]|0)==(q|0))c[p>>2]=m;e=e+1|0;if((e|0)>=(s|0))break;else p=p+4|0}}}m=(m<<16>>16)*7|0;r=k+1310736+(m+-7<<2)|0;c[r>>2]=(c[r>>2]|0)+1;r=k+1310736+(m+-6<<2)|0;c[r>>2]=(c[r>>2]|0)+u;r=k+1310736+(m+-5<<2)|0;c[r>>2]=(c[r>>2]|0)+z;c[k+1310736+(m+-1<<2)>>2]=z;m=s;break}e=b[o+-2>>1]|0;if(e<<16>>16<=0){b[o>>1]=p;m=q*7|0;e=k+1310736+(m+-7<<2)|0;c[e>>2]=(c[e>>2]|0)+1;e=k+1310736+(m+-6<<2)|0;c[e>>2]=(c[e>>2]|0)+u;e=k+1310736+(m+-5<<2)|0;c[e>>2]=(c[e>>2]|0)+z;e=k+1310736+(m+-4<<2)|0;if((c[e>>2]|0)>(u|0))c[e>>2]=u;c[k+1310736+(m+-1<<2)>>2]=z;m=s;break}m=c[k+1179664+(q+-1<<2)>>2]|0;q=c[k+1179664+((e<<16>>16)+-1<<2)>>2]|0;if((m|0)>(q|0)){b[o>>1]=q;if((s|0)>0){e=0;p=n;while(1){if((c[p>>2]|0)==(m|0))c[p>>2]=q;e=e+1|0;if((e|0)>=(s|0)){m=q;break}else p=p+4|0}}else m=q}else{b[o>>1]=m;if((m|0)<(q|0)&(s|0)>0){e=0;p=n;while(1){if((c[p>>2]|0)==(q|0))c[p>>2]=m;e=e+1|0;if((e|0)>=(s|0))break;else p=p+4|0}}}m=(m<<16>>16)*7|0;r=k+1310736+(m+-7<<2)|0;c[r>>2]=(c[r>>2]|0)+1;r=k+1310736+(m+-6<<2)|0;c[r>>2]=(c[r>>2]|0)+u;m=k+1310736+(m+-5<<2)|0;c[m>>2]=(c[m>>2]|0)+z;m=s}else{b[o>>1]=0;a[l>>0]=0;m=s}while(0);u=u+1|0;e=t+1|0;j=j+1|0;o=o+2|0;l=l+1|0;if((u|0)>=(A|0))break;else{t=e;s=m}}}z=z+1|0;if((z|0)>=(B|0)){p=m;D=52;break a}else{l=l+2|0;e=e+2|0;o=o+4|0;j=j+2|0}}Me(3,3904,C);l=-1}else{p=0;D=52}while(0);if((D|0)==52){o=k+12|0;if((p|0)<1)m=1;else{e=1;m=1;while(1){l=c[n>>2]|0;if((l|0)==(e|0)){l=m;m=m+1|0}else l=c[k+1179664+(l+-1<<2)>>2]|0;c[n>>2]=l;if((e|0)<(p|0)){e=e+1|0;n=n+4|0}else break}}j=k+8|0;l=m+-1|0;c[j>>2]=l;if(l){ek(o|0,0,l<<2|0)|0;ek(k+655376|0,0,l<<4|0)|0;if((m|0)>1){l=0;do{D=l<<2;c[k+131084+(D<<2)>>2]=f;c[k+131084+((D|1)<<2)>>2]=0;c[k+131084+((D|2)<<2)>>2]=g;c[k+131084+((D|3)<<2)>>2]=0;l=l+1|0}while((l|0)<(c[j>>2]|0))}if((p|0)>0){o=0;do{n=(c[k+1179664+(o<<2)>>2]|0)+-1|0;e=o*7|0;l=k+12+(n<<2)|0;c[l>>2]=(c[l>>2]|0)+(c[k+1310736+(e<<2)>>2]|0);l=n<<1;m=k+655376+(l<<3)|0;h[m>>3]=+h[m>>3]+ +(c[k+1310736+(e+1<<2)>>2]|0);l=k+655376+((l|1)<<3)|0;h[l>>3]=+h[l>>3]+ +(c[k+1310736+(e+2<<2)>>2]|0);n=n<<2;l=k+131084+(n<<2)|0;m=c[k+1310736+(e+3<<2)>>2]|0;if((c[l>>2]|0)>(m|0))c[l>>2]=m;l=k+131084+((n|1)<<2)|0;m=c[k+1310736+(e+4<<2)>>2]|0;if((c[l>>2]|0)<(m|0))c[l>>2]=m;l=k+131084+((n|2)<<2)|0;m=c[k+1310736+(e+5<<2)>>2]|0;if((c[l>>2]|0)>(m|0))c[l>>2]=m;m=k+131084+((n|3)<<2)|0;l=c[k+1310736+(e+6<<2)>>2]|0;if((c[m>>2]|0)<(l|0))c[m>>2]=l;o=o+1|0}while((o|0)<(p|0))}if((c[j>>2]|0)>0){l=0;do{f=k+12+(l<<2)|0;g=l<<1;D=k+655376+(g<<3)|0;h[D>>3]=+h[D>>3]/+(c[f>>2]|0);g=k+655376+((g|1)<<3)|0;h[g>>3]=+h[g>>3]/+(c[f>>2]|0);l=l+1|0}while((l|0)<(c[j>>2]|0));l=0}else l=0}else l=0}i=E;return l|0}function Jd(a){a=a|0;return Kd(a+8|0)|0}function Kd(a){a=a|0;var b=0,d=0;d=i;i=i+16|0;b=Uj(4)|0;if(!b){Me(3,5472,d);rb(1)}a=wf(a)|0;c[b>>2]=a;if(!a){Vj(b);b=0}i=d;return b|0}function Ld(a){a=a|0;var b=0;b=c[a>>2]|0;if(!b)b=-1;else{xf(b)|0;Vj(c[a>>2]|0);c[a>>2]=0;b=0}return b|0}function Md(a){a=a|0;var b=0,d=0,e=0;d=i;i=i+16|0;b=Uj(7062432)|0;if(!b){Me(3,5472,d);rb(1)}c[b>>2]=0;c[b+4834148>>2]=0;c[b+7062408>>2]=0;c[b+4>>2]=-1;c[b+8>>2]=0;c[b+12>>2]=1;c[b+16>>2]=100;c[b+20>>2]=0;c[b+24>>2]=0;c[b+28>>2]=2;h[b+7062416>>3]=.5;c[b+7062424>>2]=3;c[b+32>>2]=a;e=c[a>>2]|0;c[b+36>>2]=e;a=c[a+4>>2]|0;c[b+40>>2]=a;c[b+44>>2]=0;c[b+15408>>2]=0;c[b+4834152>>2]=0;c[b+4818296>>2]=0;a=Uj($(e<<1,a)|0)|0;c[b+4834144>>2]=a;if(!a){Me(3,5472,d+8|0);rb(1)}else{c[b+7062384>>2]=0;Nd(b,2)|0;Od(b,0)|0;c[b+7062388>>2]=-1;Pd(b,0)|0;c[b+7062392>>2]=7;c[b+7062396>>2]=0;i=d;return b|0}return 0}function Nd(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;g=i;i=i+16|0;d=g;a:do if(a){e=a+4|0;if((c[e>>2]|0)!=(b|0)){switch(b|0){case 11:case 10:case 9:case 8:case 7:case 6:case 4:case 3:case 2:case 1:case 0:{f=0;break}case 14:case 13:case 12:case 5:{f=1;break}default:{c[d>>2]=b;Me(3,3936,d);d=-1;break a}}c[e>>2]=b;c[a+8>>2]=Pe(b)|0;d=a+7062408|0;b=c[d>>2]|0;if(b){pe(b);c[d>>2]=oe(c[a+36>>2]|0,c[a+40>>2]|0,c[e>>2]|0,0)|0}d=a+24|0;b=c[d>>2]|0;if(!f)switch(b|0){case 1:{c[d>>2]=4;d=0;break a}case 4:{c[d>>2]=3;d=0;break a}default:{d=0;break a}}else switch(b|0){case 0:{c[d>>2]=1;d=0;break a}case 3:{c[d>>2]=4;d=0;break a}default:{d=0;break a}}}else d=0}else d=-1;while(0);i=g;return d|0}function Od(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;f=i;i=i+16|0;e=f;do if(a)if((c[a>>2]|0)!=(b|0)){c[a>>2]=b;if(!b){d=a+4834148|0;Vj(c[d>>2]|0);c[d>>2]=0;d=0;break}b=Uj($(c[a+40>>2]|0,c[a+36>>2]|0)|0)|0;c[a+4834148>>2]=b;if(!b){Me(3,5472,e);rb(1)}else d=0}else d=0;else d=-1;while(0);i=f;return d|0}function Pd(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0;j=i;i=i+16|0;h=j+8|0;f=j;if(a){g=a+7062388|0;if((c[g>>2]|0)!=(b|0)){d=a+7062408|0;e=c[d>>2]|0;if(e){pe(e);c[d>>2]=0}switch(b|0){case 3:case 2:case 1:{c[d>>2]=oe(c[a+36>>2]|0,c[a+40>>2]|0,c[a+4>>2]|0,0)|0;break}case 4:{c[a+7062404>>2]=1;c[a+7062400>>2]=1;b=4;break}case 0:{b=0;break}default:{Me(3,3985,f);b=0}}c[g>>2]=b;if((c[a>>2]|0)==1){c[h>>2]=c[760+(b<<2)>>2];Me(3,4059,h);b=0}else b=0}else b=0}else b=-1;i=j;return b|0}function Qd(a){a=a|0;var b=0,d=0;if(!a)b=-1;else{b=a+7062408|0;d=c[b>>2]|0;if(d){pe(d);c[b>>2]=0}Vj(c[a+4834144>>2]|0);Vj(c[a+4834148>>2]|0);Vj(a);b=0}return b|0}function Rd(a,b){a=a|0;b=b|0;if((a|0)!=0&(b|0)!=0){c[b>>2]=c[a>>2];a=0}else a=-1;return a|0}function Sd(a,b){a=a|0;b=b|0;if((a|0)!=0&b>>>0<2){c[a+12>>2]=b;a=0}else a=-1;return a|0}function Td(a,b){a=a|0;b=b|0;if((a|0)!=0&(b|0)!=0){c[b>>2]=c[a+12>>2];a=0}else a=-1;return a|0}function Ud(a,b){a=a|0;b=b|0;if((a|0)==0|b>>>0>255)a=-1;else{c[a+16>>2]=b;a=0}return a|0}function Vd(a,b){a=a|0;b=b|0;if((a|0)!=0&(b|0)!=0){c[b>>2]=c[a+16>>2];a=0}else a=-1;return a|0}function Wd(a,b){a=a|0;b=b|0;if((a|0)!=0&(b|0)!=0){c[b>>2]=c[a+7062388>>2];a=0}else a=-1;return a|0}function Xd(a,b){a=a|0;b=b|0;if((a|0)!=0&b>>>0<2){c[a+20>>2]=b;a=0}else a=-1;return a|0}function Yd(a,b){a=a|0;b=b|0;if(!a)a=-1;else{c[b>>2]=c[a+20>>2];a=0}return a|0}function Zd(a,b){a=a|0;b=b|0;if((a|0)!=0&b>>>0<5){c[a+24>>2]=b;a=0}else a=-1;return a|0}function _d(a,b){a=a|0;b=b|0;if(!a)a=-1;else{c[a+7062424>>2]=b;a=0}return a|0}function $d(a,b){a=a|0;b=b|0;if((a|0)!=0&(b|0)!=0){c[b>>2]=c[a+7062424>>2];a=0}else a=-1;return a|0}function ae(a,b){a=a|0;b=b|0;if(!a)a=-1;else{c[b>>2]=c[a+24>>2];a=0}return a|0}function be(a,b){a=a|0;b=+b;if((a|0)!=0?!(b<=0.0|b>=1.0):0){h[a+7062416>>3]=b;a=0}else a=-1;return a|0}function ce(a,b){a=a|0;b=b|0;if(!a)a=-1;else{h[b>>3]=+h[a+7062416>>3];a=0}return a|0}function de(a,b){a=a|0;b=b|0;var e=0,f=0,g=0,j=0.0,k=0,l=0,m=0,n=0.0,o=0.0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0.0,P=0,Q=0,R=0.0,S=0.0;Q=i;i=i+80|0;M=Q+32|0;G=Q+24|0;z=Q;y=Q+52|0;D=Q+40|0;L=Q+64|0;P=a+44|0;c[P>>2]=0;J=a+7062388|0;f=c[J>>2]|0;a:do if((f|0)==4){I=a+7062396|0;e=c[I>>2]|0;do if((e|0)>0){f=4;e=e+-1|0}else{C=a+16|0;F=c[C>>2]|0;E=a+7062400|0;A=(c[E>>2]|0)+F|0;A=(A|0)>255?255:A;c[y>>2]=A;H=a+7062404|0;B=F-(c[H>>2]|0)|0;B=(B|0)<0?0:B;c[y+4>>2]=B;c[y+8>>2]=F;e=a+36|0;f=a+40|0;g=a+4|0;k=a+12|0;l=a+20|0;m=a+4834144|0;p=a+15416|0;q=a+15408|0;r=a+7062384|0;s=a+24|0;t=a+32|0;u=a+7062416|0;v=a+48|0;w=a+7062424|0;x=0;do{if((xe(b,c[e>>2]|0,c[f>>2]|0,c[g>>2]|0,c[a>>2]|0,c[k>>2]|0,c[y+(x<<2)>>2]|0,c[l>>2]|0,m,0)|0)<0){e=-1;break a}if((fe(c[e>>2]|0,c[f>>2]|0,m,c[l>>2]|0,1e6,70,1.0,p,q)|0)<0){e=-1;break a}if((je(b,c[e>>2]|0,c[f>>2]|0,c[g>>2]|0,p,c[q>>2]|0,c[r>>2]|0,c[l>>2]|0,c[s>>2]|0,(c[t>>2]|0)+184|0,+h[u>>3],v,P,c[w>>2]|0)|0)<0){e=-1;break a}c[D+(x<<2)>>2]=c[P>>2];x=x+1|0}while((x|0)<3);if((c[a>>2]|0)==1){N=c[D+4>>2]|0;g=c[D+8>>2]|0;f=c[D>>2]|0;c[z>>2]=B;c[z+4>>2]=N;c[z+8>>2]=F;c[z+12>>2]=g;c[z+16>>2]=A;c[z+20>>2]=f;Me(3,4153,z)}else{f=c[D>>2]|0;g=c[D+8>>2]|0}e=c[D+4>>2]|0;if((f|0)>(g|0)|(e|0)>(g|0)){f=(f|0)>=(e|0)?A:B;c[C>>2]=f;e=f-F|0;if((e|0)>0){c[E>>2]=e;e=1}else{c[E>>2]=1;e=0-e|0}c[H>>2]=e;if((c[a>>2]|0)==1){c[G>>2]=f;Me(3,4229,G)}f=c[J>>2]|0;e=c[a+7062392>>2]|0;break}e=c[E>>2]|0;f=c[H>>2]|0;do if((e|0)>=(f|0))if((e|0)>(f|0)){c[H>>2]=f+1;break}else{e=e+1|0;c[E>>2]=e;c[H>>2]=f+1;break}else{e=e+1|0;c[E>>2]=e}while(0);if((e+F|0)>254){c[E>>2]=1;e=1}if((F|0)<=(e|0))c[H>>2]=1;c[I>>2]=c[a+7062392>>2];N=47;break a}while(0);c[I>>2]=e;N=30}else N=30;while(0);b:do if((N|0)==30){c:do switch(f|0){case 3:{f=a+7062408|0;e=we(c[f>>2]|0,b,9,-7)|0;if((e|0)<0)break b;e=c[f>>2]|0;f=a+4834144|0;e=xe(c[e>>2]|0,c[e+8>>2]|0,c[e+12>>2]|0,5,c[a>>2]|0,c[a+12>>2]|0,0,0,f,c[e+4>>2]|0)|0;if((e|0)<0)break b;e=a+36|0;g=a+40|0;k=a+20|0;break}case 2:case 1:{g=a+7062396|0;e=c[g>>2]|0;if((e|0)>0){c[g>>2]=e+-1;N=44;break c}e=c[a+7062408>>2]|0;if((f|0)==1)e=ue(e,b,L)|0;else e=ve(e,b,L)|0;if((e|0)<0)break b;e=a+16|0;if((c[a>>2]|0)==1?(K=d[L>>0]|0,(c[e>>2]|0)!=(K|0)):0){c[M>>2]=(c[J>>2]|0)==1?4281:4288;c[M+4>>2]=K;Me(3,4293,M)}c[e>>2]=d[L>>0];c[g>>2]=c[a+7062392>>2];N=44;break}default:N=44}while(0);if((N|0)==44){e=a+36|0;g=a+40|0;k=a+20|0;f=a+4834144|0;if((xe(b,c[e>>2]|0,c[g>>2]|0,c[a+4>>2]|0,c[a>>2]|0,c[a+12>>2]|0,c[a+16>>2]|0,c[k>>2]|0,f,0)|0)<0){e=-1;break}}l=a+15416|0;m=a+15408|0;if((fe(c[e>>2]|0,c[g>>2]|0,f,c[k>>2]|0,1e6,70,1.0,l,m)|0)>=0?(je(b,c[e>>2]|0,c[g>>2]|0,c[a+4>>2]|0,l,c[m>>2]|0,c[a+7062384>>2]|0,c[k>>2]|0,c[a+24>>2]|0,(c[a+32>>2]|0)+184|0,+h[a+7062416>>3],a+48|0,P,c[a+7062424>>2]|0)|0)>=0:0)N=47;else e=-1}while(0);d:do if((N|0)==47){t=a+28|0;if((c[t>>2]|0)==1){ee(a);e=0;break}u=a+4818296|0;r=a+24|0;q=c[u>>2]|0;if((q|0)>0){s=0;do{f=c[P>>2]|0;g=a+4818304+(s*264|0)+56|0;k=a+4818304+(s*264|0)+64|0;if((f|0)>0){o=+(c[a+4818304+(s*264|0)>>2]|0);e=-1;l=0;n=.5;while(1){j=+(c[a+48+(l<<8)>>2]|0);R=o/j;if(!(R<.7|R>1.43)?(R=+h[a+48+(l<<8)+56>>3]-+h[g>>3],O=+h[a+48+(l<<8)+64>>3]-+h[k>>3],O=(R*R+O*O)/j,O<n):0){e=l;j=O}else j=n;l=l+1|0;if((l|0)>=(f|0)){p=e;break}else n=j}}else p=-1;e:do if((p|0)>-1){m=c[r>>2]|0;switch(m|0){case 2:case 1:case 0:break;case 4:case 3:{g=a+48+(p<<8)+40|0;j=+h[a+4818304+(s*264|0)+40>>3];if(!(+h[g>>3]<j)){e=a+48+(p<<8)+48|0;f=a+4818304+(s*264|0)+48|0;if(!(+h[e>>3]<+h[f>>3]))break e}else{f=a+4818304+(s*264|0)+48|0;e=a+48+(p<<8)+48|0}h[g>>3]=j;c[a+48+(p<<8)+8>>2]=c[a+4818304+(s*264|0)+8>>2];h[e>>3]=+h[f>>3];c[a+48+(p<<8)+12>>2]=c[a+4818304+(s*264|0)+12>>2];e=-1;n=1.0e8;g=0;while(1){j=0.0;f=0;do{b=(f+g|0)%4|0;o=+h[a+4818304+(s*264|0)+168+(f<<4)>>3]-+h[a+48+(p<<8)+168+(b<<4)>>3];R=+h[a+4818304+(s*264|0)+168+(f<<4)+8>>3]-+h[a+48+(p<<8)+168+(b<<4)+8>>3];j=j+(o*o+R*R);f=f+1|0}while((f|0)!=4);f=j<n;e=f?g:e;g=g+1|0;if((g|0)==4)break;else n=f?j:n}b=4-e|0;c[a+48+(p<<8)+20>>2]=(b+(c[a+4818304+(s*264|0)+20>>2]|0)|0)%4|0;c[a+48+(p<<8)+24>>2]=(b+(c[a+4818304+(s*264|0)+24>>2]|0)|0)%4|0;break e}default:{e=-1;break d}}e=a+48+(p<<8)+32|0;o=+h[a+4818304+(s*264|0)+32>>3];if(+h[e>>3]<o){h[e>>3]=o;l=c[a+4818304+(s*264|0)+4>>2]|0;c[a+48+(p<<8)+4>>2]=l;g=a+4818304+(s*264|0)+16|0;e=-1;n=1.0e8;k=0;while(1){j=0.0;f=0;do{b=(f+k|0)%4|0;S=+h[a+4818304+(s*264|0)+168+(f<<4)>>3]-+h[a+48+(p<<8)+168+(b<<4)>>3];R=+h[a+4818304+(s*264|0)+168+(f<<4)+8>>3]-+h[a+48+(p<<8)+168+(b<<4)+8>>3];j=j+(S*S+R*R);f=f+1|0}while((f|0)!=4);if(j<n)e=(4-k+(c[g>>2]|0)|0)%4|0;else j=n;k=k+1|0;if((k|0)==4)break;else n=j}c[a+48+(p<<8)+16>>2]=e;if(m>>>0<2){c[a+48+(p<<8)+8>>2]=l;h[a+48+(p<<8)+40>>3]=o;c[a+48+(p<<8)+20>>2]=e;break}else{c[a+48+(p<<8)+12>>2]=l;h[a+48+(p<<8)+48>>3]=o;c[a+48+(p<<8)+24>>2]=e;break}}}while(0);s=s+1|0}while((s|0)<(q|0))}ee(a);if((c[u>>2]|0)>0){g=0;e=0;do{f=a+4818304+(g*264|0)|0;N=a+4818304+(g*264|0)+256|0;b=(c[N>>2]|0)+1|0;c[N>>2]=b;if((b|0)<4){if((g|0)!=(e|0))ik(a+4818304+(e*264|0)|0,f|0,264)|0;e=e+1|0}g=g+1|0}while((g|0)<(c[u>>2]|0))}else e=0;c[u>>2]=e;e=c[P>>2]|0;f:do if((e|0)>0){m=0;do{k=a+48+(m<<8)|0;g=c[a+48+(m<<8)+4>>2]|0;if((g|0)>=0){l=c[u>>2]|0;g:do if((l|0)>0){f=0;do{if((c[a+4818304+(f*264|0)+4>>2]|0)==(g|0))break g;f=f+1|0}while((f|0)<(l|0))}else f=0;while(0);if((f|0)==(l|0)){if((l|0)==60)break f;c[u>>2]=l+1}ik(a+4818304+(f*264|0)|0,k|0,256)|0;c[a+4818304+(f*264|0)+256>>2]=1}m=m+1|0;e=c[P>>2]|0}while((m|0)<(e|0))}while(0);if((c[t>>2]|0)!=2?(c[u>>2]|0)>0:0){l=0;while(1){g=a+4818304+(l*264|0)+56|0;k=a+4818304+(l*264|0)+64|0;h:do if((e|0)>0){n=+(c[a+4818304+(l*264|0)>>2]|0);f=0;do{j=+(c[a+48+(f<<8)>>2]|0);S=n/j;if(!(S<.7|S>1.43)?(R=+h[a+48+(f<<8)+56>>3]-+h[g>>3],S=+h[a+48+(f<<8)+64>>3]-+h[k>>3],(R*R+S*S)/j<.5):0)break h;f=f+1|0}while((f|0)<(e|0))}else f=0;while(0);if((f|0)==(e|0)){ik(a+48+(e<<8)|0,a+4818304+(l*264|0)|0,256)|0;e=(c[P>>2]|0)+1|0;c[P>>2]=e}l=l+1|0;if((l|0)>=(c[u>>2]|0)){e=0;break}}}else e=0}while(0);i=Q;return e|0}function ee(a){a=a|0;var b=0,d=0,e=0,f=0;switch(c[a+24>>2]|0){case 1:case 0:{d=c[a+44>>2]|0;if((d|0)>0){e=0;do{b=a+48+(e<<8)+4|0;if((c[b>>2]|0)>-1?+h[a+48+(e<<8)+32>>3]<.5:0){c[a+48+(e<<8)+8>>2]=-1;c[b>>2]=-1;c[a+48+(e<<8)+236>>2]=6}e=e+1|0}while((e|0)<(d|0))}break}case 2:{d=c[a+44>>2]|0;if((d|0)>0){e=0;do{b=a+48+(e<<8)+4|0;if((c[b>>2]|0)>-1?+h[a+48+(e<<8)+32>>3]<.5:0){c[a+48+(e<<8)+12>>2]=-1;c[b>>2]=-1;c[a+48+(e<<8)+236>>2]=6}e=e+1|0}while((e|0)<(d|0))}break}default:{e=c[a+44>>2]|0;if((e|0)>0){f=0;do{b=a+48+(f<<8)+8|0;if((c[b>>2]|0)>-1?+h[a+48+(f<<8)+40>>3]<.5:0){c[b>>2]=-1;d=0}else d=1;b=a+48+(f<<8)+12|0;if(((c[b>>2]|0)>-1?+h[a+48+(f<<8)+48>>3]<.5:0)?(c[b>>2]=-1,(d|0)==0):0)c[a+48+(f<<8)+236>>2]=6;f=f+1|0}while((f|0)<(e|0))}}}return}function fe(a,b,d,e,f,g,j,k,l){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;j=+j;k=k|0;l=l|0;var m=0.0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0.0;L=i;i=i+96|0;F=L+56|0;H=L+48|0;G=L+8|0;I=L;K=(e|0)==1;if(K){a=(a|0)/2|0;b=(b|0)/2|0;f=(f|0)/4|0;g=(g|0)/4|0}c[l>>2]=0;C=d+8|0;D=a+-2|0;z=b+-2|0;A=d+1179664|0;a:do if((c[C>>2]|0)>0){B=0;while(1){w=d+12+(B<<2)|0;y=c[w>>2]|0;b:do if(((((!((y|0)<(g|0)|(y|0)>(f|0))?(E=d+131084+(B<<4)|0,(c[E>>2]|0)!=1):0)?(c[d+131084+(B<<4)+4>>2]|0)!=(D|0):0)?(c[d+131084+(B<<4)+8>>2]|0)!=1:0)?(c[d+131084+(B<<4)+12>>2]|0)!=(z|0):0)?(ge(c[d>>2]|0,a,0,A,B+1|0,E,k+((c[l>>2]|0)*80048|0)|0)|0)>=0:0){t=c[w>>2]|0;x=c[l>>2]|0;u=k+(x*80048|0)+28|0;b=c[u>>2]|0;v=k+(x*80048|0)+40028|0;n=c[v>>2]|0;y=k+(x*80048|0)+24|0;o=(c[y>>2]|0)+-1|0;if((o|0)>1){r=0;s=1;e=0;while(1){p=(c[k+(x*80048|0)+28+(s<<2)>>2]|0)-b|0;p=$(p,p)|0;q=(c[k+(x*80048|0)+40028+(s<<2)>>2]|0)-n|0;p=($(q,q)|0)+p|0;q=(p|0)>(r|0);e=q?s:e;s=s+1|0;if((s|0)>=(o|0))break;else r=q?p:r}}else e=0;m=+(t|0)/.75*.01*j;c[H>>2]=0;c[I>>2]=0;c:do if((he(u,v,0,e,m,F,H)|0)>=0?(he(u,v,e,(c[y>>2]|0)+-1|0,m,G,I)|0)>=0:0){b=c[H>>2]|0;n=c[I>>2]|0;do if((b|0)==1&(n|0)==1){b=c[G>>2]|0;n=c[F>>2]|0}else{if((b|0)>1&(n|0)==0){b=(e|0)/2|0;c[I>>2]=0;c[H>>2]=0;if((he(u,v,0,b,m,F,H)|0)<0)break c;if((he(u,v,b,e,m,G,I)|0)<0)break c;if(!((c[H>>2]|0)==1&(c[I>>2]|0)==1))break c;b=e;n=c[F>>2]|0;e=c[G>>2]|0;break}if(!((b|0)==0&(n|0)>1))break c;b=(e+-1+(c[y>>2]|0)|0)/2|0;c[I>>2]=0;c[H>>2]=0;if((he(u,v,e,b,m,F,H)|0)<0)break c;if((he(u,v,b,(c[y>>2]|0)+-1|0,m,G,I)|0)<0)break c;if(!((c[H>>2]|0)==1&(c[I>>2]|0)==1))break c;b=c[G>>2]|0;n=e;e=c[F>>2]|0}while(0);c[k+(x*80048|0)+80028>>2]=0;c[k+(x*80048|0)+80032>>2]=n;c[k+(x*80048|0)+80036>>2]=e;c[k+(x*80048|0)+80040>>2]=b;c[k+(x*80048|0)+80044>>2]=(c[y>>2]|0)+-1;c[k+((c[l>>2]|0)*80048|0)>>2]=c[w>>2];y=c[l>>2]|0;h[k+(y*80048|0)+8>>3]=+h[d+655376+(B<<4)>>3];h[k+(y*80048|0)+16>>3]=+h[d+655376+(B<<4)+8>>3];y=y+1|0;c[l>>2]=y;if((y|0)==60){e=60;break a}else break b}while(0)}while(0);B=B+1|0;if((B|0)>=(c[C>>2]|0)){J=4;break}}}else J=4;while(0);if((J|0)==4)e=c[l>>2]|0;if((e|0)>0){o=0;do{a=o;o=o+1|0;g=k+(a*80048|0)+16|0;n=k+(a*80048|0)|0;if((o|0)<(e|0)){j=+h[k+(a*80048|0)+8>>3];f=o;do{M=j-+h[k+(f*80048|0)+8>>3];m=+h[g>>3]-+h[k+(f*80048|0)+16>>3];m=M*M+m*m;e=c[n>>2]|0;a=k+(f*80048|0)|0;b=c[a>>2]|0;if((e|0)>(b|0)){if(m<+((e|0)/4|0|0))c[a>>2]=0}else if(m<+((b|0)/4|0|0))c[n>>2]=0;f=f+1|0;e=c[l>>2]|0}while((f|0)<(e|0))}}while((o|0)<(e|0))}if((e|0)>0){f=0;do{if(!(c[k+(f*80048|0)>>2]|0)){a=f+1|0;if((a|0)<(e|0)){e=f;b=a;while(1){ik(k+(e*80048|0)|0,k+(b*80048|0)|0,80048)|0;e=c[l>>2]|0;a=b+1|0;if((a|0)<(e|0)){e=b;b=a}else break}}e=e+-1|0;c[l>>2]=e}f=f+1|0}while((f|0)<(e|0))}if(K&(e|0)>0){b=0;while(1){c[k>>2]=c[k>>2]<<2;e=k+8|0;h[e>>3]=+h[e>>3]*2.0;e=k+16|0;h[e>>3]=+h[e>>3]*2.0;e=k+24|0;if((c[e>>2]|0)>0){a=0;do{K=k+28+(a<<2)|0;c[K>>2]=c[K>>2]<<1;K=k+40028+(a<<2)|0;c[K>>2]=c[K>>2]<<1;a=a+1|0}while((a|0)<(c[e>>2]|0))}b=b+1|0;if((b|0)>=(c[l>>2]|0))break;else k=k+80048|0}}i=L;return 0}function ge(a,d,e,f,g,h,j){a=a|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;w=i;i=i+80032|0;p=w+16|0;o=w+8|0;l=w;u=w+40024|0;v=w+24|0;t=c[h+8>>2]|0;e=c[h>>2]|0;h=c[h+4>>2]|0;a:do if((e|0)<=(h|0)){k=e;e=a+(($(t,d)|0)+e<<1)|0;while(1){s=b[e>>1]|0;if(s<<16>>16>0?(c[f+((s<<16>>16)+-1<<2)>>2]|0)==(g|0):0){n=k;break}if((k|0)<(h|0)){k=k+1|0;e=e+2|0}else{x=6;break a}}q=j+24|0;c[q>>2]=1;r=j+28|0;c[r>>2]=n;s=j+40028|0;c[s>>2]=t;f=t;m=n;k=1;e=5;while(1){h=(e+5|0)%8|0;e=0;while(1){g=c[776+(h<<2)>>2]|0;l=c[808+(h<<2)>>2]|0;if((b[a+(l+m+($(g+f|0,d)|0)<<1)>>1]|0)>0){e=g;g=h;break}e=e+1|0;h=(h+1|0)%8|0;if((e|0)>=8){x=11;break}}if((x|0)==11){x=0;if((e|0)==8){x=13;break}l=c[808+(h<<2)>>2]|0;e=c[776+(h<<2)>>2]|0;g=h}c[j+28+(k<<2)>>2]=l+m;h=c[q>>2]|0;c[j+40028+(h<<2)>>2]=e+(c[j+40028+(h+-1<<2)>>2]|0);e=c[q>>2]|0;h=j+28+(e<<2)|0;if((c[h>>2]|0)==(n|0)?(c[j+40028+(e<<2)>>2]|0)==(t|0):0){f=e;x=16;break}k=e+1|0;c[q>>2]=k;if((k|0)==9999){x=19;break}f=c[j+40028+(e<<2)>>2]|0;m=c[h>>2]|0;e=g}if((x|0)==13){Me(3,4347,o);e=-1;break}else if((x|0)==16){if((f|0)>1){l=0;g=1;h=0;while(1){e=(c[j+28+(g<<2)>>2]|0)-n|0;e=$(e,e)|0;k=(c[j+40028+(g<<2)>>2]|0)-t|0;e=($(k,k)|0)+e|0;k=(e|0)>(l|0);h=k?g:h;g=g+1|0;if((g|0)>=(f|0))break;else l=k?e:l}}else h=0;if((h|0)>0){e=0;do{c[u+(e<<2)>>2]=c[j+28+(e<<2)>>2];c[v+(e<<2)>>2]=c[j+40028+(e<<2)>>2];e=e+1|0}while((e|0)<(h|0))}if((h|0)<(f|0)){e=h;do{t=e-h|0;c[j+28+(t<<2)>>2]=c[j+28+(e<<2)>>2];c[j+40028+(t<<2)>>2]=c[j+40028+(e<<2)>>2];e=e+1|0}while((e|0)<(c[q>>2]|0))}if((h|0)>0){e=0;do{t=e-h|0;c[j+28+((c[q>>2]|0)+t<<2)>>2]=c[u+(e<<2)>>2];c[j+40028+((c[q>>2]|0)+t<<2)>>2]=c[v+(e<<2)>>2];e=e+1|0}while((e|0)<(h|0))}c[j+28+(c[q>>2]<<2)>>2]=c[r>>2];c[j+40028+(c[q>>2]<<2)>>2]=c[s>>2];c[q>>2]=(c[q>>2]|0)+1;e=0;break}else if((x|0)==19){Me(3,4354,p);e=-1;break}}else x=6;while(0);if((x|0)==6){Me(3,4340,l);e=-1}i=w;return e|0}function he(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=+f;g=g|0;h=h|0;var i=0,j=0.0,k=0.0,l=0,m=0.0,n=0,o=0.0,p=0,q=0,r=0,s=0.0;i=c[b+(e<<2)>>2]|0;q=c[b+(d<<2)>>2]|0;o=+(i-q|0);l=c[a+(d<<2)>>2]|0;r=c[a+(e<<2)>>2]|0;m=+(l-r|0);k=+(($(r,q)|0)-($(l,i)|0)|0);i=d+1|0;if((i|0)<(e|0)){j=0.0;l=i;do{s=k+(o*+(c[a+(l<<2)>>2]|0)+m*+(c[b+(l<<2)>>2]|0));s=s*s;r=s>j;j=r?s:j;i=r?l:i;l=l+1|0}while((l|0)<(e|0))}else j=0.0;if(j/(o*o+m*m)>f)if(((he(a,b,d,i,f,g,h)|0)>=0?(n=c[h>>2]|0,(n|0)<=5):0)?(c[g+(n<<2)>>2]=i,c[h>>2]=(c[h>>2]|0)+1,(he(a,b,i,e,f,g,h)|0)>=0):0)p=7;else i=-1;else p=7;if((p|0)==7)i=0;return i|0}function ie(a,b,d,e,f,j,k){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;j=j|0;k=k|0;var l=0,m=0.0,n=0,o=0.0,p=0.0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;y=i;i=i+16|0;t=y+4|0;u=y;v=nf(2)|0;w=nf(2)|0;x=Re(2,2)|0;q=0;a:while(1){r=q;q=q+1|0;s=c[e+(q<<2)>>2]|0;l=c[e+(r<<2)>>2]|0;p=+(s+1-l|0)*.05+.5;l=~~(+(l|0)+p);s=~~(+(s|0)-p)-l|0;n=s+1|0;d=Re(n,2)|0;if((s|0)>-1){s=0;do{z=s+l|0;if((mf(f,+(c[a+(z<<2)>>2]|0),+(c[b+(z<<2)>>2]|0),t,u)|0)<0){l=10;break a}z=s<<1;A=c[d>>2]|0;h[A+(z<<3)>>3]=+g[t>>2];h[A+((z|1)<<3)>>3]=+g[u>>2];s=s+1|0}while((s|0)<(n|0))}if((Ye(d,x,v,w)|0)<0){l=10;break}A=c[x>>2]|0;o=+h[A+8>>3];h[j+(r*24|0)>>3]=o;p=-+h[A>>3];h[j+(r*24|0)+8>>3]=p;A=c[w>>2]|0;h[j+(r*24|0)+16>>3]=-(o*+h[A>>3]+ +h[A+8>>3]*p);We(d)|0;if((q|0)>=4){l=7;break}}b:do if((l|0)==7){We(x)|0;of(w)|0;of(v)|0;q=0;while(1){d=(q+3|0)%4|0;l=j+(d*24|0)|0;m=+h[j+(q*24|0)+8>>3];n=j+(q*24|0)|0;o=+h[j+(d*24|0)+8>>3];p=+h[l>>3]*m-+h[n>>3]*o;if(+O(+p)<.0001){d=-1;break b}A=j+(q*24|0)+16|0;z=j+(d*24|0)+16|0;h[k+(q<<4)>>3]=(o*+h[A>>3]-m*+h[z>>3])/p;h[k+(q<<4)+8>>3]=(+h[n>>3]*+h[z>>3]-+h[l>>3]*+h[A>>3])/p;q=q+1|0;if((q|0)>=4){d=0;break}}}else if((l|0)==10){We(d)|0;We(x)|0;of(w)|0;of(v)|0;d=-1}while(0);i=y;return d|0}function je(a,b,d,e,f,j,k,l,m,n,o,p,q,r){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=+o;p=p|0;q=q|0;r=r|0;var s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;F=i;i=i+16|0;D=F+4|0;E=F;z=m>>>0<2;A=(m|0)==2;if((j|0)>0){C=0;s=0;do{c[p+(s<<8)>>2]=c[f+(C*80048|0)>>2];if((mf(n,+h[f+(C*80048|0)+8>>3],+h[f+(C*80048|0)+16>>3],D,E)|0)>=0?(h[p+(s<<8)+56>>3]=+g[D>>2],h[p+(s<<8)+64>>3]=+g[E>>2],B=p+(s<<8)+168|0,(ie(f+(C*80048|0)+28|0,f+(C*80048|0)+40028|0,c[f+(C*80048|0)+24>>2]|0,f+(C*80048|0)+80028|0,n,p+(s<<8)+72|0,B)|0)>=0):0){t=p+(s<<8)+8|0;u=p+(s<<8)+20|0;v=p+(s<<8)+40|0;w=p+(s<<8)+12|0;x=p+(s<<8)+24|0;y=p+(s<<8)+48|0;switch(De(k,l,m,a,b,d,e,n,B,o,t,u,v,w,x,y,r,p+(s<<8)+240|0,p+(s<<8)+248|0)|0){case 0:{c[p+(s<<8)+236>>2]=0;break}case -1:{c[p+(s<<8)+236>>2]=2;break}case -2:{c[p+(s<<8)+236>>2]=3;break}case -3:{c[p+(s<<8)+236>>2]=4;break}case -4:{c[p+(s<<8)+236>>2]=5;break}case -5:{c[p+(s<<8)+236>>2]=9;break}case -6:{c[p+(s<<8)+236>>2]=1;break}default:{}}if(!z){if(A){c[p+(s<<8)+4>>2]=c[w>>2];c[p+(s<<8)+16>>2]=c[x>>2];h[p+(s<<8)+32>>3]=+h[y>>3]}}else{c[p+(s<<8)+4>>2]=c[t>>2];c[p+(s<<8)+16>>2]=c[u>>2];h[p+(s<<8)+32>>3]=+h[v>>3]}s=s+1|0}C=C+1|0}while((C|0)<(j|0))}else s=0;c[q>>2]=s;i=F;return 0}function ke(a,b,d,e){a=a|0;b=b|0;d=+d;e=e|0;var f=0,g=0,j=0,k=0,l=0,m=0,n=0.0,o=0,p=0;k=i;i=i+288|0;m=k+200|0;l=k+104|0;f=k+264|0;j=k+8|0;g=k;o=c[b+16>>2]|0;p=(4-o|0)%4|0;h[m>>3]=+h[b+168+(p<<4)>>3];h[m+8>>3]=+h[b+168+(p<<4)+8>>3];p=(5-o|0)%4|0;h[m+16>>3]=+h[b+168+(p<<4)>>3];h[m+24>>3]=+h[b+168+(p<<4)+8>>3];p=(6-o|0)%4|0;h[m+32>>3]=+h[b+168+(p<<4)>>3];h[m+40>>3]=+h[b+168+(p<<4)+8>>3];o=(7-o|0)%4|0;h[m+48>>3]=+h[b+168+(o<<4)>>3];h[m+56>>3]=+h[b+168+(o<<4)+8>>3];n=d*-.5;h[l>>3]=n;d=d*.5;h[l+8>>3]=d;h[l+16>>3]=0.0;h[l+24>>3]=d;h[l+32>>3]=d;h[l+40>>3]=0.0;h[l+48>>3]=d;h[l+56>>3]=n;h[l+64>>3]=0.0;h[l+72>>3]=n;h[l+80>>3]=n;h[l+88>>3]=0.0;c[f>>2]=m;c[f+4>>2]=l;c[f+8>>2]=4;if((Ef(c[a>>2]|0,m,l,4,j)|0)<0)d=1.0e8;else{p=(zf(c[a>>2]|0,f,j,e,g)|0)<0;d=p?1.0e8:+h[g>>3]}i=k;return +d}function le(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=+e;f=f|0;var g=0,j=0,k=0,l=0,m=0,n=0.0,o=0,p=0;j=i;i=i+192|0;m=j+104|0;l=j+8|0;k=j+168|0;g=j;o=c[b+16>>2]|0;p=(4-o|0)%4|0;h[m>>3]=+h[b+168+(p<<4)>>3];h[m+8>>3]=+h[b+168+(p<<4)+8>>3];p=(5-o|0)%4|0;h[m+16>>3]=+h[b+168+(p<<4)>>3];h[m+24>>3]=+h[b+168+(p<<4)+8>>3];p=(6-o|0)%4|0;h[m+32>>3]=+h[b+168+(p<<4)>>3];h[m+40>>3]=+h[b+168+(p<<4)+8>>3];o=(7-o|0)%4|0;h[m+48>>3]=+h[b+168+(o<<4)>>3];h[m+56>>3]=+h[b+168+(o<<4)+8>>3];n=e*-.5;h[l>>3]=n;e=e*.5;h[l+8>>3]=e;h[l+16>>3]=0.0;h[l+24>>3]=e;h[l+32>>3]=e;h[l+40>>3]=0.0;h[l+48>>3]=e;h[l+56>>3]=n;h[l+64>>3]=0.0;h[l+72>>3]=n;h[l+80>>3]=n;h[l+88>>3]=0.0;c[k>>2]=m;c[k+4>>2]=l;c[k+8>>2]=4;b=(zf(c[a>>2]|0,k,d,f,g)|0)<0;i=j;return +(b?1.0e8:+h[g>>3])}function me(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0;p=i;i=i+32|0;m=p+20|0;n=p;j=Uj(f<<4)|0;c[m>>2]=j;if(!j){Me(3,5472,p+8|0);rb(1)}k=Uj(f*24|0)|0;l=m+4|0;c[l>>2]=k;if(!k){Me(3,5472,p+16|0);rb(1)}if((f|0)>0){o=0;do{h[j+(o<<4)>>3]=+h[d+(o<<4)>>3];h[j+(o<<4)+8>>3]=+h[d+(o<<4)+8>>3];h[k+(o*24|0)>>3]=+h[e+(o*24|0)>>3];h[k+(o*24|0)+8>>3]=+h[e+(o*24|0)+8>>3];h[k+(o*24|0)+16>>3]=+h[e+(o*24|0)+16>>3];o=o+1|0}while((o|0)<(f|0))}c[m+8>>2]=f;if((zf(c[a>>2]|0,m,b,g,n)|0)<0)h[n>>3]=1.0e8;Vj(c[m>>2]|0);Vj(c[l>>2]|0);i=p;return +(+h[n>>3])}function ne(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0;p=i;i=i+32|0;m=p+20|0;n=p;j=Uj(f<<4)|0;c[m>>2]=j;if(!j){Me(3,5472,p+8|0);rb(1)}k=Uj(f*24|0)|0;l=m+4|0;c[l>>2]=k;if(!k){Me(3,5472,p+16|0);rb(1)}if((f|0)>0){o=0;do{h[j+(o<<4)>>3]=+h[d+(o<<4)>>3];h[j+(o<<4)+8>>3]=+h[d+(o<<4)+8>>3];h[k+(o*24|0)>>3]=+h[e+(o*24|0)>>3];h[k+(o*24|0)+8>>3]=+h[e+(o*24|0)+8>>3];h[k+(o*24|0)+16>>3]=+h[e+(o*24|0)+16>>3];o=o+1|0}while((o|0)<(f|0))}c[m+8>>2]=f;if((Bf(c[a>>2]|0,m,b,g,n)|0)<0)h[n>>3]=1.0e8;Vj(c[m>>2]|0);Vj(c[l>>2]|0);i=p;return +(+h[n>>3])}function oe(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=Uj(2080)|0;a:do if(f){c[f+2068>>2]=d;b:do if(!e){switch(d|0){case 5:case 12:case 13:case 14:break;default:{g=4;break b}}c[f+2076>>2]=0}else g=4;while(0);do if((g|0)==4){g=Uj($(b,a)|0)|0;c[f>>2]=g;if(!g){Vj(f);f=0;break a}else{c[f+2076>>2]=1;break}}while(0);c[f+2072>>2]=e;c[f+4>>2]=0;c[f+8>>2]=a;c[f+12>>2]=b}while(0);return f|0}function pe(a){a=a|0;if(a){if(c[a+2076>>2]|0)Vj(c[a>>2]|0);Vj(c[a+4>>2]|0);Vj(a)}return}function qe(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;k=i;i=i+16|0;g=k;f=c[b+2068>>2]|0;a:do switch(f|0){case 5:case 12:case 13:case 14:if(!(c[b+2072>>2]|0)){c[b>>2]=e;f=0;break a}else{ik(c[b>>2]|0,e|0,$(c[b+12>>2]|0,c[b+8>>2]|0)|0)|0;f=0;break a}default:{if((f&-2|0)==2){f=b+8|0;g=b+12|0;if(!($(c[g>>2]|0,c[f>>2]|0)|0)){f=0;break a}else{h=0;j=0}while(1){a[(c[b>>2]|0)+h>>0]=(((d[e+(j|1)>>0]|0)+(d[e+j>>0]|0)+(d[e+(j|2)>>0]|0)|0)>>>0)/3|0;h=h+1|0;if(h>>>0>=($(c[g>>2]|0,c[f>>2]|0)|0)>>>0){f=0;break a}else j=j+4|0}}if((f&-3|0)==4){f=b+8|0;g=b+12|0;if(!($(c[g>>2]|0,c[f>>2]|0)|0)){f=0;break a}else{h=0;j=0}while(1){a[(c[b>>2]|0)+h>>0]=(((d[e+(j|2)>>0]|0)+(d[e+(j|1)>>0]|0)+(d[e+(j|3)>>0]|0)|0)>>>0)/3|0;h=h+1|0;if(h>>>0>=($(c[g>>2]|0,c[f>>2]|0)|0)>>>0){f=0;break a}else j=j+4|0}}if(f>>>0<2){f=b+8|0;g=b+12|0;if(!($(c[g>>2]|0,c[f>>2]|0)|0)){f=0;break a}else{h=0;j=0}while(1){a[(c[b>>2]|0)+h>>0]=(((d[e+(j+1)>>0]|0)+(d[e+j>>0]|0)+(d[e+(j+2)>>0]|0)|0)>>>0)/3|0;h=h+1|0;if(h>>>0>=($(c[g>>2]|0,c[f>>2]|0)|0)>>>0){f=0;break a}else j=j+3|0}}switch(f|0){case 8:{f=b+8|0;g=b+12|0;if(!($(c[g>>2]|0,c[f>>2]|0)|0)){f=0;break a}else{h=0;j=0}while(1){a[(c[b>>2]|0)+h>>0]=a[e+j>>0]|0;h=h+1|0;if(h>>>0>=($(c[g>>2]|0,c[f>>2]|0)|0)>>>0){f=0;break}else j=j+2|0}break}case 7:{f=b+8|0;g=b+12|0;if(!($(c[g>>2]|0,c[f>>2]|0)|0)){f=0;break a}else{h=0;j=0}while(1){a[(c[b>>2]|0)+h>>0]=a[e+(j|1)>>0]|0;h=h+1|0;if(h>>>0>=($(c[g>>2]|0,c[f>>2]|0)|0)>>>0){f=0;break}else j=j+2|0}break}case 9:{f=b+8|0;g=b+12|0;if(!($(c[g>>2]|0,c[f>>2]|0)|0)){f=0;break a}else{h=0;j=0}while(1){m=d[e+j>>0]|0;l=d[e+(j|1)>>0]|0;a[(c[b>>2]|0)+h>>0]=(((m&248)+10+(m<<5&224)+(l>>>3&28)+(l<<3&248)|0)>>>0)/3|0;h=h+1|0;if(h>>>0>=($(c[g>>2]|0,c[f>>2]|0)|0)>>>0){f=0;break}else j=j+2|0}break}case 10:{f=b+8|0;g=b+12|0;if(!($(c[g>>2]|0,c[f>>2]|0)|0)){f=0;break a}else{h=0;j=0}while(1){l=d[e+j>>0]|0;m=d[e+(j|1)>>0]|0;a[(c[b>>2]|0)+h>>0]=(((l&248)+12+(l<<5&224)+(m>>>3&24)+(m<<2&248)|0)>>>0)/3|0;h=h+1|0;if(h>>>0>=($(c[g>>2]|0,c[f>>2]|0)|0)>>>0){f=0;break}else j=j+2|0}break}case 11:{f=b+8|0;g=b+12|0;if(!($(c[g>>2]|0,c[f>>2]|0)|0)){f=0;break a}else{h=0;j=0}while(1){m=d[e+j>>0]|0;a[(c[b>>2]|0)+h>>0]=(((m&240)+24+(m<<4&240)+((d[e+(j|1)>>0]|0)&240)|0)>>>0)/3|0;h=h+1|0;if(h>>>0>=($(c[g>>2]|0,c[f>>2]|0)|0)>>>0){f=0;break}else j=j+2|0}break}default:{Me(3,4361,g);f=-1;break a}}}}while(0);i=k;return f|0}function re(a,b){a=a|0;b=b|0;var e=0,f=0;if((a|0)!=0&(b|0)!=0?(qe(a,b)|0)>=0:0){ek(a+16|0,0,1024)|0;b=c[a>>2]|0;f=$(c[a+12>>2]|0,c[a+8>>2]|0)|0;e=b+f|0;if((f|0)>0){do{f=a+16+((d[b>>0]|0)<<2)|0;c[f>>2]=(c[f>>2]|0)+1;b=b+1|0}while(b>>>0<e>>>0);b=0}else b=0}else b=-1;return b|0}function se(a,b){a=a|0;b=b|0;var d=0;b=re(a,b)|0;if((b|0)>=0){b=0;d=0;do{b=(c[a+16+(d<<2)>>2]|0)+b|0;c[a+1040+(d<<2)>>2]=b;d=d+1|0}while((d|0)!=256);b=0}return b|0}function te(b,d,e,f){b=b|0;d=d|0;e=+e;f=f|0;var g=0,h=0,i=0;if(!(e<0.0|e>1.0)){d=se(b,d)|0;if((d|0)>=0){i=~~(+($(c[b+12>>2]|0,c[b+8>>2]|0)|0)*e)>>>0;d=0;while(1){h=d&255;g=c[b+1040+(h<<2)>>2]|0;if(g>>>0<i>>>0)d=d+1<<24>>24;else break}if((g|0)==(i|0))do d=d+1<<24>>24;while((c[b+1040+((d&255)<<2)>>2]|0)==(i|0));a[f>>0]=((d&255)+h|0)>>>1;d=0}}else d=-1;return d|0}function ue(a,b,c){a=a|0;b=b|0;c=c|0;return te(a,b,.5,c)|0}function ve(b,d,e){b=b|0;d=d|0;e=e|0;var f=0.0,g=0,h=0.0,i=0.0,j=0.0,k=0.0,l=0,m=0.0,n=0.0;d=re(b,d)|0;if((d|0)>=0){d=1;f=0.0;do{f=f+ +(($(c[b+16+(d<<2)>>2]|0,d)|0)>>>0);d=d+1|0}while((d|0)!=256);k=+($(c[b+12>>2]|0,c[b+8>>2]|0)|0);l=0;h=0.0;d=0;j=0.0;m=0.0;while(1){g=c[b+16+(l<<2)>>2]|0;m=m+ +(g>>>0);if(m!=0.0){i=k-m;if(i==0.0)break;h=h+ +(($(l,g)|0)>>>0);n=h/m-(f-h)/i;i=n*(m*i*n);if(i>j)d=l&255;else i=j}else i=j;if((l&255)<<24>>24==-1)break;else{l=l+1|0;j=i}}a[e>>0]=d;d=0}return d|0}function we(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;e=re(b,e)|0;do if((e|0)>=0){t=b+4|0;if(!(c[t>>2]|0)){e=b+8|0;h=b+12|0;s=Uj($(c[h>>2]|0,c[e>>2]|0)|0)|0;c[t>>2]=s;if(!s){e=-1;break}else s=e}else{s=b+8|0;h=b+12|0}q=f>>1;r=0-q|0;e=c[h>>2]|0;if((e|0)>0){n=(q|0)<(r|0);o=(q|0)<(r|0);p=0;do{e=c[s>>2]|0;if((e|0)>0){m=0;do{if(n){i=0;f=0}else{i=0;l=r;f=0;while(1){j=l+p|0;if(((j|0)>=0?(j|0)<(c[h>>2]|0):0)?(u=$(e,j)|0,!o):0){k=r;while(1){j=k+m|0;if((j|0)>-1&(j|0)<(e|0)){i=i+1|0;f=(d[(c[b>>2]|0)+(u+j)>>0]|0)+f|0}if((k|0)<(q|0))k=k+1|0;else break}}if((l|0)<(q|0))l=l+1|0;else break}}l=($(e,p)|0)+m|0;a[(c[t>>2]|0)+l>>0]=(f|0)/(i|0)|0;m=m+1|0;e=c[s>>2]|0}while((m|0)<(e|0))}p=p+1|0;e=c[h>>2]|0}while((p|0)<(e|0))}if((g|0)!=0?($(e,c[s>>2]|0)|0)>0:0){e=0;do{b=(c[t>>2]|0)+e|0;a[b>>0]=(d[b>>0]|0)+g;e=e+1|0}while((e|0)<($(c[h>>2]|0,c[s>>2]|0)|0));e=0}else e=0}while(0);return e|0}function xe(a,b,c,d,e,f,g,h,i,j){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;j=j|0;var k=0;a:do switch(e|0){case 0:{switch(f|0){case 1:{if(j){k=Fc(a,b,c,j,i)|0;break a}switch(h|0){case 0:{if(d>>>0<2){k=wc(a,b,c,g,i)|0;break a}if((d&-2|0)==2){k=yc(a,b,c,g,i)|0;break a}if((d&-3|0)==4){k=Bc(a,b,c,g,i)|0;break a}switch(d|0){case 5:case 12:case 13:case 14:{k=Cc(a,b,c,g,i)|0;break a}case 8:{k=Ec(a,b,c,g,i)|0;break a}case 7:{k=Dc(a,b,c,g,i)|0;break a}case 9:{k=xc(a,b,c,g,i)|0;break a}case 10:{k=Ac(a,b,c,g,i)|0;break a}case 11:{k=zc(a,b,c,g,i)|0;break a}default:rb(0)}break}case 1:{if(d>>>0<2){k=nc(a,b,c,g,i)|0;break a}if((d&-2|0)==2){k=pc(a,b,c,g,i)|0;break a}if((d&-3|0)==4){k=sc(a,b,c,g,i)|0;break a}switch(d|0){case 5:case 12:case 13:case 14:{k=tc(a,b,c,g,i)|0;break a}case 8:{k=vc(a,b,c,g,i)|0;break a}case 7:{k=uc(a,b,c,g,i)|0;break a}case 9:{k=oc(a,b,c,g,i)|0;break a}case 10:{k=rc(a,b,c,g,i)|0;break a}case 11:{k=qc(a,b,c,g,i)|0;break a}default:rb(0)}break}default:rb(0)}break}case 0:{if(j){k=Yc(a,b,c,j,i)|0;break a}switch(h|0){case 0:{if(d>>>0<2){k=Pc(a,b,c,g,i)|0;break a}if((d&-2|0)==2){k=Rc(a,b,c,g,i)|0;break a}if((d&-3|0)==4){k=Uc(a,b,c,g,i)|0;break a}switch(d|0){case 5:case 12:case 13:case 14:{k=Vc(a,b,c,g,i)|0;break a}case 8:{k=Xc(a,b,c,g,i)|0;break a}case 7:{k=Wc(a,b,c,g,i)|0;break a}case 9:{k=Qc(a,b,c,g,i)|0;break a}case 10:{k=Tc(a,b,c,g,i)|0;break a}case 11:{k=Sc(a,b,c,g,i)|0;break a}default:rb(0)}break}case 1:{if(d>>>0<2){k=Gc(a,b,c,g,i)|0;break a}if((d&-2|0)==2){k=Ic(a,b,c,g,i)|0;break a}if((d&-3|0)==4){k=Lc(a,b,c,g,i)|0;break a}switch(d|0){case 5:case 12:case 13:case 14:{k=Mc(a,b,c,g,i)|0;break a}case 8:{k=Oc(a,b,c,g,i)|0;break a}case 7:{k=Nc(a,b,c,g,i)|0;break a}case 9:{k=Hc(a,b,c,g,i)|0;break a}case 10:{k=Kc(a,b,c,g,i)|0;break a}case 11:{k=Jc(a,b,c,g,i)|0;break a}default:rb(0)}break}default:rb(0)}break}default:rb(0)}break}case 1:{switch(f|0){case 1:{if(j){k=pd(a,b,c,j,i)|0;break a}switch(h|0){case 0:{if(d>>>0<2){k=gd(a,b,c,g,i)|0;break a}if((d&-2|0)==2){k=id(a,b,c,g,i)|0;break a}if((d&-3|0)==4){k=ld(a,b,c,g,i)|0;break a}switch(d|0){case 5:case 12:case 13:case 14:{k=md(a,b,c,g,i)|0;break a}case 8:{k=od(a,b,c,g,i)|0;break a}case 7:{k=nd(a,b,c,g,i)|0;break a}case 9:{k=hd(a,b,c,g,i)|0;break a}case 10:{k=kd(a,b,c,g,i)|0;break a}case 11:{k=jd(a,b,c,g,i)|0;break a}default:rb(0)}break}case 1:{if(d>>>0<2){k=Zc(a,b,c,g,i)|0;break a}if((d&-2|0)==2){k=$c(a,b,c,g,i)|0;break a}if((d&-3|0)==4){k=cd(a,b,c,g,i)|0;break a}switch(d|0){case 5:case 12:case 13:case 14:{k=dd(a,b,c,g,i)|0;break a}case 8:{k=fd(a,b,c,g,i)|0;break a}case 7:{k=ed(a,b,c,g,i)|0;break a}case 9:{k=_c(a,b,c,g,i)|0;break a}case 10:{k=bd(a,b,c,g,i)|0;break a}case 11:{k=ad(a,b,c,g,i)|0;break a}default:rb(0)}break}default:rb(0)}break}case 0:{if(j){k=Id(a,b,c,j,i)|0;break a}switch(h|0){case 0:{if(d>>>0<2){k=zd(a,b,c,g,i)|0;break a}if((d&-2|0)==2){k=Bd(a,b,c,g,i)|0;break a}if((d&-3|0)==4){k=Ed(a,b,c,g,i)|0;break a}switch(d|0){case 5:case 12:case 13:case 14:{k=Fd(a,b,c,g,i)|0;break a}case 8:{k=Hd(a,b,c,g,i)|0;break a}case 7:{k=Gd(a,b,c,g,i)|0;break a}case 9:{k=Ad(a,b,c,g,i)|0;break a}case 10:{k=Dd(a,b,c,g,i)|0;break a}case 11:{k=Cd(a,b,c,g,i)|0;break a}default:rb(0)}break}case 1:{if(d>>>0<2){k=qd(a,b,c,g,i)|0;break a}if((d&-2|0)==2){k=sd(a,b,c,g,i)|0;break a}if((d&-3|0)==4){k=vd(a,b,c,g,i)|0;break a}switch(d|0){case 5:case 12:case 13:case 14:{k=wd(a,b,c,g,i)|0;break a}case 8:{k=yd(a,b,c,g,i)|0;break a}case 7:{k=xd(a,b,c,g,i)|0;break a}case 9:{k=rd(a,b,c,g,i)|0;break a}case 10:{k=ud(a,b,c,g,i)|0;break a}case 11:{k=td(a,b,c,g,i)|0;break a}default:rb(0)}break}default:rb(0)}break}default:rb(0)}break}default:rb(0)}while(0);return k|0}function ye(a,b){a=a|0;b=b|0;var d=0;if((a|0)!=0?(d=a+7062384|0,(c[d>>2]|0)==0):0){c[d>>2]=b;d=0}else d=-1;return d|0}function ze(a){a=a|0;var b=0;if((a|0)!=0?(b=a+7062384|0,(c[b>>2]|0)!=0):0){c[b>>2]=0;b=0}else b=-1;return b|0}function Ae(){return Be(16,50)|0}function Be(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;r=i;i=i+64|0;q=r+56|0;p=r+48|0;j=r+40|0;h=r+32|0;g=r+24|0;f=r+16|0;e=r+8|0;d=r;a:do if(!((a+-16|0)>>>0>48|(b|0)<1)){n=Uj(32)|0;if(!n){Me(3,5472,d);rb(1)}c[n>>2]=0;c[n+4>>2]=b;c[n+28>>2]=a;m=Uj(b<<2)|0;c[n+8>>2]=m;if(!m){Me(3,5472,e);rb(1)}d=b<<4;l=Uj(d)|0;c[n+12>>2]=l;if(!l){Me(3,5472,f);rb(1)}f=Uj(d)|0;k=n+20|0;c[k>>2]=f;if(!f){Me(3,5472,g);rb(1)}d=b<<5;g=Uj(d)|0;c[n+16>>2]=g;if(!g){Me(3,5472,h);rb(1)}h=Uj(d)|0;c[n+24>>2]=h;if(!h){Me(3,5472,j);rb(1)}e=$(a,a)|0;d=e*12|0;e=e<<2;if((b|0)>0){a=0;b:while(1){c[m+(a<<2)>>2]=0;f=a<<2;h=0;while(1){if((h|0)>=4)break;j=Uj(d)|0;g=h+f|0;c[l+(g<<2)>>2]=j;if(!j){d=18;break b}j=Uj(e)|0;c[(c[k>>2]|0)+(g<<2)>>2]=j;if(!j){d=20;break b}else h=h+1|0}a=a+1|0;if((a|0)>=(b|0)){o=n;break a}}if((d|0)==18){Me(3,5472,p);rb(1)}else if((d|0)==20){Me(3,5472,q);rb(1)}}else o=n}else o=0;while(0);i=r;return o|0}function Ce(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0;if(!a)b=-1;else{b=a+4|0;d=a+8|0;e=a+12|0;f=a+20|0;if((c[b>>2]|0)>0){g=0;do{if(c[(c[d>>2]|0)+(g<<2)>>2]|0)Le(a,g)|0;h=g<<2;Vj(c[(c[e>>2]|0)+(h<<2)>>2]|0);Vj(c[(c[f>>2]|0)+(h<<2)>>2]|0);i=1+h|0;Vj(c[(c[e>>2]|0)+(i<<2)>>2]|0);Vj(c[(c[f>>2]|0)+(i<<2)>>2]|0);i=2+h|0;Vj(c[(c[e>>2]|0)+(i<<2)>>2]|0);Vj(c[(c[f>>2]|0)+(i<<2)>>2]|0);h=3+h|0;Vj(c[(c[e>>2]|0)+(h<<2)>>2]|0);Vj(c[(c[f>>2]|0)+(h<<2)>>2]|0);g=g+1|0}while((g|0)<(c[b>>2]|0))}Vj(a);b=0}return b|0}function De(b,e,f,g,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x){b=b|0;e=e|0;f=f|0;g=g|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=+o;p=p|0;q=q|0;r=r|0;s=s|0;t=t|0;u=u|0;v=v|0;w=w|0;x=x|0;var y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;L=i;i=i+12448|0;A=L+12440|0;z=L+8|0;J=L;I=L+12312|0;K=L+24|0;do if((f+-2|0)>>>0<3){if((v|0)!=2830){y=v&255;if((Ee(e,2,y,y*3|0,g,j,k,l,m,n,o,K)|0)<0){c[s>>2]=-1;y=-6;break}y=Fe(K,y,s,t,u,v,w)|0;if(!x)break;c[x>>2]=0;c[x+4>>2]=0;break}if((Ee(e,2,14,42,g,j,k,l,m,n,.875,K)|0)<0){c[s>>2]=-1;y=-6;break}c[z>>2]=0;c[z+4>>2]=182;c[z+8>>2]=195;c[z+12>>2]=13;v=a[K+(c[z>>2]|0)>>0]|0;y=(v&255)>0?v:0;v=(v&255)<255?v:-1;H=a[K+(c[z+4>>2]|0)>>0]|0;y=(H&255)>(y&255)?H:y;v=(H&255)<(v&255)?H:v;H=a[K+(c[z+8>>2]|0)>>0]|0;y=(H&255)>(y&255)?H:y;v=(H&255)<(v&255)?H:v;H=a[K+(c[z+12>>2]|0)>>0]|0;y=((H&255)>(y&255)?H:y)&255;v=((H&255)<(v&255)?H:v)&255;a:do if((y-v|0)>=30){H=(y+v|0)>>>1;a[A>>0]=(d[K+(c[z>>2]|0)>>0]|0)>>>0<H>>>0&1;a[A+1>>0]=(d[K+(c[z+4>>2]|0)>>0]|0)>>>0<H>>>0&1;a[A+2>>0]=(d[K+(c[z+8>>2]|0)>>0]|0)>>>0<H>>>0&1;a[A+3>>0]=(d[K+(c[z+12>>2]|0)>>0]|0)>>>0<H>>>0&1;v=0;while(1){y=v+1|0;if(((a[A+v>>0]|0)==1?(a[A+((y|0)%4|0)>>0]|0)==1:0)?(a[A+((v+2|0)%4|0)>>0]|0)==0:0){G=v;break}if((y|0)<4)v=y;else{G=y;break}}switch(G|0){case 4:{c[t>>2]=0;h[u>>3]=-1.0;y=-3;v=0;z=0;break a}case 0:{z=119;y=255;v=0;do{D=v+-3|0;B=(v&-2|0)==12;C=v*14|0;A=0;do{if(((A+-3|D)>>>0>=8?(F=A&-2,(A|v)>>>0>=2):0)?!(B&((F|0)==0|(F|0)==12)):0){E=(d[K+(A+C)>>0]|0)-H|0;a[I+z>>0]=E>>>31;E=(E|0)>-1?E:0-E|0;z=z+-1|0;y=(E|0)<(y|0)?E:y}A=A+1|0}while((A|0)!=14);v=v+1|0}while((v|0)!=14);break}case 1:{z=119;y=255;v=0;do{D=v+-3|0;C=v&-2;B=(C|0)==0;C=(C|0)==12;A=13;while(1){if(((A+-3|D)>>>0>=8?(E=(A&-2|0)==12,!(B&E)):0)?!(C&(A>>>0<2|E)):0){F=(d[K+((A*14|0)+v)>>0]|0)-H|0;a[I+z>>0]=F>>>31;F=(F|0)>-1?F:0-F|0;z=z+-1|0;y=(F|0)<(y|0)?F:y}if((A|0)>0)A=A+-1|0;else break}v=v+1|0}while((v|0)!=14);break}case 2:{v=119;y=255;D=13;while(1){B=D+-3|0;C=D>>>0<2|(D&-2|0)==12;A=D*14|0;z=13;while(1){if((z+-3|B)>>>0>=8?!((z|D)>>>0<2|C&(z&-2|0)==12):0){F=(d[K+(z+A)>>0]|0)-H|0;a[I+v>>0]=F>>>31;F=(F|0)>-1?F:0-F|0;v=v+-1|0;y=(F|0)<(y|0)?F:y}if((z|0)>0)z=z+-1|0;else break}if((D|0)>0)D=D+-1|0;else break}break}case 3:{v=119;y=255;D=13;while(1){C=D+-3|0;B=D&-2;A=(B|0)==12;B=(B|0)==0;z=0;do{if(((z+-3|C)>>>0>=8?!(A&z>>>0<2|(z|D)>>>0<2):0)?!(B&(z&-2|0)==12):0){F=(d[K+((z*14|0)+D)>>0]|0)-H|0;a[I+v>>0]=F>>>31;F=(F|0)>-1?F:0-F|0;v=v+-1|0;y=(F|0)<(y|0)?F:y}z=z+1|0}while((z|0)!=14);if((D|0)>0)D=D+-1|0;else break}break}default:y=255}c[t>>2]=G;h[u>>3]=(y|0)>30?1.0:+(y|0)/30.0;y=Ie(2830,0,0,I,J)|0;if((y|0)<0){y=-4;v=0;z=0}else{if(w)c[w>>2]=y;z=J;y=0;v=c[z>>2]|0;z=c[z+4>>2]|0}}else{c[t>>2]=0;h[u>>3]=-1.0;y=-2;v=0;z=0}while(0);if((y|0)<0){c[s>>2]=-1;break}if((v|0)==-1&(z|0)==-1){c[s>>2]=-1;y=-5;break}c[s>>2]=(v&-32768|0)==0&0==0?v&32767:0;if(!x)y=0;else{y=x;c[y>>2]=v;c[y+4>>2]=z;y=0}}else y=1;while(0);b:do switch(f|0){case 0:case 1:case 3:case 4:{if(!b){c[p>>2]=-1;v=-1;break b}v=b+28|0;z=c[v>>2]|0;A=z<<2;switch(f|0){case 0:case 3:if((Ee(e,0,z,A,g,j,k,l,m,n,o,K)|0)<0){c[p>>2]=-1;v=-6;break b}else{v=Ge(b,0,K,c[v>>2]|0,p,q,r)|0;break b}default:if((Ee(e,1,z,A,g,j,k,l,m,n,o,K)|0)<0){c[p>>2]=-1;v=-6;break b}else{v=Ge(b,1,K,c[v>>2]|0,p,q,r)|0;break b}}}default:v=1}while(0);if((y|0)!=1){if((v|0)!=1)y=(v&y|0)<0?v:0}else y=v;i=L;return y|0}
function _j(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0;k=i;i=i+16|0;b=k+8|0;h=k+4|0;d=k;c[h>>2]=a;do if(a>>>0>=212){g=(a>>>0)/210|0;e=g*210|0;c[d>>2]=a-e;b=($j(3712,3904,d,b)|0)-3712>>2;f=b;b=(c[3712+(b<<2)>>2]|0)+e|0;a:while(1){e=5;while(1){if(e>>>0>=47){e=211;j=8;break}d=c[3520+(e<<2)>>2]|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=106;break a}if((b|0)==($(a,d)|0))break;else e=e+1|0}b:do if((j|0)==8)while(1){j=0;d=(b>>>0)/(e>>>0)|0;if(d>>>0<e>>>0){j=105;break a}if((b|0)==($(d,e)|0))break b;d=e+10|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+12|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+16|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+18|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+22|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+28|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+30|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+36|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+40|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+42|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+46|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+52|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+58|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+60|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+66|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+70|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+72|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+78|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+82|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+88|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+96|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+100|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+102|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+106|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+108|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+112|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+120|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+126|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+130|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+136|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+138|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+142|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+148|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+150|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+156|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+162|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+166|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+168|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+172|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+178|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+180|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+186|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+190|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+192|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+196|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+198|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break b;d=e+208|0;a=(b>>>0)/(d>>>0)|0;if(a>>>0<d>>>0){j=105;break a}if((b|0)==($(a,d)|0))break;else{e=e+210|0;j=8}}while(0);e=f+1|0;b=(e|0)==48;e=b?0:e;b=(b&1)+g|0;f=e;g=b;b=(c[3712+(e<<2)>>2]|0)+(b*210|0)|0}if((j|0)==105){c[h>>2]=b;break}else if((j|0)==106){c[h>>2]=b;break}}else b=c[($j(3520,3712,h,b)|0)>>2]|0;while(0);i=k;return b|0}function $j(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;f=c[d>>2]|0;e=a;d=b-a>>2;a:while(1){while(1){if(!d)break a;a=(d|0)/2|0;if((c[e+(a<<2)>>2]|0)>>>0<f>>>0)break;else d=a}e=e+(a+1<<2)|0;d=d+-1-a|0}return e|0}function ak(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0;if(e>>>0>4294967279)oi(b);if(e>>>0<11){a[b>>0]=e<<1;b=b+1|0}else{g=e+16&-16;f=Kh(g)|0;c[b+8>>2]=f;c[b>>2]=g|1;c[b+4>>2]=e;b=f}ik(b|0,d|0,e|0)|0;a[b+e>>0]=0;return}function bk(b){b=b|0;if(a[b>>0]&1)Lh(c[b+8>>2]|0);return}function ck(){}function dk(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;d=b-d-(c>>>0>a>>>0|0)>>>0;return (D=d,a-c>>>0|0)|0}function ek(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b+e|0;if((e|0)>=20){d=d&255;h=b&3;i=d|d<<8|d<<16|d<<24;g=f&~3;if(h){h=b+4-h|0;while((b|0)<(h|0)){a[b>>0]=d;b=b+1|0}}while((b|0)<(g|0)){c[b>>2]=i;b=b+4|0}}while((b|0)<(f|0)){a[b>>0]=d;b=b+1|0}return b-e|0}function fk(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){D=b<<c|(a&(1<<c)-1<<32-c)>>>32-c;return a<<c}D=a<<c-32;return 0}function gk(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;c=a+c>>>0;return (D=b+d+(c>>>0<a>>>0|0)>>>0,c|0)|0}function hk(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){D=b>>>c;return a>>>c|(b&(1<<c)-1)<<32-c}D=0;return b>>>c-32|0}function ik(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((e|0)>=4096)return Xa(b|0,d|0,e|0)|0;f=b|0;if((b&3)==(d&3)){while(b&3){if(!e)return f|0;a[b>>0]=a[d>>0]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b>>0]=a[d>>0]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function jk(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){D=b>>c;return a>>>c|(b&(1<<c)-1)<<32-c}D=(b|0)<0?-1:0;return b>>c-32|0}function kk(b){b=b|0;var c=0;c=a[m+(b&255)>>0]|0;if((c|0)<8)return c|0;c=a[m+(b>>8&255)>>0]|0;if((c|0)<8)return c+8|0;c=a[m+(b>>16&255)>>0]|0;if((c|0)<8)return c+16|0;return (a[m+(b>>>24)>>0]|0)+24|0}function lk(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0;f=a&65535;e=b&65535;c=$(e,f)|0;d=a>>>16;a=(c>>>16)+($(e,d)|0)|0;e=b>>>16;b=$(e,f)|0;return (D=(a>>>16)+($(e,d)|0)+(((a&65535)+b|0)>>>16)|0,a+b<<16|c&65535|0)|0}function mk(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0;j=b>>31|((b|0)<0?-1:0)<<1;i=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;f=d>>31|((d|0)<0?-1:0)<<1;e=((d|0)<0?-1:0)>>31|((d|0)<0?-1:0)<<1;h=dk(j^a,i^b,j,i)|0;g=D;a=f^j;b=e^i;return dk((rk(h,g,dk(f^c,e^d,f,e)|0,D,0)|0)^a,D^b,a,b)|0}function nk(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;f=i;i=i+16|0;j=f|0;h=b>>31|((b|0)<0?-1:0)<<1;g=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;l=e>>31|((e|0)<0?-1:0)<<1;k=((e|0)<0?-1:0)>>31|((e|0)<0?-1:0)<<1;a=dk(h^a,g^b,h,g)|0;b=D;rk(a,b,dk(l^d,k^e,l,k)|0,D,j)|0;e=dk(c[j>>2]^h,c[j+4>>2]^g,h,g)|0;d=D;i=f;return (D=d,e)|0}function ok(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=a;f=c;c=lk(e,f)|0;a=D;return (D=($(b,f)|0)+($(d,e)|0)+a|a&0,c|0|0)|0}function pk(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return rk(a,b,c,d,0)|0}function qk(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;g=i;i=i+16|0;f=g|0;rk(a,b,d,e,f)|0;i=g;return (D=c[f+4>>2]|0,c[f>>2]|0)|0}function rk(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;l=a;j=b;k=j;h=d;n=e;i=n;if(!k){g=(f|0)!=0;if(!i){if(g){c[f>>2]=(l>>>0)%(h>>>0);c[f+4>>2]=0}n=0;f=(l>>>0)/(h>>>0)>>>0;return (D=n,f)|0}else{if(!g){n=0;f=0;return (D=n,f)|0}c[f>>2]=a|0;c[f+4>>2]=b&0;n=0;f=0;return (D=n,f)|0}}g=(i|0)==0;do if(h){if(!g){g=(ba(i|0)|0)-(ba(k|0)|0)|0;if(g>>>0<=31){m=g+1|0;i=31-g|0;b=g-31>>31;h=m;a=l>>>(m>>>0)&b|k<<i;b=k>>>(m>>>0)&b;g=0;i=l<<i;break}if(!f){n=0;f=0;return (D=n,f)|0}c[f>>2]=a|0;c[f+4>>2]=j|b&0;n=0;f=0;return (D=n,f)|0}g=h-1|0;if(g&h){i=(ba(h|0)|0)+33-(ba(k|0)|0)|0;p=64-i|0;m=32-i|0;j=m>>31;o=i-32|0;b=o>>31;h=i;a=m-1>>31&k>>>(o>>>0)|(k<<m|l>>>(i>>>0))&b;b=b&k>>>(i>>>0);g=l<<p&j;i=(k<<p|l>>>(o>>>0))&j|l<<m&i-33>>31;break}if(f){c[f>>2]=g&l;c[f+4>>2]=0}if((h|0)==1){o=j|b&0;p=a|0|0;return (D=o,p)|0}else{p=kk(h|0)|0;o=k>>>(p>>>0)|0;p=k<<32-p|l>>>(p>>>0)|0;return (D=o,p)|0}}else{if(g){if(f){c[f>>2]=(k>>>0)%(h>>>0);c[f+4>>2]=0}o=0;p=(k>>>0)/(h>>>0)>>>0;return (D=o,p)|0}if(!l){if(f){c[f>>2]=0;c[f+4>>2]=(k>>>0)%(i>>>0)}o=0;p=(k>>>0)/(i>>>0)>>>0;return (D=o,p)|0}g=i-1|0;if(!(g&i)){if(f){c[f>>2]=a|0;c[f+4>>2]=g&k|b&0}o=0;p=k>>>((kk(i|0)|0)>>>0);return (D=o,p)|0}g=(ba(i|0)|0)-(ba(k|0)|0)|0;if(g>>>0<=30){b=g+1|0;i=31-g|0;h=b;a=k<<i|l>>>(b>>>0);b=k>>>(b>>>0);g=0;i=l<<i;break}if(!f){o=0;p=0;return (D=o,p)|0}c[f>>2]=a|0;c[f+4>>2]=j|b&0;o=0;p=0;return (D=o,p)|0}while(0);if(!h){k=i;j=0;i=0}else{m=d|0|0;l=n|e&0;k=gk(m|0,l|0,-1,-1)|0;d=D;j=i;i=0;do{e=j;j=g>>>31|j<<1;g=i|g<<1;e=a<<1|e>>>31|0;n=a>>>31|b<<1|0;dk(k,d,e,n)|0;p=D;o=p>>31|((p|0)<0?-1:0)<<1;i=o&1;a=dk(e,n,o&m,(((p|0)<0?-1:0)>>31|((p|0)<0?-1:0)<<1)&l)|0;b=D;h=h-1|0}while((h|0)!=0);k=j;j=0}h=0;if(f){c[f>>2]=a;c[f+4>>2]=b}o=(g|0)>>>31|(k|h)<<1|(h<<1|g>>>31)&0|j;p=(g<<1|0>>>31)&-2|i;return (D=o,p)|0}function sk(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return Qb[a&15](b|0,c|0,d|0)|0}function tk(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;Rb[a&3](b|0,c|0,d|0,e|0,f|0)}function uk(a,b,c){a=a|0;b=b|0;c=c|0;return +Sb[a&1](b|0,c|0)}function vk(a,b,c){a=a|0;b=b|0;c=+c;Tb[a&3](b|0,+c)}function wk(a,b){a=a|0;b=b|0;return +Ub[a&3](b|0)}function xk(a){a=a|0;return Vb[a&1]()|0}function yk(a,b){a=a|0;b=b|0;Wb[a&15](b|0)}function zk(a,b,c){a=a|0;b=b|0;c=c|0;Xb[a&7](b|0,c|0)}function Ak(a,b){a=a|0;b=b|0;return Yb[a&31](b|0)|0}function Bk(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;Zb[a&1](b|0,c|0,d|0)}function Ck(a){a=a|0;_b[a&0]()}function Dk(a,b,c,d){a=a|0;b=b|0;c=c|0;d=+d;$b[a&3](b|0,c|0,+d)}function Ek(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ac[a&1](b|0,c|0,d|0,e|0)|0}function Fk(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;bc[a&3](b|0,c|0,d|0,e|0,f|0,g|0)}function Gk(a,b,c){a=a|0;b=b|0;c=c|0;return cc[a&15](b|0,c|0)|0}function Hk(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;dc[a&3](b|0,c|0,d|0,e|0)}function Ik(a,b,c){a=a|0;b=b|0;c=c|0;ca(0);return 0}function Jk(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ca(1)}function Kk(a,b){a=a|0;b=b|0;ca(2);return 0.0}function Lk(a,b){a=a|0;b=+b;ca(3)}function Mk(a){a=a|0;ca(4);return 0.0}function Nk(){ca(5);return 0}function Ok(a){a=a|0;ca(6)}function Pk(a,b){a=a|0;b=b|0;ca(7)}function Qk(a){a=a|0;ca(8);return 0}function Rk(a,b,c){a=a|0;b=b|0;c=c|0;ca(9)}function Sk(){ca(10)}function Tk(a,b,c){a=a|0;b=b|0;c=+c;ca(11)}function Uk(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ca(12);return 0}function Vk(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ca(13)}function Wk(a,b){a=a|0;b=b|0;ca(14);return 0}function Xk(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ca(15)}

// EMSCRIPTEN_END_FUNCS
var Qb=[Ik,Zh,_h,Qj,Qi,Pi,Ri,Ag,sg,qg,rg,yg,kh,jh,Oi,Mj];var Rb=[Jk,ki,ji,gi];var Sb=[Kk,dh];var Tb=[Lk,Wf,Yf,ag];var Ub=[Mk,Xf,Zf,bg];var Vb=[Nk,Nf];var Wb=[Ok,Mh,Nh,Sh,Vh,Th,Uh,Wh,Xh,Yh,Mf,Xg,Yg,Ij,Jj,Ok];var Xb=[Pk,ig,gg,_f,cg,eg,ng,gh];var Yb=[Qk,Oh,Ni,Pf,Vf,Qf,wg,xg,mg,lg,jg,hg,$f,dg,fg,og,fh,Qk,Qk,Qk,Qk,Qk,Qk,Qk,Qk,Qk,Qk,Qk,Qk,Qk,Qk,Qk];var Zb=[Rk,ch];var _b=[Sk];var $b=[Tk,eh,bh,Tk];var ac=[Uk,mh];var bc=[Vk,ni,mi,li];var cc=[Wk,Df,Sf,Tf,Uf,tg,vg,ug,zg,kg,lh,hh,Wk,Wk,Wk,Wk];var dc=[Xk,ai,bi,di];return{_i64Subtract:dk,_fflush:Yi,_i64Add:gk,_memset:ek,_malloc:Uj,_memcpy:ik,___getTypeName:Ah,_bitshift64Lshr:hk,_free:Vj,___errno_location:qi,_bitshift64Shl:fk,__GLOBAL__sub_I_ARToolKitJS_cpp:Wg,__GLOBAL__sub_I_bind_cpp:Ch,runPostSets:ck,stackAlloc:ec,stackSave:fc,stackRestore:gc,establishStackSpace:hc,setThrew:ic,setTempRet0:lc,getTempRet0:mc,dynCall_iiii:sk,dynCall_viiiii:tk,dynCall_dii:uk,dynCall_vid:vk,dynCall_di:wk,dynCall_i:xk,dynCall_vi:yk,dynCall_vii:zk,dynCall_ii:Ak,dynCall_viii:Bk,dynCall_v:Ck,dynCall_viid:Dk,dynCall_iiiii:Ek,dynCall_viiiiii:Fk,dynCall_iii:Gk,dynCall_viiii:Hk}})


// EMSCRIPTEN_END_ASM
(Module.asmGlobalArg,Module.asmLibraryArg,buffer);var _i64Subtract=Module["_i64Subtract"]=asm["_i64Subtract"];var __GLOBAL__sub_I_bind_cpp=Module["__GLOBAL__sub_I_bind_cpp"]=asm["__GLOBAL__sub_I_bind_cpp"];var _fflush=Module["_fflush"]=asm["_fflush"];var __GLOBAL__sub_I_ARToolKitJS_cpp=Module["__GLOBAL__sub_I_ARToolKitJS_cpp"]=asm["__GLOBAL__sub_I_ARToolKitJS_cpp"];var _i64Add=Module["_i64Add"]=asm["_i64Add"];var _memset=Module["_memset"]=asm["_memset"];var runPostSets=Module["runPostSets"]=asm["runPostSets"];var _malloc=Module["_malloc"]=asm["_malloc"];var _memcpy=Module["_memcpy"]=asm["_memcpy"];var ___getTypeName=Module["___getTypeName"]=asm["___getTypeName"];var _bitshift64Lshr=Module["_bitshift64Lshr"]=asm["_bitshift64Lshr"];var _free=Module["_free"]=asm["_free"];var ___errno_location=Module["___errno_location"]=asm["___errno_location"];var _bitshift64Shl=Module["_bitshift64Shl"]=asm["_bitshift64Shl"];var dynCall_iiii=Module["dynCall_iiii"]=asm["dynCall_iiii"];var dynCall_viiiii=Module["dynCall_viiiii"]=asm["dynCall_viiiii"];var dynCall_dii=Module["dynCall_dii"]=asm["dynCall_dii"];var dynCall_vid=Module["dynCall_vid"]=asm["dynCall_vid"];var dynCall_di=Module["dynCall_di"]=asm["dynCall_di"];var dynCall_i=Module["dynCall_i"]=asm["dynCall_i"];var dynCall_vi=Module["dynCall_vi"]=asm["dynCall_vi"];var dynCall_vii=Module["dynCall_vii"]=asm["dynCall_vii"];var dynCall_ii=Module["dynCall_ii"]=asm["dynCall_ii"];var dynCall_viii=Module["dynCall_viii"]=asm["dynCall_viii"];var dynCall_v=Module["dynCall_v"]=asm["dynCall_v"];var dynCall_viid=Module["dynCall_viid"]=asm["dynCall_viid"];var dynCall_iiiii=Module["dynCall_iiiii"]=asm["dynCall_iiiii"];var dynCall_viiiiii=Module["dynCall_viiiiii"]=asm["dynCall_viiiiii"];var dynCall_iii=Module["dynCall_iii"]=asm["dynCall_iii"];var dynCall_viiii=Module["dynCall_viiii"]=asm["dynCall_viiii"];Runtime.stackAlloc=asm["stackAlloc"];Runtime.stackSave=asm["stackSave"];Runtime.stackRestore=asm["stackRestore"];Runtime.establishStackSpace=asm["establishStackSpace"];Runtime.setTempRet0=asm["setTempRet0"];Runtime.getTempRet0=asm["getTempRet0"];function ExitStatus(status){this.name="ExitStatus";this.message="Program terminated with exit("+status+")";this.status=status}ExitStatus.prototype=new Error;ExitStatus.prototype.constructor=ExitStatus;var initialStackTop;var preloadStartTime=null;var calledMain=false;dependenciesFulfilled=function runCaller(){if(!Module["calledRun"])run();if(!Module["calledRun"])dependenciesFulfilled=runCaller};Module["callMain"]=Module.callMain=function callMain(args){assert(runDependencies==0,"cannot call main when async dependencies remain! (listen on __ATMAIN__)");assert(__ATPRERUN__.length==0,"cannot call main when preRun functions remain to be called");args=args||[];ensureInitRuntime();var argc=args.length+1;function pad(){for(var i=0;i<4-1;i++){argv.push(0)}}var argv=[allocate(intArrayFromString(Module["thisProgram"]),"i8",ALLOC_NORMAL)];pad();for(var i=0;i<argc-1;i=i+1){argv.push(allocate(intArrayFromString(args[i]),"i8",ALLOC_NORMAL));pad()}argv.push(0);argv=allocate(argv,"i32",ALLOC_NORMAL);try{var ret=Module["_main"](argc,argv,0);exit(ret,true)}catch(e){if(e instanceof ExitStatus){return}else if(e=="SimulateInfiniteLoop"){Module["noExitRuntime"]=true;return}else{if(e&&typeof e==="object"&&e.stack)Module.printErr("exception thrown: "+[e,e.stack]);throw e}}finally{calledMain=true}};function run(args){args=args||Module["arguments"];if(preloadStartTime===null)preloadStartTime=Date.now();if(runDependencies>0){return}preRun();if(runDependencies>0)return;if(Module["calledRun"])return;function doRun(){if(Module["calledRun"])return;Module["calledRun"]=true;if(ABORT)return;ensureInitRuntime();preMain();if(Module["onRuntimeInitialized"])Module["onRuntimeInitialized"]();if(Module["_main"]&&shouldRunNow)Module["callMain"](args);postRun()}if(Module["setStatus"]){Module["setStatus"]("Running...");setTimeout((function(){setTimeout((function(){Module["setStatus"]("")}),1);doRun()}),1)}else{doRun()}}Module["run"]=Module.run=run;function exit(status,implicit){if(implicit&&Module["noExitRuntime"]){return}if(Module["noExitRuntime"]){}else{ABORT=true;EXITSTATUS=status;STACKTOP=initialStackTop;exitRuntime();if(Module["onExit"])Module["onExit"](status)}if(ENVIRONMENT_IS_NODE){process["stdout"]["once"]("drain",(function(){process["exit"](status)}));console.log(" ");setTimeout((function(){process["exit"](status)}),500)}else if(ENVIRONMENT_IS_SHELL&&typeof quit==="function"){quit(status)}throw new ExitStatus(status)}Module["exit"]=Module.exit=exit;var abortDecorators=[];function abort(what){if(what!==undefined){Module.print(what);Module.printErr(what);what=JSON.stringify(what)}else{what=""}ABORT=true;EXITSTATUS=1;var extra="\nIf this abort() is unexpected, build with -s ASSERTIONS=1 which can give more information.";var output="abort("+what+") at "+stackTrace()+extra;if(abortDecorators){abortDecorators.forEach((function(decorator){output=decorator(output,what)}))}throw output}Module["abort"]=Module.abort=abort;if(Module["preInit"]){if(typeof Module["preInit"]=="function")Module["preInit"]=[Module["preInit"]];while(Module["preInit"].length>0){Module["preInit"].pop()()}}var shouldRunNow=true;if(Module["noInitialRun"]){shouldRunNow=false}run()
;(function() {
	'use strict'

	/**
		The ARController is the main object for doing AR marker detection with JSARToolKit.

		To use an ARController, you need to tell it the dimensions to use for the AR processing canvas and
		pass it an ARCameraParam to define the camera parameters to use when processing images. 
		The ARCameraParam defines the lens distortion and aspect ratio of the camera used. 
		See https://www.artoolworks.com/support/library/Calibrating_your_camera for more information about AR camera parameteters and how to make and use them.

		If you pass an image as the first argument, the ARController uses that as the image to process,
		using the dimensions of the image as AR processing canvas width and height. If the first argument
		to ARController is an image, the second argument is used as the camera param.

		The camera parameters argument can be either an ARCameraParam or an URL to a camera definition file.
		If the camera argument is an URL, it is loaded into a new ARCameraParam, and the ARController dispatches
		a 'load' event and calls the onload method if it is defined.

	 	@exports ARController
	 	@constructor

		@param {number} width The width of the images to process.
		@param {number} height The height of the images to process.
		@param {ARCameraParam | string} camera The ARCameraParam to use for image processing. If this is a string, the ARController treats it as an URL and tries to load it as a ARCameraParam definition file, calling ARController#onload on success. 
	*/
	var ARController = function(width, height, camera) {
		var id;
		var w = width, h = height;

		this.orientation = 'landscape';

		this.listeners = {};

		if (typeof width !== 'number') {
			var image = width;
			camera = height;
			w = image.videoWidth || image.width;
			h = image.videoHeight || image.height;
			this.image = image;
		}

		this.defaultMarkerWidth = 1;
		this.patternMarkers = {};
		this.barcodeMarkers = {};
		this.transform_mat = new Float32Array(16);

		this.canvas = document.createElement('canvas');
		this.canvas.width = w;
		this.canvas.height = h;
		this.ctx = this.canvas.getContext('2d');

		this.videoWidth = w;
		this.videoHeight = h;

		if (typeof camera === 'string') {

			var self = this;
			this.cameraParam = new ARCameraParam(camera, function() {
				self._initialize();
			}, function(err) {
				console.error("ARController: Failed to load ARCameraParam", err);
			});

		} else {

			this.cameraParam = camera;
			this._initialize();

		}
	};

	/**
		Destroys the ARController instance and frees all associated resources.
		After calling dispose, the ARController can't be used any longer. Make a new one if you need one.

		Calling this avoids leaking Emscripten memory, which may be important if you're using multiple ARControllers.
	*/
	ARController.prototype.dispose = function() {
		artoolkit.teardown(this.id);

		for (var t in this) {
			this[t] = null;
		}
	};

	/**
		Detects markers in the given image. The process method dispatches marker detection events during its run.

		The marker detection process proceeds by first dispatching a markerNum event that tells you how many
		markers were found in the image. Next, a getMarker event is dispatched for each found marker square.
		Finally, getMultiMarker is dispatched for every found multimarker, followed by getMultiMarkerSub events
		dispatched for each of the markers in the multimarker.
			
			arController.addEventListener('markerNum', function(ev) {
				console.log("Detected " + ev.data + " markers.")
			});
			arController.addEventListener('getMarker', function(ev) {
				console.log("Detected marker with ids:", ev.data.marker.id, ev.data.marker.idPatt, ev.data.marker.idMatrix);
				console.log("Marker data", ev.data.marker);
				console.log("Marker transform matrix:", [].join.call(ev.data.matrix, ', '));
			});
			arController.addEventListener('getMultiMarker', function(ev) {
				console.log("Detected multimarker with id:", ev.data.multiMarkerId);
			});
			arController.addEventListener('getMultiMarkerSub', function(ev) {
				console.log("Submarker for " + ev.data.multiMarkerId, ev.data.markerIndex, ev.data.marker);
			});
			
			arController.process(image);	


		If no image is given, defaults to this.image.

		If the debugSetup has been called, draws debug markers on the debug canvas.

		@param {ImageElement | VideoElement} image The image to process [optional]. 
	*/
	ARController.prototype.process = function(image) {
		this.detectMarker(image);

		var markerNum = this.getMarkerNum();
		var k,o;
		for (k in this.patternMarkers) {
			o = this.patternMarkers[k]
			o.inPrevious = o.inCurrent;
			o.inCurrent = false;
		}
		for (k in this.barcodeMarkers) {
			o = this.barcodeMarkers[k]
			o.inPrevious = o.inCurrent;
			o.inCurrent = false;
		}

		for (var i=0; i<markerNum; i++) {
			var markerInfo = this.getMarker(i);

			var markerType = artoolkit.UNKNOWN_MARKER;
			var visible = this.trackPatternMarkerId(-1);

			if (markerInfo.idPatt > -1 && (markerInfo.id === markerInfo.idPatt || markerInfo.idMatrix === -1)) {
				visible = this.trackPatternMarkerId(markerInfo.idPatt);
				markerType = artoolkit.PATTERN_MARKER;

				if (markerInfo.dir !== markerInfo.dirPatt) {
					this.setMarkerInfoDir(i, markerInfo.dirPatt);
				}

			} else if (markerInfo.idMatrix > -1) {
				visible = this.trackBarcodeMarkerId(markerInfo.idMatrix);
				markerType = artoolkit.BARCODE_MARKER;

				if (markerInfo.dir !== markerInfo.dirMatrix) {
					this.setMarkerInfoDir(i, markerInfo.dirMatrix);
				}
			}

			if (markerType !== artoolkit.UNKNOWN_MARKER && visible.inPrevious) {
				this.getTransMatSquareCont(i, visible.markerWidth, visible.matrix, visible.matrix);
			} else {
				this.getTransMatSquare(i, visible.markerWidth, visible.matrix);
			}
// this.getTransMatSquare(i, visible.markerWidth, visible.matrix);

			visible.inCurrent = true;
			this.transMatToGLMat(visible.matrix, this.transform_mat);
			this.dispatchEvent({
				name: 'getMarker',
				target: this,
				data: {
					index: i,
					type: markerType,
					marker: markerInfo,
					matrix: this.transform_mat
				}
			});
		}

		var multiMarkerCount = this.getMultiMarkerCount();
		for (var i=0; i<multiMarkerCount; i++) {
			var subMarkerCount = this.getMultiMarkerPatternCount(i);
			var visible = false;

			artoolkit.getTransMatMultiSquareRobust(this.id, i);
			this.transMatToGLMat(this.marker_transform_mat, this.transform_mat);
			for (var j=0; j<subMarkerCount; j++) {
				var multiEachMarkerInfo = this.getMultiEachMarker(i, j);
				if (multiEachMarkerInfo.visible >= 0) {
					visible = true;
					this.dispatchEvent({
						name: 'getMultiMarker',
						target: this,
						data: {
							multiMarkerId: i,
							matrix: this.transform_mat
						}
					});
					break;
				}
			}
			if (visible) {
				for (var j=0; j<subMarkerCount; j++) {
					var multiEachMarkerInfo = this.getMultiEachMarker(i, j);
					this.transMatToGLMat(this.marker_transform_mat, this.transform_mat);
					this.dispatchEvent({
						name: 'getMultiMarkerSub',
						target: this,
						data: {
							multiMarkerId: i,
							markerIndex: j,
							marker: multiEachMarkerInfo,
							matrix: this.transform_mat
						}
					});
				}
			}
		}
		if (this._bwpointer) {
			this.debugDraw();
		}
	};

	/**
		Adds the given pattern marker ID to the index of tracked IDs.
		Sets the markerWidth for the pattern marker to markerWidth.

		Used by process() to implement continuous tracking, 
		keeping track of the marker's transformation matrix
		and customizable marker widths.

		@param {number} id ID of the pattern marker to track.
		@param {number} markerWidth The width of the marker to track.
		@return {Object} The marker tracking object.
	*/
	ARController.prototype.trackPatternMarkerId = function(id, markerWidth) {
		var obj = this.patternMarkers[id];
		if (!obj) {
			this.patternMarkers[id] = obj = {
				inPrevious: false,
				inCurrent: false,
				matrix: new Float32Array(12),
				markerWidth: markerWidth || this.defaultMarkerWidth
			};
		}
		if (markerWidth) {
			obj.markerWidth = markerWidth;
		}
		return obj;
	};

	/**
		Adds the given barcode marker ID to the index of tracked IDs.
		Sets the markerWidth for the pattern marker to markerWidth.

		Used by process() to implement continuous tracking, 
		keeping track of the marker's transformation matrix
		and customizable marker widths.

		@param {number} id ID of the barcode marker to track.
		@param {number} markerWidth The width of the marker to track.
		@return {Object} The marker tracking object.
	*/
	ARController.prototype.trackBarcodeMarkerId = function(id, markerWidth) {
		var obj = this.barcodeMarkers[id];
		if (!obj) {
			this.barcodeMarkers[id] = obj = {
				inPrevious: false,
				inCurrent: false,
				matrix: new Float32Array(12),
				markerWidth: markerWidth || this.defaultMarkerWidth
			};
		}
		if (markerWidth) {
			obj.markerWidth = markerWidth;
		}
		return obj;
	};

	/**
		Returns the number of multimarkers registered on this ARController.

		@return {number} Number of multimarkers registered.
	*/
	ARController.prototype.getMultiMarkerCount = function() {
		return artoolkit.getMultiMarkerCount(this.id);
	};

	/**
		Returns the number of markers in the multimarker registered for the given multiMarkerId.

		@param {number} multiMarkerId The id number of the multimarker to access. Given by loadMultiMarker.
		@return {number} Number of markers in the multimarker. Negative value indicates failure to find the multimarker.
	*/
	ARController.prototype.getMultiMarkerPatternCount = function(multiMarkerId) {
		return artoolkit.getMultiMarkerNum(this.id, multiMarkerId);
	};

	/**
		Add an event listener on this ARController for the named event, calling the callback function
		whenever that event is dispatched.

		Possible events are: 
		  * getMarker - dispatched whenever process() finds a square marker
		  * getMultiMarker - dispatched whenever process() finds a visible registered multimarker
		  * getMultiMarkerSub - dispatched by process() for each marker in a visible multimarker
		  * load - dispatched when the ARController is ready to use (useful if passing in a camera URL in the constructor)

		@param {string} name Name of the event to listen to.
		@param {function} callback Callback function to call when an event with the given name is dispatched.
	*/
	ARController.prototype.addEventListener = function(name, callback) {
       if (!this.listeners[name]) {
			this.listeners[name] = [];
		}
		this.listeners[name].push(callback);
	};

	/**
		Remove an event listener from the named event.

		@param {string} name Name of the event to stop listening to.
		@param {function} callback Callback function to remove from the listeners of the named event.
	*/
	ARController.prototype.removeEventListener = function(name, callback) {
		if (this.listeners[name]) {
			var index = this.listeners[name].indexOf(callback);
			if (index > -1) {
				this.listeners[name].splice(index, 1);
			}
		}
	};

	/**
		Dispatches the given event to all registered listeners on event.name.

		@param {Object} event Event to dispatch.
	*/
	ARController.prototype.dispatchEvent = function(event) {
		var listeners = this.listeners[event.name];
		if (listeners) {
			for (var i=0; i<listeners.length; i++) {
				listeners[i].call(this, event);
			}
		}
	};

	/**
		Sets up a debug canvas for the AR detection. Draws a red marker on top of each detected square in the image.

		The debug canvas is added to document.body.
	*/
	ARController.prototype.debugSetup = function() {
		document.body.appendChild(this.canvas)
		this.setDebugMode(1);
		this._bwpointer = this.getProcessingImage();
	};

	/**
		Loads a pattern marker from the given URL and calls the onSuccess callback with the UID of the marker.

		arController.loadMarker(markerURL, onSuccess, onError);

		@param {string} markerURL - The URL of the marker pattern file to load.
		@param {function} onSuccess - The success callback. Called with the id of the loaded marker on a successful load.
		@param {function} onError - The error callback. Called with the encountered error if the load fails.
	*/
	ARController.prototype.loadMarker = function(markerURL, onSuccess, onError) {
		return artoolkit.addMarker(this.id, markerURL, onSuccess, onError);
	};

	/**
		Loads a multimarker from the given URL and calls the onSuccess callback with the UID of the marker.

		arController.loadMultiMarker(markerURL, onSuccess, onError);

		@param {string} markerURL - The URL of the multimarker pattern file to load.
		@param {function} onSuccess - The success callback. Called with the id and the number of sub-markers of the loaded marker on a successful load.
		@param {function} onError - The error callback. Called with the encountered error if the load fails.
	*/
	ARController.prototype.loadMultiMarker = function(markerURL, onSuccess, onError) {
		return artoolkit.addMultiMarker(this.id, markerURL, onSuccess, onError);
	};
	
	/**
	 * Populates the provided float array with the current transformation for the specified marker. After 
	 * a call to detectMarker, all marker information will be current. Marker transformations can then be 
	 * checked.
	 * @param {number} markerUID	The unique identifier (UID) of the marker to query
	 * @param {number} markerWidth	The width of the marker
	 * @param {Float64Array} dst	The float array to populate with the 3x4 marker transformation matrix
	 * @return	{Float64Array} The dst array.
	 */
	ARController.prototype.getTransMatSquare = function(markerIndex, markerWidth, dst) {
		artoolkit.getTransMatSquare(this.id, markerIndex, markerWidth);
		dst.set(this.marker_transform_mat);
		return dst;
	};

	/**
	 * Populates the provided float array with the current transformation for the specified marker, using 
	 * previousMarkerTransform as the previously detected transformation. After 
	 * a call to detectMarker, all marker information will be current. Marker transformations can then be 
	 * checked.
	 * @param {number} markerUID	The unique identifier (UID) of the marker to query
	 * @param {number} markerWidth	The width of the marker
	 * @param {Float64Array} previousMarkerTransform	The float array to use as the previous 3x4 marker transformation matrix
	 * @param {Float64Array} dst	The float array to populate with the 3x4 marker transformation matrix
	 * @return	{Float64Array} The dst array.
	 */
	ARController.prototype.getTransMatSquareCont = function(markerIndex, markerWidth, previousMarkerTransform, dst) {
		this.marker_transform_mat.set(previousMarkerTransform)
		artoolkit.getTransMatSquareCont(this.id, markerIndex, markerWidth);
		dst.set(this.marker_transform_mat);
		return dst;
	};

	/**
	 * Populates the provided float array with the current transformation for the specified multimarker. After 
	 * a call to detectMarker, all marker information will be current. Marker transformations can then be 
	 * checked.
	 *
	 * @param {number} markerUID	The unique identifier (UID) of the marker to query
	 * @param {number} markerWidth	The width of the marker
	 * @param {Float64Array} dst	The float array to populate with the 3x4 marker transformation matrix
	 * @return	{Float64Array} The dst array.
	 */
	ARController.prototype.getTransMatMultiSquare = function(multiMarkerId, dst) {
		artoolkit.getTransMatMultiSquare(this.id, multiMarkerId);
		dst.set(this.marker_transform_mat);
		return dst;
	};

	/**
	 * Populates the provided float array with the current robust transformation for the specified multimarker. After 
	 * a call to detectMarker, all marker information will be current. Marker transformations can then be 
	 * checked.
	 * @param {number} markerUID	The unique identifier (UID) of the marker to query
	 * @param {number} markerWidth	The width of the marker
	 * @param {Float64Array} dst	The float array to populate with the 3x4 marker transformation matrix
	 * @return	{Float64Array} The dst array.
	 */
	ARController.prototype.getTransMatMultiSquareRobust = function(multiMarkerId, dst) {
		artoolkit.getTransMatMultiSquare(this.id, multiMarkerId);
		dst.set(this.marker_transform_mat);
		return dst;
	};

	/**
		Converts the given 3x4 marker transformation matrix in the 12-element transMat array
		into a 4x4 WebGL matrix and writes the result into the 16-element glMat array.

		If scale parameter is given, scales the transform of the glMat by the scale parameter.

		@param {Float64Array} transMat The 3x4 marker transformation matrix.
		@param {Float64Array} glMat The 4x4 GL transformation matrix.
		@param {number} scale The scale for the transform.
	*/ 
	ARController.prototype.transMatToGLMat = function(transMat, glMat, scale) {
		glMat[0 + 0*4] = transMat[0]; // R1C1
		glMat[0 + 1*4] = transMat[1]; // R1C2
		glMat[0 + 2*4] = transMat[2];
		glMat[0 + 3*4] = transMat[3];
		glMat[1 + 0*4] = transMat[4]; // R2
		glMat[1 + 1*4] = transMat[5];
		glMat[1 + 2*4] = transMat[6];
		glMat[1 + 3*4] = transMat[7];
		glMat[2 + 0*4] = transMat[8]; // R3
		glMat[2 + 1*4] = transMat[9];
		glMat[2 + 2*4] = transMat[10];
		glMat[2 + 3*4] = transMat[11];
		glMat[3 + 0*4] = 0.0;
		glMat[3 + 1*4] = 0.0;
		glMat[3 + 2*4] = 0.0;
		glMat[3 + 3*4] = 1.0;
		if (scale != undefined && scale !== 0.0) {
			glMat[12] *= scale;
			glMat[13] *= scale;
			glMat[14] *= scale;
		}
		return glMat;
	};

	/**
		This is the core ARToolKit marker detection function. It calls through to a set of
		internal functions to perform the key marker detection steps of binarization and
		labelling, contour extraction, and template matching and/or matrix code extraction.
        
        Typically, the resulting set of detected markers is retrieved by calling arGetMarkerNum
        to get the number of markers detected and arGetMarker to get an array of ARMarkerInfo
        structures with information on each detected marker, followed by a step in which
        detected markers are possibly examined for some measure of goodness of match (e.g. by
        examining the match confidence value) and pose extraction.

		@param {image} Image to be processed to detect markers.
		@return {number}     0 if the function proceeded without error, or a value less than 0 in case of error.
			A result of 0 does not however, imply any markers were detected.
	*/
	ARController.prototype.detectMarker = function(image) {
		if (this._copyImageToHeap(image)) {
			return artoolkit.detectMarker(this.id);
		}
		return -99;
	};

	/**
		Get the number of markers detected in a video frame.
  
	    @return {number}     The number of detected markers in the most recent image passed to arDetectMarker.
    	    Note that this is actually a count, not an index. A better name for this function would be
        	arGetDetectedMarkerCount, but the current name lives on for historical reasons.
    */
	ARController.prototype.getMarkerNum = function() {
		return artoolkit.getMarkerNum(this.id);
	};

	/**
		Get the marker info struct for the given marker index in detected markers.

		Call this.detectMarker first, then use this.getMarkerNum to get the detected marker count.

		The returned object is the global artoolkit.markerInfo object and will be overwritten
		by subsequent calls. If you need to hang on to it, create a copy using this.cloneMarkerInfo();

		Returns undefined if no marker was found.

		A markerIndex of -1 is used to access the global custom marker.

		The fields of the markerInfo struct are:
		    @field      area Area in pixels of the largest connected region, comprising the marker border and regions connected to it. Note that this is
		        not the same as the actual onscreen area inside the marker border.
			@field      id If pattern detection mode is either pattern mode OR matrix but not both, will be marker ID (>= 0) if marker is valid, or -1 if invalid.
			@field      idPatt If pattern detection mode includes a pattern mode, will be marker ID (>= 0) if marker is valid, or -1 if invalid.
		    @field      idMatrix If pattern detection mode includes a matrix mode, will be marker ID (>= 0) if marker is valid, or -1 if invalid.
			@field      dir If pattern detection mode is either pattern mode OR matrix but not both, and id != -1, will be marker direction (range 0 to 3, inclusive).
			@field      dirPatt If pattern detection mode includes a pattern mode, and id != -1, will be marker direction (range 0 to 3, inclusive).
			@field      dirMatrix If pattern detection mode includes a matrix mode, and id != -1, will be marker direction (range 0 to 3, inclusive).
			@field      cf If pattern detection mode is either pattern mode OR matrix but not both, will be marker matching confidence (range 0.0 to 1.0 inclusive) if marker is valid, or -1.0 if marker is invalid.
			@field      cfPatt If pattern detection mode includes a pattern mode, will be marker matching confidence (range 0.0 to 1.0 inclusive) if marker is valid, or -1.0 if marker is invalid.
			@field      cfMatrix If pattern detection mode includes a matrix mode, will be marker matching confidence (range 0.0 to 1.0 inclusive) if marker is valid, or -1.0 if marker is invalid.
			@field      pos 2D position (in camera image coordinates, origin at top-left) of the centre of the marker.
			@field      line Line equations for the 4 sides of the marker.
			@field      vertex 2D positions (in camera image coordinates, origin at top-left) of the corners of the marker. vertex[(4 - dir)%4][] is the top-left corner of the marker. Other vertices proceed clockwise from this. These are idealised coordinates (i.e. the onscreen position aligns correctly with the undistorted camera image.)


		@param {number} markerIndex The index of the marker to query.
		@returns {Object} The markerInfo struct.
	*/
	ARController.prototype.getMarker = function(markerIndex) {
		if (0 === artoolkit.getMarker(this.id, markerIndex)) {
			return artoolkit.markerInfo;
		}
	};

	/**
		Set marker vertices to the given vertexData[4][2] array.

		Sets the marker pos to the center of the vertices.

		Useful for building custom markers for getTransMatSquare.

		A markerIndex of -1 is used to access the global custom marker.

		@param {number} markerIndex The index of the marker to edit.
	*/
	ARController.prototype.setMarkerInfoVertex = function(markerIndex, vertexData) {
		for (var i=0; i<vertexData.length; i++) {
			this.marker_transform_mat[i*2+0] = vertexData[i][0];
			this.marker_transform_mat[i*2+1] = vertexData[i][1];
		}
		return artoolkit.setMarkerInfoVertex(this.id, markerIndex);
	};

	/**
		Makes a deep copy of the given marker info.

		@param {Object} markerInfo The marker info object to copy.
		@return {Object} The new copy of the marker info.
	*/
	ARController.prototype.cloneMarkerInfo = function(markerInfo) {
		return JSON.parse(JSON.stringify(markerInfo));
	};

	/**
		Get the marker info struct for the given marker index in detected markers.

		Call this.detectMarker first, then use this.getMarkerNum to get the detected marker count.

		The returned object is the global artoolkit.markerInfo object and will be overwritten
		by subsequent calls. If you need to hang on to it, create a copy using this.cloneMarkerInfo();

		Returns undefined if no marker was found.

		@field {number} pattId The index of the marker.
		@field {number} pattType The type of the marker. Either AR_MULTI_PATTERN_TYPE_TEMPLATE or AR_MULTI_PATTERN_TYPE_MATRIX.
		@field {number} visible 0 or larger if the marker is visible
		@field {number} width The width of the marker.

		@param {number} multiMarkerId The multimarker to query.
		@param {number} markerIndex The index of the marker to query.
		@returns {Object} The markerInfo struct.
	*/
	ARController.prototype.getMultiEachMarker = function(multiMarkerId, markerIndex) {
		if (0 === artoolkit.getMultiEachMarker(this.id, multiMarkerId, markerIndex)) {
			return artoolkit.multiEachMarkerInfo;
		}
	};


	/**
		Returns the 16-element WebGL transformation matrix used by ARController.process to 
		pass marker WebGL matrices to event listeners.

		Unique to each ARController.

		@return {Float64Array} The 16-element WebGL transformation matrix used by the ARController.
	*/
	ARController.prototype.getTransformationMatrix = function() {
		return this.transform_mat;
	};

	/**
	 * Returns the projection matrix computed from camera parameters for the ARController.
	 *
	 * @return {Float64Array} The 16-element WebGL camera matrix for the ARController camera parameters.
	 */
	ARController.prototype.getCameraMatrix = function() {
		return this.camera_mat;
	};

	/**
		Returns the shared ARToolKit 3x4 marker transformation matrix, used for passing and receiving
		marker transforms to/from the Emscripten side.

		@return {Float64Array} The 12-element 3x4 row-major marker transformation matrix used by ARToolKit.
	*/
	ARController.prototype.getMarkerTransformationMatrix = function() {
		return this.marker_transform_mat;
	};


	/* Setter / Getter Proxies */

	/**
	 * Enables or disables debug mode in the tracker. When enabled, a black and white debug
	 * image is generated during marker detection. The debug image is useful for visualising
	 * the binarization process and choosing a threshold value.
	 * @param {number} debug		true to enable debug mode, false to disable debug mode
	 * @see				getDebugMode()
	 */
	ARController.prototype.setDebugMode = function(mode) {
		return artoolkit.setDebugMode(this.id, mode);
	};

	/**
	 * Returns whether debug mode is currently enabled.
	 * @return			true when debug mode is enabled, false when debug mode is disabled
	 * @see				setDebugMode()
	 */
	ARController.prototype.getDebugMode = function() {
		return artoolkit.getDebugMode(this.id);
	};

	/**
		Returns the Emscripten HEAP offset to the debug processing image used by ARToolKit.

		@return {number} HEAP offset to the debug processing image.
	*/
	ARController.prototype.getProcessingImage = function() {
		return artoolkit.getProcessingImage(this.id);
	}

	/**
		Sets the logging level to use by ARToolKit.

		@param 
	*/
	ARController.prototype.setLogLevel = function(mode) {
		return artoolkit.setLogLevel(mode);
	};

	ARController.prototype.getLogLevel = function() {
		return artoolkit.getLogLevel();
	};

	ARController.prototype.setMarkerInfoDir = function(markerIndex, dir) {
		return artoolkit.setMarkerInfoDir(this.id, markerIndex, dir);
	};

	ARController.prototype.setProjectionNearPlane = function(value) {
		return artoolkit.setProjectionNearPlane(this.id, value);
	};

	ARController.prototype.getProjectionNearPlane = function() {
		return artoolkit.getProjectionNearPlane(this.id);
	};

	ARController.prototype.setProjectionFarPlane = function(value) {
		return artoolkit.setProjectionFarPlane(this.id, value);
	};

	ARController.prototype.getProjectionFarPlane = function() {
		return artoolkit.getProjectionFarPlane(this.id);
	};


	/**
	    Set the labeling threshold mode (auto/manual).

	    @param {number}		mode An integer specifying the mode. One of:
	        AR_LABELING_THRESH_MODE_MANUAL,
	        AR_LABELING_THRESH_MODE_AUTO_MEDIAN,
	        AR_LABELING_THRESH_MODE_AUTO_OTSU,
	        AR_LABELING_THRESH_MODE_AUTO_ADAPTIVE,
	        AR_LABELING_THRESH_MODE_AUTO_BRACKETING
	 */
 	ARController.prototype.setThresholdMode = function(mode) {
		return artoolkit.setThresholdMode(this.id, mode);
	};

	/**
	 * Gets the current threshold mode used for image binarization.
	 * @return	{number}		The current threshold mode
	 * @see				getVideoThresholdMode()
	 */
	ARController.prototype.getThresholdMode = function() {
		return artoolkit.getThresholdMode(this.id);
	};

	/**
    	Set the labeling threshhold.

        This function forces sets the threshold value.
        The default value is AR_DEFAULT_LABELING_THRESH which is 100.
        
        The current threshold mode is not affected by this call.
        Typically, this function is used when labeling threshold mode
        is AR_LABELING_THRESH_MODE_MANUAL.
 
        The threshold value is not relevant if threshold mode is
        AR_LABELING_THRESH_MODE_AUTO_ADAPTIVE.
 
        Background: The labeling threshold is the value which
		the AR library uses to differentiate between black and white
		portions of an ARToolKit marker. Since the actual brightness,
		contrast, and gamma of incoming images can vary signficantly
		between different cameras and lighting conditions, this
		value typically needs to be adjusted dynamically to a
		suitable midpoint between the observed values for black
		and white portions of the markers in the image.

		@param {number}     thresh An integer in the range [0,255] (inclusive).
	*/
	ARController.prototype.setThreshold = function(threshold) {
		return artoolkit.setThreshold(this.id, threshold);
	};

	/**
	    Get the current labeling threshold.

		This function queries the current labeling threshold. For,
		AR_LABELING_THRESH_MODE_AUTO_MEDIAN, AR_LABELING_THRESH_MODE_AUTO_OTSU,
		and AR_LABELING_THRESH_MODE_AUTO_BRACKETING
		the threshold value is only valid until the next auto-update.

		The current threshold mode is not affected by this call.

		The threshold value is not relevant if threshold mode is
		AR_LABELING_THRESH_MODE_AUTO_ADAPTIVE.

	    @return {number} The current threshold value.
	*/
	ARController.prototype.getThreshold = function() {
		return artoolkit.getThreshold(this.id);
	};


	/**
		Set the pattern detection mode

		The pattern detection determines the method by which ARToolKit
		matches detected squares in the video image to marker templates
		and/or IDs. ARToolKit v4.x can match against pictorial "template" markers,
		whose pattern files are created with the mk_patt utility, in either colour
		or mono, and additionally can match against 2D-barcode-type "matrix"
		markers, which have an embedded marker ID. Two different two-pass modes
		are also available, in which a matrix-detection pass is made first,
		followed by a template-matching pass.

		@param {number} mode
			Options for this field are:
			AR_TEMPLATE_MATCHING_COLOR
			AR_TEMPLATE_MATCHING_MONO
			AR_MATRIX_CODE_DETECTION
			AR_TEMPLATE_MATCHING_COLOR_AND_MATRIX
			AR_TEMPLATE_MATCHING_MONO_AND_MATRIX
			The default mode is AR_TEMPLATE_MATCHING_COLOR.
	*/
	ARController.prototype.setPatternDetectionMode = function(value) {
		return artoolkit.setPatternDetectionMode(this.id, value);
	};

	/**
		Returns the current pattern detection mode.

		@return {number} The current pattern detection mode.
	*/
	ARController.prototype.getPatternDetectionMode = function() {
		return artoolkit.getPatternDetectionMode(this.id);
	};

	/**
		Set the size and ECC algorithm to be used for matrix code (2D barcode) marker detection.

		When matrix-code (2D barcode) marker detection is enabled (see arSetPatternDetectionMode)
		then the size of the barcode pattern and the type of error checking and correction (ECC)
		with which the markers were produced can be set via this function.

		This setting is global to a given ARHandle; It is not possible to have two different matrix
		code types in use at once.

	    @param      type The type of matrix code (2D barcode) in use. Options include:
	        AR_MATRIX_CODE_3x3
	        AR_MATRIX_CODE_3x3_HAMMING63
	        AR_MATRIX_CODE_3x3_PARITY65
	        AR_MATRIX_CODE_4x4
	        AR_MATRIX_CODE_4x4_BCH_13_9_3
	        AR_MATRIX_CODE_4x4_BCH_13_5_5
	        The default mode is AR_MATRIX_CODE_3x3.
	*/
	ARController.prototype.setMatrixCodeType = function(value) {
		return artoolkit.setMatrixCodeType(this.id, value);
	};

	/**
		Returns the current matrix code (2D barcode) marker detection type.

		@return {number} The current matrix code type.
	*/
	ARController.prototype.getMatrixCodeType = function() {
		return artoolkit.getMatrixCodeType(this.id);
	};

	/**
		Select between detection of black markers and white markers.
	
		ARToolKit's labelling algorithm can work with both black-bordered
		markers on a white background (AR_LABELING_BLACK_REGION) or
		white-bordered markers on a black background (AR_LABELING_WHITE_REGION).
		This function allows you to specify the type of markers to look for.
		Note that this does not affect the pattern-detection algorith
		which works on the interior of the marker.

		@param {number}      mode
			Options for this field are:
			AR_LABELING_WHITE_REGION
			AR_LABELING_BLACK_REGION
			The default mode is AR_LABELING_BLACK_REGION.
	*/
	ARController.prototype.setLabelingMode = function(value) {
		return artoolkit.setLabelingMode(this.id, value);
	};

	/**
		Enquire whether detection is looking for black markers or white markers.
	    
	    See discussion for setLabelingMode.

	    @result {number} The current labeling mode.
	*/
	ARController.prototype.getLabelingMode = function() {
		return artoolkit.getLabelingMode(this.id);
	};

	/**
		Set the width/height of the marker pattern space, as a proportion of marker width/height.

	    @param {number}		pattRatio The the width/height of the marker pattern space, as a proportion of marker
	        width/height. To set the default, pass AR_PATT_RATIO.
	        If compatibility with ARToolKit verions 1.0 through 4.4 is required, this value
	        must be 0.5.
	 */
 	ARController.prototype.setPattRatio = function(value) {
		return artoolkit.setPattRatio(this.id, value);
	};

	/**
		Returns the current ratio of the marker pattern to the total marker size.

		@return {number} The current pattern ratio.
	*/
	ARController.prototype.getPattRatio = function() {
		return artoolkit.getPattRatio(this.id);
	};

	/**
	    Set the image processing mode.

        When the image processing mode is AR_IMAGE_PROC_FRAME_IMAGE,
        ARToolKit processes all pixels in each incoming image
        to locate markers. When the mode is AR_IMAGE_PROC_FIELD_IMAGE,
        ARToolKit processes pixels in only every second pixel row and
        column. This is useful both for handling images from interlaced
        video sources (where alternate lines are assembled from alternate
        fields and thus have one field time-difference, resulting in a
        "comb" effect) such as Digital Video cameras.
        The effective reduction by 75% in the pixels processed also
        has utility in accelerating tracking by effectively reducing
        the image size to one quarter size, at the cost of pose accuraccy.

	    @param {number} mode
			Options for this field are:
			AR_IMAGE_PROC_FRAME_IMAGE
			AR_IMAGE_PROC_FIELD_IMAGE
			The default mode is AR_IMAGE_PROC_FRAME_IMAGE.
	*/
	ARController.prototype.setImageProcMode = function(value) {
		return artoolkit.setImageProcMode(this.id, value);
	};

	/**
	    Get the image processing mode.

		See arSetImageProcMode() for a complete description.

	    @return {number} The current image processing mode.
	*/
	ARController.prototype.getImageProcMode = function() {
		return artoolkit.getImageProcMode(this.id);
	};


	/**
		Draw the black and white image and debug markers to the ARController canvas.

		See setDebugMode.
	*/
	ARController.prototype.debugDraw = function() {
		var debugBuffer = new Uint8ClampedArray(Module.HEAPU8.buffer, this._bwpointer, this.framesize);
		var id = new ImageData(debugBuffer, this.canvas.width, this.canvas.height)
		this.ctx.putImageData(id, 0, 0)

		var marker_num = this.getMarkerNum();
		for (var i=0; i<marker_num; i++) {
			this._debugMarker(this.getMarker(i));
		}
	};


	// private

	ARController.prototype._initialize = function() {
		this.id = artoolkit.setup(this.canvas.width, this.canvas.height, this.cameraParam.id);

		var params = artoolkit.frameMalloc;
		this.framepointer = params.framepointer;
		this.framesize = params.framesize;

		this.dataHeap = new Uint8Array(Module.HEAPU8.buffer, this.framepointer, this.framesize);

		this.camera_mat = new Float64Array(Module.HEAPU8.buffer, params.camera, 16);
		this.marker_transform_mat = new Float64Array(Module.HEAPU8.buffer, params.transform, 12);

		this.setProjectionNearPlane(0.1)
		this.setProjectionFarPlane(1000);

		var self = this;
		setTimeout(function() {
			if (self.onload) {
				self.onload();
			}
			self.dispatchEvent({
				name: 'load',
				target: self
			});
		}, 1);
	};
/*
	ARController.prototype._copyImageToHeap = function(image) {
		if (!image) {
			image = this.image;
		}


		// if (this.orientation === 'portrait') {
		// 	this.ctx.save();
		// 	this.ctx.translate(this.canvas.width, 0);
		// 	this.ctx.rotate(Math.PI/2);
		// 	this.ctx.drawImage(image, 0, 0, this.canvas.height, this.canvas.width); // draw video
		// 	this.ctx.restore();
		// } else {
		// 	debugger
		// 	this.ctx.drawImage(image, 0, 0, this.canvas.width, this.canvas.height); // draw video
		// }


		this.ctx.drawImage(image, 0, 0, this.canvas.width, this.canvas.height); // draw video
		var imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
		var data = imageData.data;

		if (this.dataHeap) {
			this.dataHeap.set( data );
			return true;
		}
		return false;
	};
*/
	
	ARController.prototype._copyImageToHeap = function(image) {
		if (!image) {
			image = this.image;
		}

		if( (image.nodeName === 'IMG' && image.width > image.height ) ||
			(image.nodeName === 'VIDEO' && image.videoWidth > image.videoHeight) ){
			// if landscape
			this.ctx.drawImage(image, 0, 0, this.canvas.width, this.canvas.height); // draw video
		}else{
			// if portrait
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			var scale = this.canvas.height / this.canvas.width;
			var scaledHeight = this.canvas.width*scale;
			var scaledWidth = this.canvas.height*scale;
			var marginLeft = ( this.canvas.width - scaledWidth)/2;
			this.ctx.drawImage(image, marginLeft, 0, scaledWidth, scaledHeight); // draw video
		}

		var imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
		var data = imageData.data;

		if (this.dataHeap) {
			this.dataHeap.set( data );
			return true;
		}
		return false;
	};
	
	ARController.prototype._debugMarker = function(marker) {
		var vertex, pos;
		vertex = marker.vertex;
		var ctx = this.ctx;
		ctx.strokeStyle = 'red';

		ctx.beginPath()
		ctx.moveTo(vertex[0][0], vertex[0][1])
		ctx.lineTo(vertex[1][0], vertex[1][1])
		ctx.stroke();

		ctx.beginPath()
		ctx.moveTo(vertex[2][0], vertex[2][1])
		ctx.lineTo(vertex[3][0], vertex[3][1])
		ctx.stroke()

		ctx.strokeStyle = 'green';
		ctx.beginPath()
		ctx.lineTo(vertex[1][0], vertex[1][1])
		ctx.lineTo(vertex[2][0], vertex[2][1])
		ctx.stroke();

		ctx.beginPath()
		ctx.moveTo(vertex[3][0], vertex[3][1])
		ctx.lineTo(vertex[0][0], vertex[0][1])
		ctx.stroke();

		pos = marker.pos
		ctx.beginPath()
		ctx.arc(pos[0], pos[1], 8, 0, Math.PI * 2)
		ctx.fillStyle = 'red'
		ctx.fill()
	};


	// static

	/**
		ARController.getUserMedia gets a device camera video feed and calls the given onSuccess callback with it.

		Tries to start playing the video. Playing the video can fail on Chrome for Android,
		so ARController.getUserMedia adds user input event listeners to the window
		that try to start playing the video. On success, the event listeners are removed.

		To use ARController.getUserMedia, call it with an object with the onSuccess attribute set to a callback function.

			ARController.getUserMedia({
				onSuccess: function(video) {
					console.log("Got video", video);
				}
			});

		The configuration object supports the following attributes:

			{
				onSuccess : function(video),
				onError : function(error),

				width : number | {min: number, ideal: number, max: number},
				height : number | {min: number, ideal: number, max: number},

				facingMode : 'environment' | 'user' | 'left' | 'right' | { exact: 'environment' | ... }
			}

		See https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia for more information about the
		width, height and facingMode attributes.

		@param {object} configuration The configuration object.
		@return {VideoElement} Returns the created video element.
	*/
	ARController.getUserMedia = function(configuration) {
		var facing = configuration.facingMode || 'environment';

		var onSuccess = configuration.onSuccess;
		var onError = configuration.onError || function(err) { console.error("ARController.getUserMedia", err); };

		var video = document.createElement('video');

		var initProgress = function() {
			if (this.videoWidth !== 0) {
				onSuccess(video);
			}
		};

		var readyToPlay = false;
		var eventNames = [
			'touchstart', 'touchend', 'touchmove', 'touchcancel',
			'click', 'mousedown', 'mouseup', 'mousemove',
			'keydown', 'keyup', 'keypress', 'scroll'
		];
		var play = function(ev) {
			if (readyToPlay) {
				video.play();
				if (!video.paused) {
					eventNames.forEach(function(eventName) {
						window.removeEventListener(eventName, play, true);
					});
				}
			}
		};
		eventNames.forEach(function(eventName) {
			window.addEventListener(eventName, play, true);
		});

		var success = function(stream) {
			video.addEventListener('loadedmetadata', initProgress, false);
			video.src = window.URL.createObjectURL(stream);
			readyToPlay = true;
			play(); // Try playing without user input, should work on non-Android Chrome
		};

		var constraints = {};
		var mediaDevicesConstraints = {};
		if (configuration.width) {
			mediaDevicesConstraints.width = configuration.width;
			if (typeof configuration.width === 'object') {
				if (configuration.width.max) {
					constraints.maxWidth = configuration.width.max;
				}
				if (configuration.width.min) {
					constraints.minWidth = configuration.width.max;
				}
			} else {
				constraints.maxWidth = configuration.width;
			}
		}

		if (configuration.height) {
			mediaDevicesConstraints.height = configuration.height;
			if (typeof configuration.height === 'object') {
				if (configuration.height.max) {
					constraints.maxHeight = configuration.height.max;
				}
				if (configuration.height.min) {
					constraints.minHeight = configuration.height.max;
				}
			} else {
				constraints.maxHeight = configuration.height;
			}
		}

		mediaDevicesConstraints.facingMode = facing;

		navigator.getUserMedia  = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
		var hdConstraints = {
			audio: false,
			video: {
				mandatory: constraints
		  	}
		};

		if ( false ) {
		// if ( navigator.mediaDevices || window.MediaStreamTrack) {
			if (navigator.mediaDevices) {
				navigator.mediaDevices.getUserMedia({
					audio: false,
					video: mediaDevicesConstraints
				}).then(success, onError); 
			} else {
				MediaStreamTrack.getSources(function(sources) {
					var facingDir = mediaDevicesConstraints.facingMode;
					if (facing && facing.exact) {
						facingDir = facing.exact;
					}
					for (var i=0; i<sources.length; i++) {
						if (sources[i].kind === 'video' && sources[i].facing === facingDir) {
							hdConstraints.video.mandatory.sourceId = sources[i].id;
							break;
						}
					}
					if (facing && facing.exact && !hdConstraints.video.mandatory.sourceId) {
						onError('Failed to get camera facing the wanted direction');
					} else {
						if (navigator.getUserMedia) {
							navigator.getUserMedia(hdConstraints, success, onError);
						} else {
							onError('navigator.getUserMedia is not supported on your browser');
						}
					}
				});
			}
		} else {
			if (navigator.getUserMedia) {
				navigator.getUserMedia(hdConstraints, success, onError);
			} else {
				onError('navigator.getUserMedia is not supported on your browser');
			}
		}

		return video;
	};

	/**
		ARController.getUserMediaARController gets an ARController for the device camera video feed and calls the 
		given onSuccess callback with it.

		To use ARController.getUserMediaARController, call it with an object with the cameraParam attribute set to
		a camera parameter file URL, and the onSuccess attribute set to a callback function.

			ARController.getUserMediaARController({
				cameraParam: 'Data/camera_para.dat',
				onSuccess: function(arController, arCameraParam) {
					console.log("Got ARController", arController);
					console.log("Got ARCameraParam", arCameraParam);
					console.log("Got video", arController.image);
				}
			});

		The configuration object supports the following attributes:

			{
				onSuccess : function(ARController, ARCameraParam),
				onError : function(error),

				cameraParam: url, // URL to camera parameters definition file.
				maxARVideoSize: number, // Maximum max(width, height) for the AR processing canvas.

				width : number | {min: number, ideal: number, max: number},
				height : number | {min: number, ideal: number, max: number},

				facingMode : 'environment' | 'user' | 'left' | 'right' | { exact: 'environment' | ... }
			}

		See https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia for more information about the
		width, height and facingMode attributes.

		The orientation attribute of the returned ARController is set to "portrait" if the userMedia video has larger
		height than width. Otherwise it's set to "landscape". The videoWidth and videoHeight attributes of the arController
		are set to be always in landscape configuration so that width is larger than height.

		@param {object} configuration The configuration object.
		@return {VideoElement} Returns the created video element.
	*/
	ARController.getUserMediaARController = function(configuration) {
		var obj = {};
		for (var i in configuration) {
			obj[i] = configuration[i];
		}
		var onSuccess = configuration.onSuccess;
		var cameraParamURL = configuration.cameraParam;

		obj.onSuccess = function() {
			new ARCameraParam(cameraParamURL, function() {
				var arCameraParam = this;
				var maxSize = configuration.maxARVideoSize || Math.max(video.videoWidth, video.videoHeight);
				var f = maxSize / Math.max(video.videoWidth, video.videoHeight);
				var w = f * video.videoWidth;
				var h = f * video.videoHeight;
				if (video.videoWidth < video.videoHeight) {
					var tmp = w;
					w = h;
					h = tmp;
				}
				var arController = new ARController(w, h, arCameraParam);
				arController.image = video;
				if (video.videoWidth < video.videoHeight) {
					arController.orientation = 'portrait';
					arController.videoWidth = video.videoHeight;
					arController.videoHeight = video.videoWidth;
				} else {
					arController.orientation = 'landscape';
					arController.videoWidth = video.videoWidth;
					arController.videoHeight = video.videoHeight;
				}
				onSuccess(arController, arCameraParam);
			}, function(err) {
				console.error("ARController: Failed to load ARCameraParam", err);
			});
		};

		var video = this.getUserMedia(obj);
		return video;
	};


	/** 
		ARCameraParam is used for loading AR camera parameters for use with ARController.
		Use by passing in an URL and a callback function.

			var camera = new ARCameraParam('Data/camera_para.dat', function() {
				console.log('loaded camera', this.id);
			},
			function(err) {
				console.log('failed to load camera', err);
			});

		@exports ARCameraParam
		@constructor
	 
		@param {string} src URL to load camera parameters from.
		@param {string} onload Onload callback to be called on successful parameter loading.
		@param {string} onerror Error callback to called when things don't work out.
	*/
	var ARCameraParam = function(src, onload, onerror) {
		this.id = -1;
		this._src = '';
		this.complete = false;
		this.onload = onload;
		this.onerror = onerror;
		if (src) {
			this.load(src);
		}
	};

	/** 
		Loads the given URL as camera parameters definition file into this ARCameraParam.

		Can only be called on an unloaded ARCameraParam instance. 

		@param {string} src URL to load.
	*/
	ARCameraParam.prototype.load = function(src) {
		if (this._src !== '') {
			throw("ARCameraParam: Trying to load camera parameters twice.")
		}
		this._src = src;
		if (src) {
			var self = this;
			artoolkit.loadCamera(src, function(id) {
				self.id = id;
				self.complete = true;
				self.onload();
			}, function(err) {
				self.onerror(err);
			});
		}
	};

	Object.defineProperty(ARCameraParam.prototype, 'src', {
		set: function(src) {
			this.load(src);
		},
		get: function() {
			return this._src;
		}
	});

	/**
		Destroys the camera parameter and frees associated Emscripten resources.

	*/
	ARCameraParam.prototype.dispose = function() {
		if (this.id !== -1) {
			artoolkit.deleteCamera(this.id);
		}
		this.id = -1;
		this._src = '';
		this.complete = false;
	};



	// ARToolKit exported JS API
	//
	var artoolkit = {

		UNKNOWN_MARKER: -1,
		PATTERN_MARKER: 0,
		BARCODE_MARKER: 1,

		loadCamera: loadCamera,

		addMarker: addMarker,
		addMultiMarker: addMultiMarker,

	};

	var FUNCTIONS = [
		'setup',
		'teardown',

		'setLogLevel',
		'getLogLevel',

		'setDebugMode',
		'getDebugMode',

		'getProcessingImage',

		'setMarkerInfoDir',
		'setMarkerInfoVertex',

		'getTransMatSquare',
		'getTransMatSquareCont',

		'getTransMatMultiSquare',
		'getTransMatMultiSquareRobust',

		'getMultiMarkerNum',
		'getMultiMarkerCount',

		'detectMarker',
		'getMarkerNum',

		'getMarker',
		'getMultiEachMarker',

		'setProjectionNearPlane',
		'getProjectionNearPlane',

		'setProjectionFarPlane',
		'getProjectionFarPlane',

		'setThresholdMode',
		'getThresholdMode',

		'setThreshold',
		'getThreshold',

		'setPatternDetectionMode',
		'getPatternDetectionMode',

		'setMatrixCodeType',
		'getMatrixCodeType',

		'setLabelingMode',
		'getLabelingMode',

		'setPattRatio',
		'getPattRatio',

		'setImageProcMode',
		'getImageProcMode',
	];

	function runWhenLoaded() {
		FUNCTIONS.forEach(function(n) {
			artoolkit[n] = Module[n];
		})

		for (var m in Module) {
			if (m.match(/^AR/))
			artoolkit[m] = Module[m];
		}
	}

	var marker_count = 0;
	function addMarker(arId, url, callback) {
		var filename = '/marker_' + marker_count++;
		ajax(url, filename, function() {
			var id = Module._addMarker(arId, filename);
			if (callback) callback(id);
		});
	}

	function bytesToString(array) {
		return String.fromCharCode.apply(String, array);
	}

	function parseMultiFile(bytes) {
		var str = bytesToString(bytes);

		var lines = str.split('\n');

		var files = [];

		var state = 0; // 0 - read,
		var markers = 0;

		lines.forEach(function(line) {
			line = line.trim();
			if (!line || line.startsWith('#')) return;

			switch (state) {
				case 0:
					markers = +line;
					state = 1;
					return;
				case 1: // filename or barcode
					if (!line.match(/^\d+$/)) {
						files.push(line);
					}
				case 2: // width
				case 3: // matrices
				case 4:
					state++;
					return;
				case 5:
					state = 1;
					return;
			}
		});

		return files;
	}

	var multi_marker_count = 0;

	function addMultiMarker(arId, url, callback) {
		var filename = '/multi_marker_' + multi_marker_count++;
		ajax(url, filename, function(bytes) {
			var files = parseMultiFile(bytes);

			function ok() {
				var markerID = Module._addMultiMarker(arId, filename);
				var markerNum = Module.getMultiMarkerNum(arId, markerID);
				if (callback) callback(markerID, markerNum);
			}

			if (!files.length) return ok();

			var path = url.split('/').slice(0, -1).join('/')
			files = files.map(function(file) {
				// FIXME super kludge - remove it
				// console.assert(file !== '')
				if( file === 'patt.hiro' || file === 'patt.kanji' || file === 'patt2.hiro' || file === 'patt2.kanji' ){
					// debugger
					return ['http://127.0.0.1:8080/data/data/' + file, file]
				}
				return [path + '/' + file, file]
			})
			ajaxDependencies(files, ok);
		});
	}

	var camera_count = 0;
	function loadCamera(url, callback) {
		var filename = '/camera_param_' + camera_count++;
		var writeCallback = function() {
			var id = Module._loadCamera(filename);
			if (callback) callback(id);
		};
		if (typeof url === 'object') { // Maybe it's a byte array
			writeByteArrayToFS(filename, url, writeCallback);
		} else if (url.indexOf("\n") > -1) { // Or a string with the camera param
			writeStringToFS(filename, url, writeCallback);
		} else {
			ajax(url, filename, writeCallback);
		}
	}


	// transfer image

	function writeStringToFS(target, string, callback) {
		var byteArray = new Uint8Array(string.length);
		for (var i=0; i<byteArray.length; i++) {
			byteArray[i] = string.charCodeAt(i) & 0xff;
		}
		writeByteArrayToFS(target, byteArray, callback);
	}

	function writeByteArrayToFS(target, byteArray, callback) {
		FS.writeFile(target, byteArray, { encoding: 'binary' });
		// console.log('FS written', target);

		callback(byteArray);
	}

	// Eg.
	//	ajax('../bin/Data2/markers.dat', '/Data2/markers.dat', callback);
	//	ajax('../bin/Data/patt.hiro', '/patt.hiro', callback);

	function ajax(url, target, callback) {
		var oReq = new XMLHttpRequest();
		oReq.open('GET', url, true);
		oReq.responseType = 'arraybuffer'; // blob arraybuffer

		oReq.onload = function(oEvent) {
			// console.log('ajax done for ', url);
			var arrayBuffer = oReq.response;
			var byteArray = new Uint8Array(arrayBuffer);
	// console.log('writeByteArrayToFS', target, byteArray.length, 'byte. url', url)
			writeByteArrayToFS(target, byteArray, callback);
		};

		oReq.send();
	}

	function ajaxDependencies(files, callback) {
		var next = files.pop();
		if (next) {
			ajax(next[0], next[1], function() {
				ajaxDependencies(files, callback);
			});
		} else {
			callback();
		}
	}

	/* Exports */
	window.artoolkit = artoolkit;
	window.ARController = ARController;
	window.ARCameraParam = ARCameraParam;

	if (window.Module) {
		runWhenLoaded();
	} else {
		window.Module = {
			onRuntimeInitialized: function() {
				runWhenLoaded();
			}
		};
	}

})();
/*

 JS Signals <http://millermedeiros.github.com/js-signals/>
 Released under the MIT license
 Author: Miller Medeiros
 Version: 0.7.4 - Build: 252 (2012/02/24 10:30 PM)
*/
(function(h){function g(a,b,c,d,e){this._listener=b;this._isOnce=c;this.context=d;this._signal=a;this._priority=e||0}function f(a,b){if(typeof a!=="function")throw Error("listener is a required param of {fn}() and should be a Function.".replace("{fn}",b));}var e={VERSION:"0.7.4"};g.prototype={active:!0,params:null,execute:function(a){var b;this.active&&this._listener&&(a=this.params?this.params.concat(a):a,b=this._listener.apply(this.context,a),this._isOnce&&this.detach());return b},detach:function(){return this.isBound()?
this._signal.remove(this._listener,this.context):null},isBound:function(){return!!this._signal&&!!this._listener},getListener:function(){return this._listener},_destroy:function(){delete this._signal;delete this._listener;delete this.context},isOnce:function(){return this._isOnce},toString:function(){return"[SignalBinding isOnce:"+this._isOnce+", isBound:"+this.isBound()+", active:"+this.active+"]"}};e.Signal=function(){this._bindings=[];this._prevParams=null};e.Signal.prototype={memorize:!1,_shouldPropagate:!0,
active:!0,_registerListener:function(a,b,c,d){var e=this._indexOfListener(a,c);if(e!==-1){if(a=this._bindings[e],a.isOnce()!==b)throw Error("You cannot add"+(b?"":"Once")+"() then add"+(!b?"":"Once")+"() the same listener without removing the relationship first.");}else a=new g(this,a,b,c,d),this._addBinding(a);this.memorize&&this._prevParams&&a.execute(this._prevParams);return a},_addBinding:function(a){var b=this._bindings.length;do--b;while(this._bindings[b]&&a._priority<=this._bindings[b]._priority);
this._bindings.splice(b+1,0,a)},_indexOfListener:function(a,b){for(var c=this._bindings.length,d;c--;)if(d=this._bindings[c],d._listener===a&&d.context===b)return c;return-1},has:function(a,b){return this._indexOfListener(a,b)!==-1},add:function(a,b,c){f(a,"add");return this._registerListener(a,!1,b,c)},addOnce:function(a,b,c){f(a,"addOnce");return this._registerListener(a,!0,b,c)},remove:function(a,b){f(a,"remove");var c=this._indexOfListener(a,b);c!==-1&&(this._bindings[c]._destroy(),this._bindings.splice(c,
1));return a},removeAll:function(){for(var a=this._bindings.length;a--;)this._bindings[a]._destroy();this._bindings.length=0},getNumListeners:function(){return this._bindings.length},halt:function(){this._shouldPropagate=!1},dispatch:function(a){if(this.active){var b=Array.prototype.slice.call(arguments),c=this._bindings.length,d;if(this.memorize)this._prevParams=b;if(c){d=this._bindings.slice();this._shouldPropagate=!0;do c--;while(d[c]&&this._shouldPropagate&&d[c].execute(b)!==!1)}}},forget:function(){this._prevParams=
null},dispose:function(){this.removeAll();delete this._bindings;delete this._prevParams},toString:function(){return"[Signal active:"+this.active+" numListeners:"+this.getNumListeners()+"]"}};typeof define==="function"&&define.amd?define(e):typeof module!=="undefined"&&module.exports?module.exports=e:h.signals=e})(this);var THREEx = THREEx || {}

THREEx.ArBaseControls = function(object3d){
	this.id = THREEx.ArBaseControls.id++

	this.object3d = object3d
	this.object3d.matrixAutoUpdate = false;
	this.object3d.visible = false

	// Events to honor
	// this.dispatchEvent({ type: 'becameVisible' })
	// this.dispatchEvent({ type: 'markerVisible' })	// replace markerFound
	// this.dispatchEvent({ type: 'becameUnVisible' })
}

THREEx.ArBaseControls.id = 0

Object.assign( THREEx.ArBaseControls.prototype, THREE.EventDispatcher.prototype );

//////////////////////////////////////////////////////////////////////////////
//		Functions
//////////////////////////////////////////////////////////////////////////////
/**
 * error catching function for update()
 */
THREEx.ArBaseControls.prototype.update = function(){
	console.assert(false, 'you need to implement your own update')
}

/**
 * error catching function for name()
 */
THREEx.ArBaseControls.prototype.name = function(){
	console.assert(false, 'you need to implement your own .name()')
	return 'Not yet implemented - name()'
}
var THREEx = THREEx || {}

// TODO this is useless - prefere arjs-HitTesting.js

/**
 * - maybe support .onClickFcts in each object3d
 * - seems an easy light layer for clickable object
 * - up to
 */
THREEx.ARClickability = function(sourceElement){
	this._sourceElement = sourceElement
	// Create cameraPicking
	var fullWidth = parseInt(sourceElement.style.width)
	var fullHeight = parseInt(sourceElement.style.height)
	this._cameraPicking = new THREE.PerspectiveCamera(42, fullWidth / fullHeight, 0.1, 100);

console.warn('THREEx.ARClickability works only in modelViewMatrix')
console.warn('OBSOLETE OBSOLETE! instead use THREEx.HitTestingPlane or THREEx.HitTestingTango')
}

THREEx.ARClickability.prototype.onResize = function(){
	var sourceElement = this._sourceElement
	var cameraPicking = this._cameraPicking

	var fullWidth = parseInt(sourceElement.style.width)
	var fullHeight = parseInt(sourceElement.style.height)
	cameraPicking.aspect = fullWidth / fullHeight;
	cameraPicking.updateProjectionMatrix();
}

THREEx.ARClickability.prototype.computeIntersects = function(domEvent, objects){
	var sourceElement = this._sourceElement
	var cameraPicking = this._cameraPicking

	// compute mouse coordinatge with [-1,1]
	var eventCoords = new THREE.Vector3();
	eventCoords.x =   ( domEvent.layerX / parseInt(sourceElement.style.width)  ) * 2 - 1;
	eventCoords.y = - ( domEvent.layerY / parseInt(sourceElement.style.height) ) * 2 + 1;

	// compute intersections between eventCoords and pickingPlane
	var raycaster = new THREE.Raycaster();
	raycaster.setFromCamera( eventCoords, cameraPicking );
	var intersects = raycaster.intersectObjects( objects )

	return intersects
}

THREEx.ARClickability.prototype.update = function(){

}
var THREEx = THREEx || {}
/**
 * - videoTexture
 * - cloakWidth
 * - cloakHeight
 * - cloakSegmentsHeight
 * - remove all mentions of cache, for cloak
 */
THREEx.ArMarkerCloak = function(videoTexture){
        var updateInShaderEnabled = true

        // build cloakMesh
        // TODO if webgl2 use repeat warp, and not multi segment, this will reduce the geometry to draw
	var geometry = new THREE.PlaneGeometry(1.3+0.25,1.85+0.25, 1, 8).translate(0,-0.3,0)
	var material = new THREE.ShaderMaterial( {
		vertexShader: THREEx.ArMarkerCloak.vertexShader,
		fragmentShader: THREEx.ArMarkerCloak.fragmentShader,
                transparent: true,
		uniforms: {
			texture: {
				value: videoTexture
			},
                        opacity: {
                                value: 0.5
                        }
		},
		defines: {
			updateInShaderEnabled: updateInShaderEnabled ? 1 : 0,
		}
	});

	var cloakMesh = new THREE.Mesh( geometry, material );
        cloakMesh.rotation.x = -Math.PI/2
	this.object3d = cloakMesh

	//////////////////////////////////////////////////////////////////////////////
	//		Code Separator
	//////////////////////////////////////////////////////////////////////////////

	var xMin = -0.65
	var xMax =  0.65
	var yMin =  0.65 + 0.1
	var yMax =  0.95 + 0.1

	//////////////////////////////////////////////////////////////////////////////
	//		originalsFaceVertexUvs
	//////////////////////////////////////////////////////////////////////////////
        var originalsFaceVertexUvs = [[]]

        // build originalsFaceVertexUvs array
	for(var faceIndex = 0; faceIndex < cloakMesh.geometry.faces.length; faceIndex ++ ){
		originalsFaceVertexUvs[0][faceIndex] = []
		originalsFaceVertexUvs[0][faceIndex][0] = new THREE.Vector2()
		originalsFaceVertexUvs[0][faceIndex][1] = new THREE.Vector2()
		originalsFaceVertexUvs[0][faceIndex][2] = new THREE.Vector2()
        }

	// set values in originalsFaceVertexUvs
	for(var i = 0; i < cloakMesh.geometry.parameters.heightSegments/2; i ++ ){
		// one segment height - even row - normale orientation
		originalsFaceVertexUvs[0][i*4+0][0].set( xMin/2+0.5, yMax/2+0.5 )
		originalsFaceVertexUvs[0][i*4+0][1].set( xMin/2+0.5, yMin/2+0.5 )
		originalsFaceVertexUvs[0][i*4+0][2].set( xMax/2+0.5, yMax/2+0.5 )
		
		originalsFaceVertexUvs[0][i*4+1][0].set( xMin/2+0.5, yMin/2+0.5 )
		originalsFaceVertexUvs[0][i*4+1][1].set( xMax/2+0.5, yMin/2+0.5 )
		originalsFaceVertexUvs[0][i*4+1][2].set( xMax/2+0.5, yMax/2+0.5 )

		// one segment height - odd row - mirror-y orientation
		originalsFaceVertexUvs[0][i*4+2][0].set( xMin/2+0.5, yMin/2+0.5 )
		originalsFaceVertexUvs[0][i*4+2][1].set( xMin/2+0.5, yMax/2+0.5 )
		originalsFaceVertexUvs[0][i*4+2][2].set( xMax/2+0.5, yMin/2+0.5 )
		
		originalsFaceVertexUvs[0][i*4+3][0].set( xMin/2+0.5, yMax/2+0.5 )
		originalsFaceVertexUvs[0][i*4+3][1].set( xMax/2+0.5, yMax/2+0.5 )
		originalsFaceVertexUvs[0][i*4+3][2].set( xMax/2+0.5, yMin/2+0.5 )
	}

        if( updateInShaderEnabled === true ){
                cloakMesh.geometry.faceVertexUvs = originalsFaceVertexUvs
                cloakMesh.geometry.uvsNeedUpdate = true                
        }

	//////////////////////////////////////////////////////////////////////////////
	//		Code Separator
	//////////////////////////////////////////////////////////////////////////////

	var originalOrthoVertices = []
	originalOrthoVertices.push( new THREE.Vector3(xMin, yMax, 0))
	originalOrthoVertices.push( new THREE.Vector3(xMax, yMax, 0))
	originalOrthoVertices.push( new THREE.Vector3(xMin, yMin, 0))
	originalOrthoVertices.push( new THREE.Vector3(xMax, yMin, 0))

	// build debugMesh
        var material = new THREE.MeshNormalMaterial({
		transparent : true,
		opacity: 0.5,
		side: THREE.DoubleSide
	});
        var geometry = new THREE.PlaneGeometry(1,1);
        var orthoMesh = new THREE.Mesh(geometry, material);
	this.orthoMesh = orthoMesh

        //////////////////////////////////////////////////////////////////////////////
        //                Code Separator
        //////////////////////////////////////////////////////////////////////////////

	this.update = function(modelViewMatrix, cameraProjectionMatrix){
                updateOrtho(modelViewMatrix, cameraProjectionMatrix)

                if( updateInShaderEnabled === false ){
                        updateUvs(modelViewMatrix, cameraProjectionMatrix)
                }
	}
        
        return

        // update cloakMesh
	function updateUvs(modelViewMatrix, cameraProjectionMatrix){
		var transformedUv = new THREE.Vector3()
                originalsFaceVertexUvs[0].forEach(function(faceVertexUvs, faceIndex){
                        faceVertexUvs.forEach(function(originalUv, uvIndex){
                                // set transformedUv - from UV coord to clip coord
                                transformedUv.x = originalUv.x * 2.0 - 1.0;
                                transformedUv.y = originalUv.y * 2.0 - 1.0;
                                transformedUv.z = 0
        			// apply modelViewMatrix and projectionMatrix
        			transformedUv.applyMatrix4( modelViewMatrix )
        			transformedUv.applyMatrix4( cameraProjectionMatrix )
        			// apply perspective
        			transformedUv.x /= transformedUv.z
        			transformedUv.y /= transformedUv.z
                                // set back from clip coord to Uv coord
                                transformedUv.x = transformedUv.x / 2.0 + 0.5;
                                transformedUv.y = transformedUv.y / 2.0 + 0.5;
                                // copy the trasnformedUv into the geometry
                                cloakMesh.geometry.faceVertexUvs[0][faceIndex][uvIndex].set(transformedUv.x, transformedUv.y)
                        })
                })
        
                // cloakMesh.geometry.faceVertexUvs = faceVertexUvs
                cloakMesh.geometry.uvsNeedUpdate = true
        }

        // update orthoMesh
	function updateOrtho(modelViewMatrix, cameraProjectionMatrix){
		// compute transformedUvs
		var transformedUvs = []
		originalOrthoVertices.forEach(function(originalOrthoVertices, index){
			var transformedUv = originalOrthoVertices.clone()
			// apply modelViewMatrix and projectionMatrix
			transformedUv.applyMatrix4( modelViewMatrix )
			transformedUv.applyMatrix4( cameraProjectionMatrix )
			// apply perspective
			transformedUv.x /= transformedUv.z
			transformedUv.y /= transformedUv.z
			// store it
			transformedUvs.push(transformedUv)
		})

		// change orthoMesh vertices
		for(var i = 0; i < transformedUvs.length; i++){
			orthoMesh.geometry.vertices[i].copy(transformedUvs[i])
		}
		orthoMesh.geometry.computeBoundingSphere()
		orthoMesh.geometry.verticesNeedUpdate = true
        }

}

//////////////////////////////////////////////////////////////////////////////
//                Shaders
//////////////////////////////////////////////////////////////////////////////

THREEx.ArMarkerCloak.markerSpaceShaderFunction = '\n'+
'        vec2 transformUvToMarkerSpace(vec2 originalUv){\n'+
'                vec3 transformedUv;\n'+
'                // set transformedUv - from UV coord to clip coord\n'+
'                transformedUv.x = originalUv.x * 2.0 - 1.0;\n'+
'                transformedUv.y = originalUv.y * 2.0 - 1.0;\n'+
'                transformedUv.z = 0.0;\n'+
'\n'+
'		// apply modelViewMatrix and projectionMatrix\n'+
'                transformedUv = (projectionMatrix * modelViewMatrix * vec4( transformedUv, 1.0 ) ).xyz;\n'+
'\n'+
'		// apply perspective\n'+
'		transformedUv.x /= transformedUv.z;\n'+
'		transformedUv.y /= transformedUv.z;\n'+
'\n'+
'                // set back from clip coord to Uv coord\n'+
'                transformedUv.x = transformedUv.x / 2.0 + 0.5;\n'+
'                transformedUv.y = transformedUv.y / 2.0 + 0.5;\n'+
'\n'+
'                // return the result\n'+
'                return transformedUv.xy;\n'+
'        }'

THREEx.ArMarkerCloak.vertexShader = THREEx.ArMarkerCloak.markerSpaceShaderFunction +
'	varying vec2 vUv;\n'+
'\n'+
'	void main(){\n'+
'                // pass the UV to the fragment\n'+
'                #if (updateInShaderEnabled == 1)\n'+
'		        vUv = transformUvToMarkerSpace(uv);\n'+
'                #else\n'+
'		        vUv = uv;\n'+
'                #endif\n'+
'\n'+
'                // compute gl_Position\n'+
'		vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n'+
'		gl_Position = projectionMatrix * mvPosition;\n'+
'	}';

THREEx.ArMarkerCloak.fragmentShader = '\n'+
'	varying vec2 vUv;\n'+
'	uniform sampler2D texture;\n'+
'	uniform float opacity;\n'+
'\n'+
'	void main(void){\n'+
'		vec3 color = texture2D( texture, vUv ).rgb;\n'+
'\n'+
'		gl_FragColor = vec4( color, opacity);\n'+
'	}'
var ARjs = ARjs || {}
var THREEx = THREEx || {}

ARjs.MarkerControls = THREEx.ArMarkerControls = function (context, object3d, parameters) {
    var _this = this

    THREEx.ArBaseControls.call(this, object3d)

    this.context = context
    // handle default parameters
    this.parameters = {
        // size of the marker in meter
        size: 1,
        // type of marker - ['pattern', 'barcode', 'unknown' ]
        type: 'unknown',
        // url of the pattern - IIF type='pattern'
        patternUrl: null,
        // value of the barcode - IIF type='barcode'
        barcodeValue: null,
        // change matrix mode - [modelViewMatrix, cameraTransformMatrix]
        changeMatrixMode: 'modelViewMatrix',
        // minimal confidence in the marke recognition - between [0, 1] - default to 1
        minConfidence: 0.6,
        // turn on/off camera smoothing
        smooth: false,
        // number of matrices to smooth tracking over, more = smoother but slower follow
        smoothCount: 5,
        // distance tolerance for smoothing, if smoothThreshold # of matrices are under tolerance, tracking will stay still
        smoothTolerance: 0.01,
        // threshold for smoothing, will keep still unless enough matrices are over tolerance
        smoothThreshold: 2,
    }

    // sanity check
    var possibleValues = ['pattern', 'barcode', 'unknown']
    console.assert(possibleValues.indexOf(this.parameters.type) !== -1, 'illegal value', this.parameters.type)
    var possibleValues = ['modelViewMatrix', 'cameraTransformMatrix']
    console.assert(possibleValues.indexOf(this.parameters.changeMatrixMode) !== -1, 'illegal value', this.parameters.changeMatrixMode)


    // create the marker Root
    this.object3d = object3d
    this.object3d.matrixAutoUpdate = false;
    this.object3d.visible = false

    //////////////////////////////////////////////////////////////////////////////
    //		setParameters
    //////////////////////////////////////////////////////////////////////////////
    setParameters(parameters)
    function setParameters(parameters) {
        if (parameters === undefined) return
        for (var key in parameters) {
            var newValue = parameters[key]

            if (newValue === undefined) {
                console.warn("THREEx.ArMarkerControls: '" + key + "' parameter is undefined.")
                continue
            }

            var currentValue = _this.parameters[key]

            if (currentValue === undefined) {
                console.warn("THREEx.ArMarkerControls: '" + key + "' is not a property of this material.")
                continue
            }

            _this.parameters[key] = newValue
        }
    }

    if (this.parameters.smooth) {
        this.smoothMatrices = []; // last DEBOUNCE_COUNT modelViewMatrix
    }

    //////////////////////////////////////////////////////////////////////////////
    //		Code Separator
    //////////////////////////////////////////////////////////////////////////////
    // add this marker to artoolkitsystem
    // TODO rename that .addMarkerControls
    context.addMarker(this)

    if (_this.context.parameters.trackingBackend === 'artoolkit') {
        this._initArtoolkit()
    } else if (_this.context.parameters.trackingBackend === 'aruco') {
        // TODO create a ._initAruco
        // put aruco second
        this._arucoPosit = new POS.Posit(this.parameters.size, _this.context.arucoContext.canvas.width)
    } else console.assert(false)
}

ARjs.MarkerControls.prototype = Object.create(THREEx.ArBaseControls.prototype);
ARjs.MarkerControls.prototype.constructor = THREEx.ArMarkerControls;

ARjs.MarkerControls.prototype.dispose = function () {
    this.context.removeMarker(this)

    // TODO remove the event listener if needed
    // unloadMaker ???
}

//////////////////////////////////////////////////////////////////////////////
//		update controls with new modelViewMatrix
//////////////////////////////////////////////////////////////////////////////

/**
 * When you actually got a new modelViewMatrix, you need to perfom a whole bunch
 * of things. it is done here.
 */
ARjs.MarkerControls.prototype.updateWithModelViewMatrix = function (modelViewMatrix) {
    var markerObject3D = this.object3d;

    // mark object as visible
    markerObject3D.visible = true

    if (this.context.parameters.trackingBackend === 'artoolkit') {
        // apply context._axisTransformMatrix - change artoolkit axis to match usual webgl one
        var tmpMatrix = new THREE.Matrix4().copy(this.context._artoolkitProjectionAxisTransformMatrix)
        tmpMatrix.multiply(modelViewMatrix)

        modelViewMatrix.copy(tmpMatrix)
    } else if (this.context.parameters.trackingBackend === 'aruco') {
        // ...
    } else console.assert(false)

    var renderReqd = false;

    // change markerObject3D.matrix based on parameters.changeMatrixMode
    if (this.parameters.changeMatrixMode === 'modelViewMatrix') {
        if (this.parameters.smooth) {
            var sum,
                i, j,
                averages, // average values for matrix over last smoothCount
                exceedsAverageTolerance = 0;

            this.smoothMatrices.push(modelViewMatrix.elements.slice()); // add latest

            if (this.smoothMatrices.length < (this.parameters.smoothCount + 1)) {
                markerObject3D.matrix.copy(modelViewMatrix); // not enough for average
            } else {
                this.smoothMatrices.shift(); // remove oldest entry
                averages = [];

                for (i in modelViewMatrix.elements) { // loop over entries in matrix
                    sum = 0;
                    for (j in this.smoothMatrices) { // calculate average for this entry
                        sum += this.smoothMatrices[j][i];
                    }
                    averages[i] = sum / this.parameters.smoothCount;
                    // check how many elements vary from the average by at least AVERAGE_MATRIX_TOLERANCE
                    if (Math.abs(averages[i] - modelViewMatrix.elements[i]) >= this.parameters.smoothTolerance) {
                        exceedsAverageTolerance++;
                    }
                }

                // if moving (i.e. at least AVERAGE_MATRIX_THRESHOLD entries are over AVERAGE_MATRIX_TOLERANCE)
                if (exceedsAverageTolerance >= this.parameters.smoothThreshold) {
                    // then update matrix values to average, otherwise, don't render to minimize jitter
                    for (i in modelViewMatrix.elements) {
                        modelViewMatrix.elements[i] = averages[i];
                    }
                    markerObject3D.matrix.copy(modelViewMatrix);
                    renderReqd = true; // render required in animation loop
                }
            }
        } else {
            markerObject3D.matrix.copy(modelViewMatrix)
        }
    } else if (this.parameters.changeMatrixMode === 'cameraTransformMatrix') {
        markerObject3D.matrix.getInverse(modelViewMatrix)
    } else {
        console.assert(false)
    }

    // decompose - the matrix into .position, .quaternion, .scale
    markerObject3D.matrix.decompose(markerObject3D.position, markerObject3D.quaternion, markerObject3D.scale)

    // dispatchEvent
    this.dispatchEvent({ type: 'markerFound' });

    return renderReqd;
}

//////////////////////////////////////////////////////////////////////////////
//		utility functions
//////////////////////////////////////////////////////////////////////////////

/**
 * provide a name for a marker
 * - silly heuristic for now
 * - should be improved
 */
ARjs.MarkerControls.prototype.name = function () {
    var name = ''
    name += this.parameters.type;
    if (this.parameters.type === 'pattern') {
        var url = this.parameters.patternUrl
        var basename = url.replace(/^.*\//g, '')
        name += ' - ' + basename
    } else if (this.parameters.type === 'barcode') {
        name += ' - ' + this.parameters.barcodeValue
    } else {
        console.assert(false, 'no .name() implemented for this marker controls')
    }
    return name
}

//////////////////////////////////////////////////////////////////////////////
//		init for Artoolkit
//////////////////////////////////////////////////////////////////////////////
ARjs.MarkerControls.prototype._initArtoolkit = function () {
    var _this = this

    var artoolkitMarkerId = null

    var delayedInitTimerId = setInterval(function () {
        // check if arController is init
        var arController = _this.context.arController
        if (arController === null) return
        // stop looping if it is init
        clearInterval(delayedInitTimerId)
        delayedInitTimerId = null
        // launch the _postInitArtoolkit
        postInit()
    }, 1000 / 50)

    return

    function postInit() {
        // check if arController is init
        var arController = _this.context.arController
        console.assert(arController !== null)

        // start tracking this pattern
        if (_this.parameters.type === 'pattern') {
            arController.loadMarker(_this.parameters.patternUrl, function (markerId) {
                artoolkitMarkerId = markerId
                arController.trackPatternMarkerId(artoolkitMarkerId, _this.parameters.size);
            });
        } else if (_this.parameters.type === 'barcode') {
            artoolkitMarkerId = _this.parameters.barcodeValue
            arController.trackBarcodeMarkerId(artoolkitMarkerId, _this.parameters.size);
        } else if (_this.parameters.type === 'unknown') {
            artoolkitMarkerId = null
        } else {
            console.log(false, 'invalid marker type', _this.parameters.type)
        }

        // listen to the event
        arController.addEventListener('getMarker', function (event) {
            if (event.data.type === artoolkit.PATTERN_MARKER && _this.parameters.type === 'pattern') {
                if (artoolkitMarkerId === null) return
                if (event.data.marker.idPatt === artoolkitMarkerId) onMarkerFound(event)
            } else if (event.data.type === artoolkit.BARCODE_MARKER && _this.parameters.type === 'barcode') {
                // console.log('BARCODE_MARKER idMatrix', event.data.marker.idMatrix, artoolkitMarkerId )
                if (artoolkitMarkerId === null) return
                if (event.data.marker.idMatrix === artoolkitMarkerId) onMarkerFound(event)
            } else if (event.data.type === artoolkit.UNKNOWN_MARKER && _this.parameters.type === 'unknown') {
                onMarkerFound(event)
            }
        })

    }

    function onMarkerFound(event) {
        // honor his.parameters.minConfidence
        if (event.data.type === artoolkit.PATTERN_MARKER && event.data.marker.cfPatt < _this.parameters.minConfidence) return
        if (event.data.type === artoolkit.BARCODE_MARKER && event.data.marker.cfMatt < _this.parameters.minConfidence) return

        var modelViewMatrix = new THREE.Matrix4().fromArray(event.data.matrix)
        _this.updateWithModelViewMatrix(modelViewMatrix)
    }
}

//////////////////////////////////////////////////////////////////////////////
//		aruco specific
//////////////////////////////////////////////////////////////////////////////
ARjs.MarkerControls.prototype._initAruco = function () {
    this._arucoPosit = new POS.Posit(this.parameters.size, _this.context.arucoContext.canvas.width)
}
var THREEx = THREEx || {}

THREEx.ArMarkerHelper = function(markerControls){
	this.object3d = new THREE.Group

	var mesh = new THREE.AxesHelper()
	this.object3d.add(mesh)

	var text = markerControls.id
	// debugger
	// var text = markerControls.parameters.patternUrl.slice(-1).toUpperCase();

	var canvas = document.createElement( 'canvas' );
	canvas.width =  64;
	canvas.height = 64;

	var context = canvas.getContext( '2d' );
	var texture = new THREE.CanvasTexture( canvas );

	// put the text in the sprite
	context.font = '48px monospace';
	context.fillStyle = 'rgba(192,192,255, 0.5)';
	context.fillRect( 0, 0, canvas.width, canvas.height );
	context.fillStyle = 'darkblue';
	context.fillText(text, canvas.width/4, 3*canvas.height/4 )
	texture.needsUpdate = true

	// var geometry = new THREE.CubeGeometry(1, 1, 1)
	var geometry = new THREE.PlaneGeometry(1, 1)
	var material = new THREE.MeshBasicMaterial({
		map: texture,
		transparent: true
	});
	var mesh = new THREE.Mesh(geometry, material)
	mesh.rotation.x = -Math.PI/2

	this.object3d.add(mesh)

}
var THREEx = THREEx || {}

/**
 * - lerp position/quaternino/scale
 * - minDelayDetected
 * - minDelayUndetected
 * @param {[type]} object3d   [description]
 * @param {[type]} parameters [description]
 */
THREEx.ArSmoothedControls = function(object3d, parameters){
	var _this = this
	
	THREEx.ArBaseControls.call(this, object3d)
	
	// copy parameters
	this.object3d.visible = false
	
	this._lastLerpStepAt = null
	this._visibleStartedAt = null
	this._unvisibleStartedAt = null

	// handle default parameters
	parameters = parameters || {}
	this.parameters = {
		// lerp coeficient for the position - between [0,1] - default to 1
		lerpPosition: 0.8,
		// lerp coeficient for the quaternion - between [0,1] - default to 1
		lerpQuaternion: 0.2,
		// lerp coeficient for the scale - between [0,1] - default to 1
		lerpScale: 0.7,
		// delay for lerp fixed steps - in seconds - default to 1/120
		lerpStepDelay: 1/60,
		// minimum delay the sub-control must be visible before this controls become visible - default to 0 seconds
		minVisibleDelay: 0.0,
		// minimum delay the sub-control must be unvisible before this controls become unvisible - default to 0 seconds
		minUnvisibleDelay: 0.2,
	}
	
	//////////////////////////////////////////////////////////////////////////////
	//		setParameters
	//////////////////////////////////////////////////////////////////////////////
	setParameters(parameters)
	function setParameters(parameters){
		if( parameters === undefined )	return
		for( var key in parameters ){
			var newValue = parameters[ key ]

			if( newValue === undefined ){
				console.warn( "THREEx.ArSmoothedControls: '" + key + "' parameter is undefined." )
				continue
			}

			var currentValue = _this.parameters[ key ]

			if( currentValue === undefined ){
				console.warn( "THREEx.ArSmoothedControls: '" + key + "' is not a property of this material." )
				continue
			}

			_this.parameters[ key ] = newValue
		}
	}
}
	
THREEx.ArSmoothedControls.prototype = Object.create( THREEx.ArBaseControls.prototype );
THREEx.ArSmoothedControls.prototype.constructor = THREEx.ArSmoothedControls;

//////////////////////////////////////////////////////////////////////////////
//		update function
//////////////////////////////////////////////////////////////////////////////

THREEx.ArSmoothedControls.prototype.update = function(targetObject3d){
	var object3d = this.object3d
	var parameters = this.parameters
	var wasVisible = object3d.visible
	var present = performance.now()/1000


	//////////////////////////////////////////////////////////////////////////////
	//		handle object3d.visible with minVisibleDelay/minUnvisibleDelay
	//////////////////////////////////////////////////////////////////////////////
	if( targetObject3d.visible === false )	this._visibleStartedAt = null
	if( targetObject3d.visible === true )	this._unvisibleStartedAt = null

	if( targetObject3d.visible === true && this._visibleStartedAt === null )	this._visibleStartedAt = present
	if( targetObject3d.visible === false && this._unvisibleStartedAt === null )	this._unvisibleStartedAt = present

	if( wasVisible === false && targetObject3d.visible === true ){
		var visibleFor = present - this._visibleStartedAt
		if( visibleFor >= this.parameters.minVisibleDelay ){
			object3d.visible = true
			snapDirectlyToTarget()
		}
		// console.log('visibleFor', visibleFor)
	}

	if( wasVisible === true && targetObject3d.visible === false ){
		var unvisibleFor = present - this._unvisibleStartedAt
		if( unvisibleFor >= this.parameters.minUnvisibleDelay ){
			object3d.visible = false			
		}
	}
	
	//////////////////////////////////////////////////////////////////////////////
	//		apply lerp on positon/quaternion/scale
	//////////////////////////////////////////////////////////////////////////////

	// apply lerp steps - require fix time steps to behave the same no matter the fps
	if( this._lastLerpStepAt === null ){
		applyOneSlerpStep()
		this._lastLerpStepAt = present
	}else{
		var nStepsToDo = Math.floor( (present - this._lastLerpStepAt)/this.parameters.lerpStepDelay )
		for(var i = 0; i < nStepsToDo; i++){
			applyOneSlerpStep()
			this._lastLerpStepAt += this.parameters.lerpStepDelay
		}
	}

	// disable the lerp by directly copying targetObject3d position/quaternion/scale
	if( false ){		
		snapDirectlyToTarget()
	}

	// update the matrix
	this.object3d.updateMatrix()

	//////////////////////////////////////////////////////////////////////////////
	//		honor becameVisible/becameUnVisible event
	//////////////////////////////////////////////////////////////////////////////
	// honor becameVisible event
	if( wasVisible === false && object3d.visible === true ){
		this.dispatchEvent({ type: 'becameVisible' })
	}
	// honor becameUnVisible event
	if( wasVisible === true && object3d.visible === false ){
		this.dispatchEvent({ type: 'becameUnVisible' })
	}
	return

	function snapDirectlyToTarget(){
		object3d.position.copy( targetObject3d.position )
		object3d.quaternion.copy( targetObject3d.quaternion )
		object3d.scale.copy( targetObject3d.scale )
	}	
	
	function applyOneSlerpStep(){
		object3d.position.lerp(targetObject3d.position, parameters.lerpPosition)
		object3d.quaternion.slerp(targetObject3d.quaternion, parameters.lerpQuaternion)
		object3d.scale.lerp(targetObject3d.scale, parameters.lerpScale)
	}
}
var ARjs = ARjs || {}
var THREEx = THREEx || {}

ARjs.Context = THREEx.ArToolkitContext = function (parameters) {
    var _this = this

    _this._updatedAt = null

    // handle default parameters
    this.parameters = {
        // AR backend - ['artoolkit', 'aruco']
        trackingBackend: 'artoolkit',
        // debug - true if one should display artoolkit debug canvas, false otherwise
        debug: false,
        // the mode of detection - ['color', 'color_and_matrix', 'mono', 'mono_and_matrix']
        detectionMode: 'mono',
        // type of matrix code - valid iif detectionMode end with 'matrix' - [3x3, 3x3_HAMMING63, 3x3_PARITY65, 4x4, 4x4_BCH_13_9_3, 4x4_BCH_13_5_5]
        matrixCodeType: '3x3',

        // url of the camera parameters
        cameraParametersUrl: ARjs.Context.baseURL + 'parameters/camera_para.dat',

        // tune the maximum rate of pose detection in the source image
        maxDetectionRate: 60,
        // resolution of at which we detect pose in the source image
        canvasWidth: 640,
        canvasHeight: 480,

        // the patternRatio inside the artoolkit marker - artoolkit only
        patternRatio: 0.5,

        // enable image smoothing or not for canvas copy - default to true
        // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/imageSmoothingEnabled
        imageSmoothingEnabled: false,
    }
    // parameters sanity check
    console.assert(['artoolkit', 'aruco'].indexOf(this.parameters.trackingBackend) !== -1, 'invalid parameter trackingBackend', this.parameters.trackingBackend)
    console.assert(['color', 'color_and_matrix', 'mono', 'mono_and_matrix'].indexOf(this.parameters.detectionMode) !== -1, 'invalid parameter detectionMode', this.parameters.detectionMode)

    this.arController = null;
    this.arucoContext = null;

    _this.initialized = false


    this._arMarkersControls = []

    //////////////////////////////////////////////////////////////////////////////
    //		setParameters
    //////////////////////////////////////////////////////////////////////////////
    setParameters(parameters)
    function setParameters(parameters) {
        if (parameters === undefined) return
        for (var key in parameters) {
            var newValue = parameters[key]

            if (newValue === undefined) {
                console.warn("THREEx.ArToolkitContext: '" + key + "' parameter is undefined.")
                continue
            }

            var currentValue = _this.parameters[key]

            if (currentValue === undefined) {
                console.warn("THREEx.ArToolkitContext: '" + key + "' is not a property of this material.")
                continue
            }

            _this.parameters[key] = newValue
        }
    }
}

Object.assign(ARjs.Context.prototype, THREE.EventDispatcher.prototype);

// ARjs.Context.baseURL = '../'
// default to github page
ARjs.Context.baseURL = 'https://jeromeetienne.github.io/AR.js/three.js/'
ARjs.Context.REVISION = '2.0.8';

/**
 * Create a default camera for this trackingBackend
 * @param {string} trackingBackend - the tracking to user
 * @return {THREE.Camera} the created camera
 */
ARjs.Context.createDefaultCamera = function (trackingBackend) {
    console.assert(false, 'use ARjs.Utils.createDefaultCamera instead')
    // Create a camera
    if (trackingBackend === 'artoolkit') {
        var camera = new THREE.Camera();
    } else if (trackingBackend === 'aruco') {
        var camera = new THREE.PerspectiveCamera(42, renderer.domElement.width / renderer.domElement.height, 0.01, 100);
    } else console.assert(false)
    return camera
}


//////////////////////////////////////////////////////////////////////////////
//		init functions
//////////////////////////////////////////////////////////////////////////////
ARjs.Context.prototype.init = function (onCompleted) {
    var _this = this
    if (this.parameters.trackingBackend === 'artoolkit') {
        this._initArtoolkit(done)
    } else if (this.parameters.trackingBackend === 'aruco') {
        this._initAruco(done)
    } else console.assert(false)
    return

    function done() {
        // dispatch event
        _this.dispatchEvent({
            type: 'initialized'
        });

        _this.initialized = true

        onCompleted && onCompleted()
    }

}
////////////////////////////////////////////////////////////////////////////////
//          update function
////////////////////////////////////////////////////////////////////////////////
ARjs.Context.prototype.update = function (srcElement) {

    // be sure arController is fully initialized
    if (this.parameters.trackingBackend === 'artoolkit' && this.arController === null) return false;

    // honor this.parameters.maxDetectionRate
    var present = performance.now()
    if (this._updatedAt !== null && present - this._updatedAt < 1000 / this.parameters.maxDetectionRate) {
        return false
    }
    this._updatedAt = present

    // mark all markers to invisible before processing this frame
    this._arMarkersControls.forEach(function (markerControls) {
        markerControls.object3d.visible = false
    })

    // process this frame
    if (this.parameters.trackingBackend === 'artoolkit') {
        this._updateArtoolkit(srcElement)
    } else if (this.parameters.trackingBackend === 'aruco') {
        this._updateAruco(srcElement)
    } else {
        console.assert(false)
    }

    // dispatch event
    this.dispatchEvent({
        type: 'sourceProcessed'
    });


    // return true as we processed the frame
    return true;
}

////////////////////////////////////////////////////////////////////////////////
//          Add/Remove markerControls
////////////////////////////////////////////////////////////////////////////////
ARjs.Context.prototype.addMarker = function (arMarkerControls) {
    console.assert(arMarkerControls instanceof THREEx.ArMarkerControls)
    this._arMarkersControls.push(arMarkerControls)
}

ARjs.Context.prototype.removeMarker = function (arMarkerControls) {
    console.assert(arMarkerControls instanceof THREEx.ArMarkerControls)
    // console.log('remove marker for', arMarkerControls)
    var index = this.arMarkerControlss.indexOf(artoolkitMarker);
    console.assert(index !== index)
    this._arMarkersControls.splice(index, 1)
}

//////////////////////////////////////////////////////////////////////////////
//		artoolkit specific
//////////////////////////////////////////////////////////////////////////////
ARjs.Context.prototype._initArtoolkit = function (onCompleted) {
    var _this = this

    // set this._artoolkitProjectionAxisTransformMatrix to change artoolkit projection matrix axis to match usual webgl one
    this._artoolkitProjectionAxisTransformMatrix = new THREE.Matrix4()
    this._artoolkitProjectionAxisTransformMatrix.multiply(new THREE.Matrix4().makeRotationY(Math.PI))
    this._artoolkitProjectionAxisTransformMatrix.multiply(new THREE.Matrix4().makeRotationZ(Math.PI))

    // get cameraParameters
    var cameraParameters = new ARCameraParam(_this.parameters.cameraParametersUrl, function () {
        // init controller
        var arController = new ARController(_this.parameters.canvasWidth, _this.parameters.canvasHeight, cameraParameters);
        _this.arController = arController

        // honor this.parameters.imageSmoothingEnabled
        arController.ctx.mozImageSmoothingEnabled = _this.parameters.imageSmoothingEnabled;
        arController.ctx.webkitImageSmoothingEnabled = _this.parameters.imageSmoothingEnabled;
        arController.ctx.msImageSmoothingEnabled = _this.parameters.imageSmoothingEnabled;
        arController.ctx.imageSmoothingEnabled = _this.parameters.imageSmoothingEnabled;

        // honor this.parameters.debug
        if (_this.parameters.debug === true) {
            arController.debugSetup();
            arController.canvas.style.position = 'absolute'
            arController.canvas.style.top = '0px'
            arController.canvas.style.opacity = '0.6'
            arController.canvas.style.pointerEvents = 'none'
            arController.canvas.style.zIndex = '-1'
        }

        // setPatternDetectionMode
        var detectionModes = {
            'color': artoolkit.AR_TEMPLATE_MATCHING_COLOR,
            'color_and_matrix': artoolkit.AR_TEMPLATE_MATCHING_COLOR_AND_MATRIX,
            'mono': artoolkit.AR_TEMPLATE_MATCHING_MONO,
            'mono_and_matrix': artoolkit.AR_TEMPLATE_MATCHING_MONO_AND_MATRIX,
        }
        var detectionMode = detectionModes[_this.parameters.detectionMode]
        console.assert(detectionMode !== undefined)
        arController.setPatternDetectionMode(detectionMode);

        // setMatrixCodeType
        var matrixCodeTypes = {
            '3x3': artoolkit.AR_MATRIX_CODE_3x3,
            '3x3_HAMMING63': artoolkit.AR_MATRIX_CODE_3x3_HAMMING63,
            '3x3_PARITY65': artoolkit.AR_MATRIX_CODE_3x3_PARITY65,
            '4x4': artoolkit.AR_MATRIX_CODE_4x4,
            '4x4_BCH_13_9_3': artoolkit.AR_MATRIX_CODE_4x4_BCH_13_9_3,
            '4x4_BCH_13_5_5': artoolkit.AR_MATRIX_CODE_4x4_BCH_13_5_5,
        }
        var matrixCodeType = matrixCodeTypes[_this.parameters.matrixCodeType]
        console.assert(matrixCodeType !== undefined)
        arController.setMatrixCodeType(matrixCodeType);

        // set the patternRatio for artoolkit
        arController.setPattRatio(_this.parameters.patternRatio);

        // set thresholding in artoolkit
        // this seems to be the default
        // arController.setThresholdMode(artoolkit.AR_LABELING_THRESH_MODE_MANUAL)
        // adatative consume a LOT of cpu...
        // arController.setThresholdMode(artoolkit.AR_LABELING_THRESH_MODE_AUTO_ADAPTIVE)
        // arController.setThresholdMode(artoolkit.AR_LABELING_THRESH_MODE_AUTO_OTSU)

        // notify
        onCompleted()
    })
    return this
}

/**
 * return the projection matrix
 */
ARjs.Context.prototype.getProjectionMatrix = function (srcElement) {


    // FIXME rename this function to say it is artoolkit specific - getArtoolkitProjectMatrix
    // keep a backward compatibility with a console.warn

    console.assert(this.parameters.trackingBackend === 'artoolkit')
    console.assert(this.arController, 'arController MUST be initialized to call this function')
    // get projectionMatrixArr from artoolkit
    var projectionMatrixArr = this.arController.getCameraMatrix();
    var projectionMatrix = new THREE.Matrix4().fromArray(projectionMatrixArr)

    // apply context._axisTransformMatrix - change artoolkit axis to match usual webgl one
    projectionMatrix.multiply(this._artoolkitProjectionAxisTransformMatrix)

    // return the result
    return projectionMatrix
}

ARjs.Context.prototype._updateArtoolkit = function (srcElement) {
    this.arController.process(srcElement)
}

//////////////////////////////////////////////////////////////////////////////
//		aruco specific
//////////////////////////////////////////////////////////////////////////////
ARjs.Context.prototype._initAruco = function (onCompleted) {
    this.arucoContext = new THREEx.ArucoContext()

    // honor this.parameters.canvasWidth/.canvasHeight
    this.arucoContext.canvas.width = this.parameters.canvasWidth
    this.arucoContext.canvas.height = this.parameters.canvasHeight

    // honor this.parameters.imageSmoothingEnabled
    var context = this.arucoContext.canvas.getContext('2d')
    // context.mozImageSmoothingEnabled = this.parameters.imageSmoothingEnabled;
    context.webkitImageSmoothingEnabled = this.parameters.imageSmoothingEnabled;
    context.msImageSmoothingEnabled = this.parameters.imageSmoothingEnabled;
    context.imageSmoothingEnabled = this.parameters.imageSmoothingEnabled;


    setTimeout(function () {
        onCompleted()
    }, 0)
}


ARjs.Context.prototype._updateAruco = function (srcElement) {
    // console.log('update aruco here')
    var _this = this
    var arMarkersControls = this._arMarkersControls
    var detectedMarkers = this.arucoContext.detect(srcElement)

    detectedMarkers.forEach(function (detectedMarker) {
        var foundControls = null
        for (var i = 0; i < arMarkersControls.length; i++) {
            console.assert(arMarkersControls[i].parameters.type === 'barcode')
            if (arMarkersControls[i].parameters.barcodeValue === detectedMarker.id) {
                foundControls = arMarkersControls[i]
                break;
            }
        }
        if (foundControls === null) return

        var tmpObject3d = new THREE.Object3D
        _this.arucoContext.updateObject3D(tmpObject3d, foundControls._arucoPosit, foundControls.parameters.size, detectedMarker);
        tmpObject3d.updateMatrix()

        foundControls.updateWithModelViewMatrix(tmpObject3d.matrix)
    })
}
var ARjs = ARjs || {}
var THREEx = THREEx || {}

/**
 * ArToolkitProfile helps you build parameters for artoolkit
 * - it is fully independent of the rest of the code
 * - all the other classes are still expecting normal parameters
 * - you can use this class to understand how to tune your specific usecase
 * - it is made to help people to build parameters without understanding all the underlying details.
 */
ARjs.Profile = THREEx.ArToolkitProfile = function () {
    this.reset()

    this.performance('default')
}


ARjs.Profile.prototype._guessPerformanceLabel = function () {
    var isMobile = navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i)
        ? true : false
    if (isMobile === true) {
        return 'phone-normal'
    }
    return 'desktop-normal'
}

//////////////////////////////////////////////////////////////////////////////
//		Code Separator
//////////////////////////////////////////////////////////////////////////////

/**
 * reset all parameters
 */
ARjs.Profile.prototype.reset = function () {
    this.sourceParameters = {
        // to read from the webcam
        sourceType: 'webcam',
    }

    this.contextParameters = {
        cameraParametersUrl: THREEx.ArToolkitContext.baseURL + '../data/data/camera_para.dat',
        detectionMode: 'mono',
    }
    this.defaultMarkerParameters = {
        type: 'pattern',
        patternUrl: THREEx.ArToolkitContext.baseURL + '../data/data/patt.hiro',
        changeMatrixMode: 'modelViewMatrix',
    }
    return this
};

//////////////////////////////////////////////////////////////////////////////
//		Performance
//////////////////////////////////////////////////////////////////////////////



ARjs.Profile.prototype.performance = function (label) {

    if (label === 'default') {
        label = this._guessPerformanceLabel()
    }

    if (label === 'desktop-fast') {
        this.contextParameters.canvasWidth = 640 * 3
        this.contextParameters.canvasHeight = 480 * 3

        this.contextParameters.maxDetectionRate = 30
    } else if (label === 'desktop-normal') {
        this.contextParameters.canvasWidth = 640
        this.contextParameters.canvasHeight = 480

        this.contextParameters.maxDetectionRate = 60
    } else if (label === 'phone-normal') {
        this.contextParameters.canvasWidth = 80 * 4
        this.contextParameters.canvasHeight = 60 * 4

        this.contextParameters.maxDetectionRate = 30
    } else if (label === 'phone-slow') {
        this.contextParameters.canvasWidth = 80 * 3
        this.contextParameters.canvasHeight = 60 * 3

        this.contextParameters.maxDetectionRate = 30
    } else {
        console.assert(false, 'unknonwn label ' + label)
    }
    return this
}

//////////////////////////////////////////////////////////////////////////////
//		Marker
//////////////////////////////////////////////////////////////////////////////


ARjs.Profile.prototype.defaultMarker = function (trackingBackend) {
    trackingBackend = trackingBackend || this.contextParameters.trackingBackend

    if (trackingBackend === 'artoolkit') {
        this.contextParameters.detectionMode = 'mono'
        this.defaultMarkerParameters.type = 'pattern'
        this.defaultMarkerParameters.patternUrl = THREEx.ArToolkitContext.baseURL + '../data/data/patt.hiro'
    } else if (trackingBackend === 'aruco') {
        this.contextParameters.detectionMode = 'mono'
        this.defaultMarkerParameters.type = 'barcode'
        this.defaultMarkerParameters.barcodeValue = 1001
    } else console.assert(false)

    return this
}
//////////////////////////////////////////////////////////////////////////////
//		Source
//////////////////////////////////////////////////////////////////////////////
ARjs.Profile.prototype.sourceWebcam = function () {
    this.sourceParameters.sourceType = 'webcam'
    delete this.sourceParameters.sourceUrl
    return this
}

ARjs.Profile.prototype.sourceVideo = function (url) {
    this.sourceParameters.sourceType = 'video'
    this.sourceParameters.sourceUrl = url
    return this
}

ARjs.Profile.prototype.sourceImage = function (url) {
    this.sourceParameters.sourceType = 'image'
    this.sourceParameters.sourceUrl = url
    return this
}

//////////////////////////////////////////////////////////////////////////////
//		trackingBackend
//////////////////////////////////////////////////////////////////////////////
ARjs.Profile.prototype.trackingBackend = function (trackingBackend) {
    console.warn('stop profile.trackingBackend() obsolete function. use .trackingMethod instead')
    this.contextParameters.trackingBackend = trackingBackend
    return this
}

//////////////////////////////////////////////////////////////////////////////
//		trackingBackend
//////////////////////////////////////////////////////////////////////////////
ARjs.Profile.prototype.changeMatrixMode = function (changeMatrixMode) {
    this.defaultMarkerParameters.changeMatrixMode = changeMatrixMode
    return this
}

//////////////////////////////////////////////////////////////////////////////
//		trackingBackend
//////////////////////////////////////////////////////////////////////////////
ARjs.Profile.prototype.trackingMethod = function (trackingMethod) {
    var data = ARjs.Utils.parseTrackingMethod(trackingMethod)
    this.defaultMarkerParameters.markersAreaEnabled = data.markersAreaEnabled
    this.contextParameters.trackingBackend = data.trackingBackend
    return this
}

/**
 * check if the profile is valid. Throw an exception is not valid
 */
ARjs.Profile.prototype.checkIfValid = function () {
    return this
}
var ARjs = ARjs || {}
var THREEx = THREEx || {}

ARjs.Source = THREEx.ArToolkitSource = function (parameters) {
    var _this = this

    this.ready = false
    this.domElement = null

    // handle default parameters
    this.parameters = {
        // type of source - ['webcam', 'image', 'video']
        sourceType: 'webcam',
        // url of the source - valid if sourceType = image|video
        sourceUrl: null,

        // Device id of the camera to use (optional)
        deviceId: null,

        // resolution of at which we initialize in the source image
        sourceWidth: 640,
        sourceHeight: 480,
        // resolution displayed for the source
        displayWidth: 640,
        displayHeight: 480,
    }
    //////////////////////////////////////////////////////////////////////////////
    //		setParameters
    //////////////////////////////////////////////////////////////////////////////
    setParameters(parameters)
    function setParameters(parameters) {
        if (parameters === undefined) return
        for (var key in parameters) {
            var newValue = parameters[key]

            if (newValue === undefined) {
                console.warn("THREEx.ArToolkitSource: '" + key + "' parameter is undefined.")
                continue
            }

            var currentValue = _this.parameters[key]

            if (currentValue === undefined) {
                console.warn("THREEx.ArToolkitSource: '" + key + "' is not a property of this material.")
                continue
            }

            _this.parameters[key] = newValue
        }
    }
}

//////////////////////////////////////////////////////////////////////////////
//		Code Separator
//////////////////////////////////////////////////////////////////////////////
ARjs.Source.prototype.init = function (onReady, onError) {
    var _this = this

    if (this.parameters.sourceType === 'image') {
        var domElement = this._initSourceImage(onSourceReady, onError)
    } else if (this.parameters.sourceType === 'video') {
        var domElement = this._initSourceVideo(onSourceReady, onError)
    } else if (this.parameters.sourceType === 'webcam') {
        // var domElement = this._initSourceWebcamOld(onSourceReady)
        var domElement = this._initSourceWebcam(onSourceReady, onError)
    } else {
        console.assert(false)
    }

    // attach
    this.domElement = domElement
    this.domElement.style.position = 'absolute'
    this.domElement.style.top = '0px'
    this.domElement.style.left = '0px'
    this.domElement.style.zIndex = '-2'
    this.domElement.setAttribute('id', 'arjs-video');

    return this
    function onSourceReady() {
        document.body.appendChild(_this.domElement);
        window.dispatchEvent(new CustomEvent('arjs-video-loaded', {
            detail: {
                component: document.querySelector('#arjs-video'),
            },
        }));

        _this.ready = true

        onReady && onReady()
    }
}

////////////////////////////////////////////////////////////////////////////////
//          init image source
////////////////////////////////////////////////////////////////////////////////


ARjs.Source.prototype._initSourceImage = function (onReady) {
    // TODO make it static
    var domElement = document.createElement('img')
    domElement.src = this.parameters.sourceUrl

    domElement.width = this.parameters.sourceWidth
    domElement.height = this.parameters.sourceHeight
    domElement.style.width = this.parameters.displayWidth + 'px'
    domElement.style.height = this.parameters.displayHeight + 'px'

    // wait until the video stream is ready
    var interval = setInterval(function () {
        if (!domElement.naturalWidth) return;
        onReady()
        clearInterval(interval)
    }, 1000 / 50);

    return domElement
}

////////////////////////////////////////////////////////////////////////////////
//          init video source
////////////////////////////////////////////////////////////////////////////////


ARjs.Source.prototype._initSourceVideo = function (onReady) {
    // TODO make it static
    var domElement = document.createElement('video');
    domElement.src = this.parameters.sourceUrl

    domElement.style.objectFit = 'initial'

    domElement.autoplay = true;
    domElement.webkitPlaysinline = true;
    domElement.controls = false;
    domElement.loop = true;
    domElement.muted = true

    // trick to trigger the video on android
    document.body.addEventListener('click', function onClick() {
        document.body.removeEventListener('click', onClick);
        domElement.play()
    })

    domElement.width = this.parameters.sourceWidth
    domElement.height = this.parameters.sourceHeight
    domElement.style.width = this.parameters.displayWidth + 'px'
    domElement.style.height = this.parameters.displayHeight + 'px'

    // wait until the video stream is ready
    var interval = setInterval(function () {
        if (!domElement.videoWidth) return;
        onReady()
        clearInterval(interval)
    }, 1000 / 50);
    return domElement
}

////////////////////////////////////////////////////////////////////////////////
//          handle webcam source
////////////////////////////////////////////////////////////////////////////////

ARjs.Source.prototype._initSourceWebcam = function (onReady, onError) {
    var _this = this

    // init default value
    onError = onError || function (error) {
        alert('Webcam Error\nName: ' + error.name + '\nMessage: ' + error.message)
        var event = new CustomEvent('camera-error', { error: error });
        window.dispatchEvent(event);
    }

    var domElement = document.createElement('video');
    domElement.setAttribute('autoplay', '');
    domElement.setAttribute('muted', '');
    domElement.setAttribute('playsinline', '');
    domElement.style.width = this.parameters.displayWidth + 'px'
    domElement.style.height = this.parameters.displayHeight + 'px'

    // check API is available
    if (navigator.mediaDevices === undefined
        || navigator.mediaDevices.enumerateDevices === undefined
        || navigator.mediaDevices.getUserMedia === undefined) {
        if (navigator.mediaDevices === undefined) var fctName = 'navigator.mediaDevices'
        else if (navigator.mediaDevices.enumerateDevices === undefined) var fctName = 'navigator.mediaDevices.enumerateDevices'
        else if (navigator.mediaDevices.getUserMedia === undefined) var fctName = 'navigator.mediaDevices.getUserMedia'
        else console.assert(false)
        onError({
            name: '',
            message: 'WebRTC issue-! ' + fctName + ' not present in your browser'
        })
        return null
    }

    // get available devices
    navigator.mediaDevices.enumerateDevices().then(function (devices) {
        var userMediaConstraints = {
            audio: false,
            video: {
                facingMode: 'environment',
                width: {
                    ideal: _this.parameters.sourceWidth,
                    // min: 1024,
                    // max: 1920
                },
                height: {
                    ideal: _this.parameters.sourceHeight,
                    // min: 776,
                    // max: 1080
                }
            }
        }

        if (null !== _this.parameters.deviceId) {
            userMediaConstraints.video.deviceId = {
                exact: _this.parameters.deviceId
            };
        }

        // get a device which satisfy the constraints
        navigator.mediaDevices.getUserMedia(userMediaConstraints).then(function success(stream) {
            // set the .src of the domElement
            domElement.srcObject = stream;

            var event = new CustomEvent('camera-init', { stream: stream });
            window.dispatchEvent(event);
            // to start the video, when it is possible to start it only on userevent. like in android
            document.body.addEventListener('click', function () {
                domElement.play();
            });
            // domElement.play();

            // TODO listen to loadedmetadata instead
            // wait until the video stream is ready
            var interval = setInterval(function () {
                if (!domElement.videoWidth) return;
                onReady()
                clearInterval(interval)
            }, 1000 / 50);
        }).catch(function (error) {
            onError({
                name: error.name,
                message: error.message
            });
        });
    }).catch(function (error) {
        onError({
            message: error.message
        });
    });

    return domElement
}

//////////////////////////////////////////////////////////////////////////////
//		Handle Mobile Torch
//////////////////////////////////////////////////////////////////////////////
ARjs.Source.prototype.hasMobileTorch = function () {
    var stream = arToolkitSource.domElement.srcObject
    if (stream instanceof MediaStream === false) return false

    if (this._currentTorchStatus === undefined) {
        this._currentTorchStatus = false
    }

    var videoTrack = stream.getVideoTracks()[0];

    // if videoTrack.getCapabilities() doesnt exist, return false now
    if (videoTrack.getCapabilities === undefined) return false

    var capabilities = videoTrack.getCapabilities()

    return capabilities.torch ? true : false
}

/**
 * toggle the flash/torch of the mobile fun if applicable.
 * Great post about it https://www.oberhofer.co/mediastreamtrack-and-its-capabilities/
 */
ARjs.Source.prototype.toggleMobileTorch = function () {
    // sanity check
    console.assert(this.hasMobileTorch() === true)

    var stream = arToolkitSource.domElement.srcObject
    if (stream instanceof MediaStream === false) {
        alert('enabling mobile torch is available only on webcam')
        return
    }

    if (this._currentTorchStatus === undefined) {
        this._currentTorchStatus = false
    }

    var videoTrack = stream.getVideoTracks()[0];
    var capabilities = videoTrack.getCapabilities()

    if (!capabilities.torch) {
        alert('no mobile torch is available on your camera')
        return
    }

    this._currentTorchStatus = this._currentTorchStatus === false ? true : false
    videoTrack.applyConstraints({
        advanced: [{
            torch: this._currentTorchStatus
        }]
    }).catch(function (error) {
        console.log(error)
    });
}

ARjs.Source.prototype.domElementWidth = function () {
    return parseInt(this.domElement.style.width)
}
ARjs.Source.prototype.domElementHeight = function () {
    return parseInt(this.domElement.style.height)
}

////////////////////////////////////////////////////////////////////////////////
//          handle resize
////////////////////////////////////////////////////////////////////////////////

ARjs.Source.prototype.onResizeElement = function () {
    var _this = this
    var screenWidth = window.innerWidth
    var screenHeight = window.innerHeight

    // sanity check
    console.assert(arguments.length === 0)

    // compute sourceWidth, sourceHeight
    if (this.domElement.nodeName === "IMG") {
        var sourceWidth = this.domElement.naturalWidth
        var sourceHeight = this.domElement.naturalHeight
    } else if (this.domElement.nodeName === "VIDEO") {
        var sourceWidth = this.domElement.videoWidth
        var sourceHeight = this.domElement.videoHeight
    } else {
        console.assert(false)
    }

    // compute sourceAspect
    var sourceAspect = sourceWidth / sourceHeight
    // compute screenAspect
    var screenAspect = screenWidth / screenHeight

    // if screenAspect < sourceAspect, then change the width, else change the height
    if (screenAspect < sourceAspect) {
        // compute newWidth and set .width/.marginLeft
        var newWidth = sourceAspect * screenHeight
        this.domElement.style.width = newWidth + 'px'
        this.domElement.style.marginLeft = -(newWidth - screenWidth) / 2 + 'px'

        // init style.height/.marginTop to normal value
        this.domElement.style.height = screenHeight + 'px'
        this.domElement.style.marginTop = '0px'
    } else {
        // compute newHeight and set .height/.marginTop
        var newHeight = 1 / (sourceAspect / screenWidth)
        this.domElement.style.height = newHeight + 'px'
        this.domElement.style.marginTop = -(newHeight - screenHeight) / 2 + 'px'

        // init style.width/.marginLeft to normal value
        this.domElement.style.width = screenWidth + 'px'
        this.domElement.style.marginLeft = '0px'
    }
}
/*
ARjs.Source.prototype.copyElementSizeTo = function(otherElement){
	otherElement.style.width = this.domElement.style.width
	otherElement.style.height = this.domElement.style.height
	otherElement.style.marginLeft = this.domElement.style.marginLeft
	otherElement.style.marginTop = this.domElement.style.marginTop
}
*/

ARjs.Source.prototype.copyElementSizeTo = function (otherElement) {

    if (window.innerWidth > window.innerHeight) {
        //landscape
        otherElement.style.width = this.domElement.style.width
        otherElement.style.height = this.domElement.style.height
        otherElement.style.marginLeft = this.domElement.style.marginLeft
        otherElement.style.marginTop = this.domElement.style.marginTop
    }
    else {
        //portrait
        otherElement.style.height = this.domElement.style.height
        otherElement.style.width = (parseInt(otherElement.style.height) * 4 / 3) + "px";
        otherElement.style.marginLeft = ((window.innerWidth - parseInt(otherElement.style.width)) / 2) + "px";
        otherElement.style.marginTop = 0;
    }

}

//////////////////////////////////////////////////////////////////////////////
//		Code Separator
//////////////////////////////////////////////////////////////////////////////

ARjs.Source.prototype.copySizeTo = function () {
    console.warn('obsolete function arToolkitSource.copySizeTo. Use arToolkitSource.copyElementSizeTo')
    this.copyElementSizeTo.apply(this, arguments)
}

//////////////////////////////////////////////////////////////////////////////
//		Code Separator
//////////////////////////////////////////////////////////////////////////////

ARjs.Source.prototype.onResize = function (arToolkitContext, renderer, camera) {
    if (arguments.length !== 3) {
        console.warn('obsolete function arToolkitSource.onResize. Use arToolkitSource.onResizeElement')
        return this.onResizeElement.apply(this, arguments)
    }

    var trackingBackend = arToolkitContext.parameters.trackingBackend


    // RESIZE DOMELEMENT
    if (trackingBackend === 'artoolkit') {

        this.onResizeElement()

        var isAframe = renderer.domElement.dataset.aframeCanvas ? true : false
        if (isAframe === false) {
            this.copyElementSizeTo(renderer.domElement)
        } else {

        }

        if (arToolkitContext.arController !== null) {
            this.copyElementSizeTo(arToolkitContext.arController.canvas)
        }
    } else if (trackingBackend === 'aruco') {
        this.onResizeElement()
        this.copyElementSizeTo(renderer.domElement)

        this.copyElementSizeTo(arToolkitContext.arucoContext.canvas)
    } else console.assert(false, 'unhandled trackingBackend ' + trackingBackend)


    // UPDATE CAMERA
    if (trackingBackend === 'artoolkit') {
        if (arToolkitContext.arController !== null) {
            camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
        }
    } else if (trackingBackend === 'aruco') {
        camera.aspect = renderer.domElement.width / renderer.domElement.height;
        camera.updateProjectionMatrix();
    } else console.assert(false, 'unhandled trackingBackend ' + trackingBackend)
}
var THREEx = THREEx || {}

THREEx.ArVideoInWebgl = function(videoTexture){	
	var _this = this
	
	//////////////////////////////////////////////////////////////////////////////
	//	plane always in front of the camera, exactly as big as the viewport
	//////////////////////////////////////////////////////////////////////////////
	var geometry = new THREE.PlaneGeometry(2, 2);
	var material = new THREE.MeshBasicMaterial({
		// map : new THREE.TextureLoader().load('images/water.jpg'),
		map : videoTexture,
		// side: THREE.DoubleSide,
		// opacity: 0.5,
		// color: 'pink',
		// transparent: true,
	});
	var seethruPlane = new THREE.Mesh(geometry, material);
	this.object3d = seethruPlane
	// scene.add(seethruPlane);
	
	// arToolkitSource.domElement.style.visibility = 'hidden'

	// TODO extract the fov from the projectionMatrix
	// camera.fov = 43.1
	this.update = function(camera){
		camera.updateMatrixWorld(true)
		
		// get seethruPlane position
		var position = new THREE.Vector3(-0,0,-20)	// TODO how come you got that offset on x ???
		var position = new THREE.Vector3(-0,0,-20)	// TODO how come you got that offset on x ???
		seethruPlane.position.copy(position)
		camera.localToWorld(seethruPlane.position)
		
		// get seethruPlane quaternion
		camera.matrixWorld.decompose( camera.position, camera.quaternion, camera.scale );	
		seethruPlane.quaternion.copy( camera.quaternion )
		
		// extract the fov from the projectionMatrix
		var fov = THREE.Math.radToDeg(Math.atan(1/camera.projectionMatrix.elements[5]))*2;
	// console.log('fov', fov)
		
		var elementWidth = parseFloat( arToolkitSource.domElement.style.width.replace(/px$/,''), 10 )
		var elementHeight = parseFloat( arToolkitSource.domElement.style.height.replace(/px$/,''), 10 )
		
		var aspect = elementWidth / elementHeight
		
		// camera.fov = fov
		// if( vrDisplay.isPresenting ){
		// 	fov *= 2
		// 	aspect *= 2
		// }
		
		// get seethruPlane height relative to fov
		seethruPlane.scale.y = Math.tan(THREE.Math.DEG2RAD * fov/2)*position.length() 
		// get seethruPlane aspect
		seethruPlane.scale.x = seethruPlane.scale.y * aspect
	}

	//////////////////////////////////////////////////////////////////////////////
	//		Code Separator
	//////////////////////////////////////////////////////////////////////////////
	// var video = arToolkitSource.domElement;
	// 
	// window.addEventListener('resize', function(){
	// 	updateSeeThruAspectUv(seethruPlane)	
	// })
	// video.addEventListener('canplaythrough', function(){
	// 	updateSeeThruAspectUv(seethruPlane)
	// })
	// function updateSeeThruAspectUv(plane){
	// 
	// 	// if video isnt yet ready to play
	// 	if( video.videoWidth === 0 || video.videoHeight === 0 )	return
	// 
	// 	var faceVertexUvs = plane.geometry.faceVertexUvs[0]
	// 	var screenAspect = window.innerWidth / window.innerHeight
	// 	var videoAspect = video.videoWidth / video.videoHeight
	// 	
	// 	plane.geometry.uvsNeedUpdate = true
	// 	if( screenAspect >= videoAspect ){
	// 		var actualHeight = videoAspect / screenAspect;
	// 		// faceVertexUvs y 0
	// 		faceVertexUvs[0][1].y = 0.5 - actualHeight/2
	// 		faceVertexUvs[1][0].y = 0.5 - actualHeight/2
	// 		faceVertexUvs[1][1].y = 0.5 - actualHeight/2
	// 		// faceVertexUvs y 1
	// 		faceVertexUvs[0][0].y = 0.5 + actualHeight/2
	// 		faceVertexUvs[0][2].y = 0.5 + actualHeight/2
	// 		faceVertexUvs[1][2].y = 0.5 + actualHeight/2
	// 	}else{
	// 		var actualWidth = screenAspect / videoAspect;
	// 		// faceVertexUvs x 0
	// 		faceVertexUvs[0][0].x = 0.5 - actualWidth/2
	// 		faceVertexUvs[0][1].x = 0.5 - actualWidth/2
	// 		faceVertexUvs[1][0].x = 0.5 - actualWidth/2
	// 		
	// 		// faceVertexUvs x 1
	// 		faceVertexUvs[0][2].x = 0.5 + actualWidth/2
	// 		faceVertexUvs[1][1].x = 0.5 + actualWidth/2
	// 		faceVertexUvs[1][2].x = 0.5 + actualWidth/2
	// 	}
	// }

}
var THREEx = THREEx || {}

// TODO this is useless - prefere arjs-HitTesting.js

/**
 * - maybe support .onClickFcts in each object3d
 * - seems an easy light layer for clickable object
 * - up to 
 */
THREEx.HitTestingPlane = function(sourceElement){
	this._sourceElement = sourceElement

	// create _pickingScene
	this._pickingScene = new THREE.Scene
	
	// create _pickingPlane
	var geometry = new THREE.PlaneGeometry(20,20,19,19).rotateX(-Math.PI/2)
	// var geometry = new THREE.PlaneGeometry(20,20).rotateX(-Math.PI/2)
	var material = new THREE.MeshBasicMaterial({
		// opacity: 0.5,
		// transparent: true,
		wireframe: true
	})
	// material.visible = false
	this._pickingPlane = new THREE.Mesh(geometry, material)
	this._pickingScene.add(this._pickingPlane)

	// Create pickingCamera
	var fullWidth = parseInt(sourceElement.style.width)
	var fullHeight = parseInt(sourceElement.style.height)
	// TODO hardcoded fov - couch
	this._pickingCamera = new THREE.PerspectiveCamera(42, fullWidth / fullHeight, 0.1, 30);	
}

//////////////////////////////////////////////////////////////////////////////
//		update function
//////////////////////////////////////////////////////////////////////////////

THREEx.HitTestingPlane.prototype.update = function(camera, pickingRoot, changeMatrixMode){

	this.onResize()
	

	if( changeMatrixMode === 'modelViewMatrix' ){
		// set pickingPlane position
		var pickingPlane = this._pickingPlane
		pickingRoot.parent.updateMatrixWorld()
		pickingPlane.matrix.copy(pickingRoot.parent.matrixWorld)
		// set position/quaternion/scale from pickingPlane.matrix
		pickingPlane.matrix.decompose(pickingPlane.position, pickingPlane.quaternion, pickingPlane.scale)
	}else if( changeMatrixMode === 'cameraTransformMatrix' ){
		// set pickingPlane position
		var pickingCamera = this._pickingCamera
		camera.updateMatrixWorld()
		pickingCamera.matrix.copy(camera.matrixWorld)
		// set position/quaternion/scale from pickingCamera.matrix
		pickingCamera.matrix.decompose(pickingCamera.position, pickingCamera.quaternion, pickingCamera.scale)
	}else console.assert(false)


// var position = this._pickingPlane.position
// console.log('pickingPlane position', position.x.toFixed(2), position.y.toFixed(2), position.z.toFixed(2))
// var position = this._pickingCamera.position
// console.log('his._pickingCamera position', position.x.toFixed(2), position.y.toFixed(2), position.z.toFixed(2))
	
}

//////////////////////////////////////////////////////////////////////////////
//		resize camera
//////////////////////////////////////////////////////////////////////////////

THREEx.HitTestingPlane.prototype.onResize = function(){
	var sourceElement = this._sourceElement
	var pickingCamera = this._pickingCamera
	
// FIXME why using css here ??? not even computed style
// should get the size of the elment directly independantly 
	var fullWidth = parseInt(sourceElement.style.width)
	var fullHeight = parseInt(sourceElement.style.height)
	pickingCamera.aspect = fullWidth / fullHeight

	pickingCamera.updateProjectionMatrix()
}

//////////////////////////////////////////////////////////////////////////////
//		Perform test
//////////////////////////////////////////////////////////////////////////////
THREEx.HitTestingPlane.prototype.test = function(mouseX, mouseY){
	// convert mouseX, mouseY to [-1, +1]
	mouseX = (mouseX-0.5)*2
	mouseY =-(mouseY-0.5)*2
	
	this._pickingScene.updateMatrixWorld(true)

	// compute intersections between mouseVector3 and pickingPlane
	var raycaster = new THREE.Raycaster();
	var mouseVector3 = new THREE.Vector3(mouseX, mouseY, 1);
	raycaster.setFromCamera( mouseVector3, this._pickingCamera )
	var intersects = raycaster.intersectObjects( [this._pickingPlane] )

	if( intersects.length === 0 )	return null

	// set new demoRoot position
	var position = this._pickingPlane.worldToLocal( intersects[0].point.clone() )
	// TODO here do a look at the camera ?
	var quaternion = new THREE.Quaternion
	var scale = new THREE.Vector3(1,1,1)//.multiplyScalar(1)
	
	return {
		position : position,
		quaternion : quaternion,
		scale : scale
	}
}

//////////////////////////////////////////////////////////////////////////////
//		render the pickingPlane for debug
//////////////////////////////////////////////////////////////////////////////

THREEx.HitTestingPlane.prototype.renderDebug = function(renderer){
	// render sceneOrtho
	renderer.render( this._pickingScene, this._pickingCamera )
}
// @namespace
var ARjs = ARjs || {}

// TODO this is a controls... should i give the object3d here ?
// not according to 'no three.js dependancy'

/**
 * Create an anchor in the real world
 *
 * @param {ARjs.Session} arSession - the session on which we create the anchor
 * @param {Object} markerParameters - parameter of this anchor
 */
ARjs.Anchor = function(arSession, markerParameters){
	var _this = this
	var arContext = arSession.arContext
	var scene = arSession.parameters.scene
	var camera = arSession.parameters.camera

	this.arSession = arSession
	this.parameters = markerParameters

	// log to debug
	console.log('ARjs.Anchor -', 'changeMatrixMode:', this.parameters.changeMatrixMode, '/ markersAreaEnabled:', markerParameters.markersAreaEnabled)

	var markerRoot = new THREE.Group
	scene.add(markerRoot)

	// set controlledObject depending on changeMatrixMode
	if( markerParameters.changeMatrixMode === 'modelViewMatrix' ){
		var controlledObject = markerRoot
	}else if( markerParameters.changeMatrixMode === 'cameraTransformMatrix' ){
		var controlledObject = camera
	}else console.assert(false)

	if( markerParameters.markersAreaEnabled === false ){
		var markerControls = new THREEx.ArMarkerControls(arContext, controlledObject, markerParameters)
		this.controls = markerControls
	}else{
		// sanity check - MUST be a trackingBackend with markers
		console.assert( arContext.parameters.trackingBackend === 'artoolkit' || arContext.parameters.trackingBackend === 'aruco' )

		// honor markers-page-resolution for https://webxr.io/augmented-website
		if( location.hash.substring(1).startsWith('markers-page-resolution=') === true ){
			// get resolutionW/resolutionH from url
			var markerPageResolution = location.hash.substring(1)
			var matches = markerPageResolution.match(/markers-page-resolution=(\d+)x(\d+)/)
			console.assert(matches.length === 3)
			var resolutionW = parseInt(matches[1])
			var resolutionH = parseInt(matches[2])
			var arContext = arSession.arContext
			// generate and store the ARjsMultiMarkerFile
			ARjs.MarkersAreaUtils.storeMarkersAreaFileFromResolution(arContext.parameters.trackingBackend, resolutionW, resolutionH)
		}

		// if there is no ARjsMultiMarkerFile, build a default one
		if( localStorage.getItem('ARjsMultiMarkerFile') === null ){
			ARjs.MarkersAreaUtils.storeDefaultMultiMarkerFile(arContext.parameters.trackingBackend)
		}

		// get multiMarkerFile from localStorage
		console.assert( localStorage.getItem('ARjsMultiMarkerFile') !== null )
		var multiMarkerFile = localStorage.getItem('ARjsMultiMarkerFile')

		// set controlledObject depending on changeMatrixMode
		if( markerParameters.changeMatrixMode === 'modelViewMatrix' ){
			var parent3D = scene
		}else if( markerParameters.changeMatrixMode === 'cameraTransformMatrix' ){
			var parent3D = camera
		}else console.assert(false)

		// build a multiMarkerControls
		var multiMarkerControls = ARjs.MarkersAreaControls.fromJSON(arContext, parent3D, controlledObject, multiMarkerFile)
		this.controls = multiMarkerControls

		// honor markerParameters.changeMatrixMode
		multiMarkerControls.parameters.changeMatrixMode = markerParameters.changeMatrixMode

// TODO put subMarkerControls visibility into an external file. with 2 handling for three.js and babylon.js
		// create ArMarkerHelper - useful to debug - super three.js specific
		var markerHelpers = []
		multiMarkerControls.subMarkersControls.forEach(function(subMarkerControls){
			// add an helper to visuable each sub-marker
			var markerHelper = new THREEx.ArMarkerHelper(subMarkerControls)
			markerHelper.object3d.visible = false
			// subMarkerControls.object3d.add( markerHelper.object3d )
			subMarkerControls.object3d.add( markerHelper.object3d )
			// add it to markerHelpers
			markerHelpers.push(markerHelper)
		})
		// define API specific to markersArea
		this.markersArea = {}
		this.markersArea.setSubMarkersVisibility = function(visible){
			markerHelpers.forEach(function(markerHelper){
				markerHelper.object3d.visible = visible
			})
		}
	}

	this.object3d = new THREE.Group()

	//////////////////////////////////////////////////////////////////////////////
	//		THREEx.ArSmoothedControls
	//////////////////////////////////////////////////////////////////////////////

	var shouldBeSmoothed = true

	if( shouldBeSmoothed === true ){
		// build a smoothedControls
		var smoothedRoot = new THREE.Group()
		scene.add(smoothedRoot)
		var smoothedControls = new THREEx.ArSmoothedControls(smoothedRoot)
		smoothedRoot.add(this.object3d)
	}else{
		markerRoot.add(this.object3d)
	}


	//////////////////////////////////////////////////////////////////////////////
	//		Code Separator
	//////////////////////////////////////////////////////////////////////////////
	this.update = function(){
		// update _this.object3d.visible
		_this.object3d.visible = _this.object3d.parent.visible

		// console.log('controlledObject.visible', _this.object3d.parent.visible)
		if( smoothedControls !== undefined ){
			// update smoothedControls parameters depending on how many markers are visible in multiMarkerControls
			if( multiMarkerControls !== undefined ){
				multiMarkerControls.updateSmoothedControls(smoothedControls)
			}

			// update smoothedControls
			smoothedControls.update(markerRoot)
		}
	}
}
// @namespace
var ARjs = ARjs || {}

/**
 * Create an debug UI for an ARjs.Anchor
 *
 * @param {ARjs.Anchor} arAnchor - the anchor to user
 */
ARjs.SessionDebugUI = function (arSession) {
    var trackingBackend = arSession.arContext.parameters.trackingBackend

    this.domElement = document.createElement('div')
    this.domElement.style.color = 'rgba(0,0,0,0.9)'
    this.domElement.style.backgroundColor = 'rgba(127,127,127,0.5)'
    this.domElement.style.display = 'block'
    this.domElement.style.padding = '0.5em'
    this.domElement.style.position = 'fixed'
    this.domElement.style.left = '5px'
    this.domElement.style.bottom = '10px'
    this.domElement.style.textAlign = 'right'

    //////////////////////////////////////////////////////////////////////////////
    //		current-tracking-backend
    //////////////////////////////////////////////////////////////////////////////

    var domElement = document.createElement('span')
    domElement.style.display = 'block'
    domElement.innerHTML = '<b>trackingBackend</b> : ' + trackingBackend
    this.domElement.appendChild(domElement)
}

/**
 * Url of augmented-website service - if === '' then dont include augmented-website link
 * @type {String}
 */
ARjs.SessionDebugUI.AugmentedWebsiteURL = 'https://webxr.io/augmented-website'

//////////////////////////////////////////////////////////////////////////////
//		ARjs.AnchorDebugUI
//////////////////////////////////////////////////////////////////////////////

/**
 * Create an debug UI for an ARjs.Anchor
 *
 * @param {ARjs.Anchor} arAnchor - the anchor to user
 */
ARjs.AnchorDebugUI = function (arAnchor) {
    var arSession = arAnchor.arSession
    var trackingBackend = arSession.arContext.parameters.trackingBackend

    this.domElement = document.createElement('div')
    this.domElement.style.color = 'rgba(0,0,0,0.9)'
    this.domElement.style.backgroundColor = 'rgba(127,127,127,0.5)'
    this.domElement.style.display = 'inline-block'
    this.domElement.style.padding = '0.5em'
    this.domElement.style.margin = '0.5em'
    this.domElement.style.textAlign = 'left'

    //////////////////////////////////////////////////////////////////////////////
    //		current-tracking-backend
    //////////////////////////////////////////////////////////////////////////////

    var domElement = document.createElement('span')
    domElement.style.display = 'block'
    domElement.style.padding = '0.5em'
    domElement.style.color = 'rgba(0,0,0,0.9)'
    domElement.style.backgroundColor = 'rgba(127,127,127,0.5)'
    domElement.style.position = 'fixed'
    domElement.style.left = '5px'
    domElement.style.bottom = '40px'

    this.domElement.appendChild(domElement)
    domElement.innerHTML = '<b>markersAreaEnabled</b> :' + arAnchor.parameters.markersAreaEnabled

    //////////////////////////////////////////////////////////////////////////////
    //		toggle-marker-helper
    //////////////////////////////////////////////////////////////////////////////

    if (arAnchor.parameters.markersAreaEnabled) {
        var domElement = document.createElement('button')
        domElement.style.display = 'block'
        this.domElement.style.padding = '0.5em'
        this.domElement.style.position = 'fixed'
        this.domElement.style.textAlign = 'left'
        this.domElement.appendChild(domElement)

        domElement.id = 'buttonToggleMarkerHelpers'
        domElement.innerHTML = 'toggle-marker-helper'
        domElement.href = 'javascript:void(0)'

        var subMarkerHelpersVisible = false
        domElement.addEventListener('click', function () {
            subMarkerHelpersVisible = subMarkerHelpersVisible ? false : true
            arAnchor.markersArea.setSubMarkersVisibility(subMarkerHelpersVisible)
        })
    }

    //////////////////////////////////////////////////////////////////////////////
    //		Learn-new-marker-area
    //////////////////////////////////////////////////////////////////////////////

    if (arAnchor.parameters.markersAreaEnabled) {
        var domElement = document.createElement('button')
        domElement.style.display = 'block'
        this.domElement.appendChild(domElement)

        domElement.id = 'buttonMarkersAreaLearner'
        domElement.innerHTML = 'Learn-new-marker-area'
        domElement.href = 'javascript:void(0)'

        domElement.addEventListener('click', function () {
            if (ARjs.AnchorDebugUI.MarkersAreaLearnerURL !== null) {
                var learnerURL = ARjs.AnchorDebugUI.MarkersAreaLearnerURL
            } else {
                var learnerURL = ARjs.Context.baseURL + 'examples/multi-markers/examples/learner.html'
            }
            ARjs.MarkersAreaUtils.navigateToLearnerPage(learnerURL, trackingBackend)
        })
    }

    //////////////////////////////////////////////////////////////////////////////
    //		Reset-marker-area
    //////////////////////////////////////////////////////////////////////////////

    if (arAnchor.parameters.markersAreaEnabled) {
        var domElement = document.createElement('button')
        domElement.style.display = 'block'
        this.domElement.appendChild(domElement)

        domElement.id = 'buttonMarkersAreaReset'
        domElement.innerHTML = 'Reset-marker-area'
        domElement.href = 'javascript:void(0)'

        domElement.addEventListener('click', function () {
            ARjs.MarkersAreaUtils.storeDefaultMultiMarkerFile(trackingBackend)
            location.reload()
        })
    }
}

/**
 * url for the markers-area learner. if not set, take the default one
 * @type {String}
 */
ARjs.AnchorDebugUI.MarkersAreaLearnerURL = null
// @namespace
var ARjs = ARjs || {}

/**
 * Create an anchor in the real world
 *
 * @param {ARjs.Session} arSession - the session on which we create the anchor
 * @param {Object} markerParameters - parameter of this anchor
 */
ARjs.HitTesting = function (arSession) {
    var _this = this
    var arContext = arSession.arContext
    var trackingBackend = arContext.parameters.trackingBackend

    this.enabled = true
    this._arSession = arSession
    this._hitTestingPlane = null
    _this._hitTestingPlane = new THREEx.HitTestingPlane(arSession.arSource.domElement)
}

//////////////////////////////////////////////////////////////////////////////
//		update function
//////////////////////////////////////////////////////////////////////////////
/**
 * update
 *
 * @param {THREE.Camera} camera   - the camera to use
 * @param {THREE.Object3D} object3d -
 */
ARjs.HitTesting.prototype.update = function (camera, pickingRoot, changeMatrixMode) {
    // if it isnt enabled, do nothing
    if (this.enabled === false) return

    if (this._hitTestingPlane !== null) {
        this._hitTestingPlane.update(camera, pickingRoot, changeMatrixMode)
    } else console.assert(false)
}

//////////////////////////////////////////////////////////////////////////////
//		actual hit testing
//////////////////////////////////////////////////////////////////////////////

/**
 * Test the real world for intersections directly from a DomEvent
 *
 * @param {Number} mouseX - position X of the hit [-1, +1]
 * @param {Number} mouseY - position Y of the hit [-1, +1]
 * @return {[ARjs.HitTesting.Result]} - array of result
 */
ARjs.HitTesting.prototype.testDomEvent = function (domEvent) {
    var trackingBackend = this._arSession.arContext.parameters.trackingBackend
    var arSource = this._arSession.arSource

    // if it isnt enabled, do nothing
    if (this.enabled === false) return []

    var mouseX = domEvent.clientX / arSource.domElementWidth()
    var mouseY = domEvent.clientY / arSource.domElementHeight()

    return this.test(mouseX, mouseY)
}

/**
 * Test the real world for intersections.
 *
 * @param {Number} mouseX - position X of the hit [0, +1]
 * @param {Number} mouseY - position Y of the hit [0, +1]
 * @return {[ARjs.HitTesting.Result]} - array of result
 */
ARjs.HitTesting.prototype.test = function (mouseX, mouseY) {
    var arContext = this._arSession.arContext
    var trackingBackend = arContext.parameters.trackingBackend
    var hitTestResults = []

    // if it isnt enabled, do nothing
    if (this.enabled === false) return []

    var result = null
    var result = this._hitTestingPlane.test(mouseX, mouseY)

    // if no result is found, return now
    if (result === null) return hitTestResults

    // build a ARjs.HitTesting.Result
    var hitTestResult = new ARjs.HitTesting.Result(result.position, result.quaternion, result.scale)
    hitTestResults.push(hitTestResult)

    return hitTestResults
}

//////////////////////////////////////////////////////////////////////////////
//		ARjs.HitTesting.Result
//////////////////////////////////////////////////////////////////////////////
/**
 * Contains the result of ARjs.HitTesting.test()
 *
 * @param {THREE.Vector3} position - position to use
 * @param {THREE.Quaternion} quaternion - quaternion to use
 * @param {THREE.Vector3} scale - scale
 */
ARjs.HitTesting.Result = function (position, quaternion, scale) {
    this.position = position
    this.quaternion = quaternion
    this.scale = scale
}

/**
 * Apply to a controlled object3d
 *
 * @param {THREE.Object3D} object3d - the result to apply
 */
ARjs.HitTesting.Result.prototype.apply = function (object3d) {
    object3d.position.copy(this.position)
    object3d.quaternion.copy(this.quaternion)
    object3d.scale.copy(this.scale)

    object3d.updateMatrix()
}

/**
 * Apply to a controlled object3d
 *
 * @param {THREE.Object3D} object3d - the result to apply
 */
ARjs.HitTesting.Result.prototype.applyPosition = function (object3d) {
    object3d.position.copy(this.position)

    object3d.updateMatrix()

    return this
}

/**
 * Apply to a controlled object3d
 *
 * @param {THREE.Object3D} object3d - the result to apply
 */
ARjs.HitTesting.Result.prototype.applyQuaternion = function (object3d) {
    object3d.quaternion.copy(this.quaternion)

    object3d.updateMatrix()

    return this
}
var ARjs = ARjs || {}

/**
 * define a ARjs.Session
 * 
 * @param {Object} parameters - parameters for this session
 */
ARjs.Session = function(parameters){
	var _this = this
	// handle default parameters
	this.parameters = {
		renderer: null,
		camera: null,
		scene: null,
		sourceParameters: {},
		contextParameters: {},
	}
	
	this.signals = {
		sourceReady : new signals.Signal(),
		contextInitialized: new signals.Signal(),
	}

	//////////////////////////////////////////////////////////////////////////////
	//		setParameters
	//////////////////////////////////////////////////////////////////////////////
	setParameters(parameters)
	function setParameters(parameters){
		if( parameters === undefined )	return
		for( var key in parameters ){
			var newValue = parameters[ key ]

			if( newValue === undefined ){
				console.warn( "THREEx.Session: '" + key + "' parameter is undefined." )
				continue
			}

			var currentValue = _this.parameters[ key ]

			if( currentValue === undefined ){
				console.warn( "THREEx.Session: '" + key + "' is not a property of this material." )
				continue
			}

			_this.parameters[ key ] = newValue
		}
	}
	// sanity check
	console.assert(this.parameters.renderer instanceof THREE.WebGLRenderer)
	console.assert(this.parameters.camera instanceof THREE.Camera)
	console.assert(this.parameters.scene instanceof THREE.Scene)
	

	// backward emulation
	Object.defineProperty(this, 'renderer', {get: function(){
		console.warn('use .parameters.renderer renderer')
		return this.parameters.renderer;
	}});
	Object.defineProperty(this, 'camera', {get: function(){
		console.warn('use .parameters.camera instead')
		return this.parameters.camera;
	}});
	Object.defineProperty(this, 'scene', {get: function(){
		console.warn('use .parameters.scene instead')
		return this.parameters.scene;
	}});

	
	// log the version
	console.log('AR.js', ARjs.Context.REVISION, '- trackingBackend:', parameters.contextParameters.trackingBackend)

	//////////////////////////////////////////////////////////////////////////////
	//		init arSource
	//////////////////////////////////////////////////////////////////////////////
	var arSource = _this.arSource = new ARjs.Source(parameters.sourceParameters)

	arSource.init(function onReady(){
		arSource.onResize(arContext, _this.parameters.renderer, _this.parameters.camera)

		_this.signals.sourceReady.dispatch()
	})
	
	// handle resize
	window.addEventListener('resize', function(){
		arSource.onResize(arContext, _this.parameters.renderer, _this.parameters.camera)
	})	
	
	//////////////////////////////////////////////////////////////////////////////
	//		init arContext
	//////////////////////////////////////////////////////////////////////////////

	// create atToolkitContext
	var arContext = _this.arContext = new ARjs.Context(parameters.contextParameters)
	
	// initialize it
	_this.arContext.init()
	
	arContext.addEventListener('initialized', function(event){
		arSource.onResize(arContext, _this.parameters.renderer, _this.parameters.camera)
		
		_this.signals.contextInitialized.dispatch()
	})
	
	//////////////////////////////////////////////////////////////////////////////
	//		update function
	//////////////////////////////////////////////////////////////////////////////
	// update artoolkit on every frame
	this.update = function(){
		if( arSource.ready === false )	return
		
		arContext.update( arSource.domElement )
	}
}

ARjs.Session.prototype.onResize = function () {
	this.arSource.onResize(this.arContext, this.parameters.renderer, this.parameters.camera)	
};
var ARjs = ARjs || {}
ARjs.Utils = {}

/**
 * Create a default rendering camera for this trackingBackend. They may be modified later. to fit physical camera parameters
 *
 * @param {string} trackingBackend - the tracking to user
 * @return {THREE.Camera} the created camera
 */
ARjs.Utils.createDefaultCamera = function (trackingMethod) {
    var trackingBackend = this.parseTrackingMethod(trackingMethod).trackingBackend
    // Create a camera
    if (trackingBackend === 'artoolkit') {
        var camera = new THREE.Camera();
    } else if (trackingBackend === 'aruco') {
        var camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.01, 100);
    } else console.assert(false, 'unknown trackingBackend: ' + trackingBackend)

    return camera
}

/**
 * parse tracking method
 *
 * @param {String} trackingMethod - the tracking method to parse
 * @return {Object} - various field of the tracking method
 */
ARjs.Utils.parseTrackingMethod = function (trackingMethod) {

    if (trackingMethod.startsWith('area-')) {
        return {
            trackingBackend: trackingMethod.replace('area-', ''),
            markersAreaEnabled: true,
        }
    } else {
        return {
            trackingBackend: trackingMethod,
            markersAreaEnabled: false,
        }
    }
}
var ARjs = ARjs || {}
var THREEx = THREEx || {}

ARjs.MarkersAreaControls = THREEx.ArMultiMarkerControls = function(arToolkitContext, object3d, parameters){
	var _this = this
	THREEx.ArBaseControls.call(this, object3d)

	if( arguments.length > 3 )	console.assert('wrong api for', THREEx.ArMultiMarkerControls)

	// have a parameters in argument
	this.parameters = {
		// list of controls for each subMarker
		subMarkersControls: parameters.subMarkersControls,
		// list of pose for each subMarker relative to the origin
		subMarkerPoses: parameters.subMarkerPoses,
		// change matrix mode - [modelViewMatrix, cameraTransformMatrix]
		changeMatrixMode : parameters.changeMatrixMode !== undefined ? parameters.changeMatrixMode : 'modelViewMatrix',
	}
	
	this.object3d.visible = false
	// honor obsolete stuff - add a warning to use
	this.subMarkersControls = this.parameters.subMarkersControls
	this.subMarkerPoses = this.parameters.subMarkerPoses

	// listen to arToolkitContext event 'sourceProcessed'
	// - after we fully processed one image, aka when we know all detected poses in it
	arToolkitContext.addEventListener('sourceProcessed', function(){
		_this._onSourceProcessed()
	})
}

ARjs.MarkersAreaControls.prototype = Object.create( THREEx.ArBaseControls.prototype );
ARjs.MarkersAreaControls.prototype.constructor = ARjs.MarkersAreaControls;

//////////////////////////////////////////////////////////////////////////////
//		Code Separator
//////////////////////////////////////////////////////////////////////////////


/**
 * What to do when a image source is fully processed
 */
ARjs.MarkersAreaControls.prototype._onSourceProcessed = function(){
	var _this = this
	var stats = {
		count: 0,
		position : {
			sum: new THREE.Vector3(0,0,0),
			average: new THREE.Vector3(0,0,0),
		},
		quaternion : {
			sum: new THREE.Quaternion(0,0,0,0),
			average: new THREE.Quaternion(0,0,0,0),
		},
		scale : {
			sum: new THREE.Vector3(0,0,0),
			average: new THREE.Vector3(0,0,0),
		},
	}

	var firstQuaternion = _this.parameters.subMarkersControls[0].object3d.quaternion

	this.parameters.subMarkersControls.forEach(function(markerControls, markerIndex){
		
		var markerObject3d = markerControls.object3d
		// if this marker is not visible, ignore it
		if( markerObject3d.visible === false )	return

		// transformation matrix of this.object3d according to this sub-markers
		var matrix = markerObject3d.matrix.clone()
		var markerPose = _this.parameters.subMarkerPoses[markerIndex]
		matrix.multiply(new THREE.Matrix4().getInverse(markerPose))

		// decompose the matrix into .position, .quaternion, .scale
		var position = new THREE.Vector3
		var quaternion = new THREE.Quaternion()
		var scale = new THREE.Vector3
		matrix.decompose(position, quaternion, scale)

		// http://wiki.unity3d.com/index.php/Averaging_Quaternions_and_Vectors
		stats.count++

		ARjs.MarkersAreaControls.averageVector3(stats.position.sum, position, stats.count, stats.position.average)
		ARjs.MarkersAreaControls.averageQuaternion(stats.quaternion.sum, quaternion, firstQuaternion, stats.count, stats.quaternion.average)
		ARjs.MarkersAreaControls.averageVector3(stats.scale.sum, scale, stats.count, stats.scale.average)
	})

	// honor _this.object3d.visible
	if( stats.count > 0 ){
		_this.object3d.visible = true
	}else{
		_this.object3d.visible = false			
	}

	// if at least one sub-marker has been detected, make the average of all detected markers
	if( stats.count > 0 ){
		// compute modelViewMatrix
		var modelViewMatrix = new THREE.Matrix4()
		modelViewMatrix.compose(stats.position.average, stats.quaternion.average, stats.scale.average)

		// change _this.object3d.matrix based on parameters.changeMatrixMode
		if( this.parameters.changeMatrixMode === 'modelViewMatrix' ){
			_this.object3d.matrix.copy(modelViewMatrix)
		}else if( this.parameters.changeMatrixMode === 'cameraTransformMatrix' ){
			_this.object3d.matrix.getInverse( modelViewMatrix )
		}else {
			console.assert(false)
		}

		// decompose - the matrix into .position, .quaternion, .scale
		_this.object3d.matrix.decompose(_this.object3d.position, _this.object3d.quaternion, _this.object3d.scale)
	}

}

//////////////////////////////////////////////////////////////////////////////
//		Utility functions
//////////////////////////////////////////////////////////////////////////////

/**
 * from http://wiki.unity3d.com/index.php/Averaging_Quaternions_and_Vectors
 */
ARjs.MarkersAreaControls.averageQuaternion = function(quaternionSum, newQuaternion, firstQuaternion, count, quaternionAverage){
	quaternionAverage = quaternionAverage || new THREE.Quaternion()
	// sanity check
	console.assert(firstQuaternion instanceof THREE.Quaternion === true)
	
	// from http://wiki.unity3d.com/index.php/Averaging_Quaternions_and_Vectors
	if( newQuaternion.dot(firstQuaternion) > 0 ){
		newQuaternion = new THREE.Quaternion(-newQuaternion.x, -newQuaternion.y, -newQuaternion.z, -newQuaternion.w)
	}

	quaternionSum.x += newQuaternion.x
	quaternionSum.y += newQuaternion.y
	quaternionSum.z += newQuaternion.z
	quaternionSum.w += newQuaternion.w
	
	quaternionAverage.x = quaternionSum.x/count
	quaternionAverage.y = quaternionSum.y/count
	quaternionAverage.z = quaternionSum.z/count
	quaternionAverage.w = quaternionSum.w/count
	
	quaternionAverage.normalize()

	return quaternionAverage
}


ARjs.MarkersAreaControls.averageVector3 = function(vector3Sum, vector3, count, vector3Average){
	vector3Average = vector3Average || new THREE.Vector3()
	
	vector3Sum.x += vector3.x
	vector3Sum.y += vector3.y
	vector3Sum.z += vector3.z
	
	vector3Average.x = vector3Sum.x / count
	vector3Average.y = vector3Sum.y / count
	vector3Average.z = vector3Sum.z / count
	
	return vector3Average
}

//////////////////////////////////////////////////////////////////////////////
//		Utility function
//////////////////////////////////////////////////////////////////////////////

/**
 * compute the center of this multimarker file
 */
ARjs.MarkersAreaControls.computeCenter = function(jsonData){
	var multiMarkerFile = JSON.parse(jsonData)
	var stats = {
		count : 0,
		position : {
			sum: new THREE.Vector3(0,0,0),
			average: new THREE.Vector3(0,0,0),						
		},
		quaternion : {
			sum: new THREE.Quaternion(0,0,0,0),
			average: new THREE.Quaternion(0,0,0,0),						
		},
		scale : {
			sum: new THREE.Vector3(0,0,0),
			average: new THREE.Vector3(0,0,0),						
		},
	}
	var firstQuaternion = new THREE.Quaternion() // FIXME ???
	
	multiMarkerFile.subMarkersControls.forEach(function(item){
		var poseMatrix = new THREE.Matrix4().fromArray(item.poseMatrix)
		
		var position = new THREE.Vector3
		var quaternion = new THREE.Quaternion
		var scale = new THREE.Vector3
		poseMatrix.decompose(position, quaternion, scale)
		
		// http://wiki.unity3d.com/index.php/Averaging_Quaternions_and_Vectors
		stats.count++

		ARjs.MarkersAreaControls.averageVector3(stats.position.sum, position, stats.count, stats.position.average)
		ARjs.MarkersAreaControls.averageQuaternion(stats.quaternion.sum, quaternion, firstQuaternion, stats.count, stats.quaternion.average)
		ARjs.MarkersAreaControls.averageVector3(stats.scale.sum, scale, stats.count, stats.scale.average)
	})
	
	var averageMatrix = new THREE.Matrix4()
	averageMatrix.compose(stats.position.average, stats.quaternion.average, stats.scale.average)

	return averageMatrix
}

ARjs.MarkersAreaControls.computeBoundingBox = function(jsonData){
	var multiMarkerFile = JSON.parse(jsonData)
	var boundingBox = new THREE.Box3()

	multiMarkerFile.subMarkersControls.forEach(function(item){
		var poseMatrix = new THREE.Matrix4().fromArray(item.poseMatrix)
		
		var position = new THREE.Vector3
		var quaternion = new THREE.Quaternion
		var scale = new THREE.Vector3
		poseMatrix.decompose(position, quaternion, scale)

		boundingBox.expandByPoint(position)
	})

	return boundingBox
}
//////////////////////////////////////////////////////////////////////////////
//		updateSmoothedControls
//////////////////////////////////////////////////////////////////////////////

ARjs.MarkersAreaControls.prototype.updateSmoothedControls = function(smoothedControls, lerpsValues){
	// handle default values
	if( lerpsValues === undefined ){
		// FIXME this parameter format is uselessly cryptic
		// lerpValues = [
		// {lerpPosition: 0.5, lerpQuaternion: 0.2, lerpQuaternion: 0.7}
		// ]
		lerpsValues = [
			[0.3+.1, 0.1, 0.3],
			[0.4+.1, 0.1, 0.4],
			[0.4+.1, 0.2, 0.5],
			[0.5+.1, 0.2, 0.7],
			[0.5+.1, 0.2, 0.7],
		]
	}
	// count how many subMarkersControls are visible
	var nVisible = 0
	this.parameters.subMarkersControls.forEach(function(markerControls, markerIndex){
		var markerObject3d = markerControls.object3d
		if( markerObject3d.visible === true )	nVisible ++
	})

	// find the good lerpValues
	if( lerpsValues[nVisible-1] !== undefined ){
		var lerpValues = lerpsValues[nVisible-1]
	}else{
		var lerpValues = lerpsValues[lerpsValues.length-1]
	}

	// modify lerpValues in smoothedControls
	smoothedControls.parameters.lerpPosition = lerpValues[0]
	smoothedControls.parameters.lerpQuaternion = lerpValues[1]
	smoothedControls.parameters.lerpScale = lerpValues[2]
}


//////////////////////////////////////////////////////////////////////////////
//		Create THREEx.ArMultiMarkerControls from JSON
//////////////////////////////////////////////////////////////////////////////

ARjs.MarkersAreaControls.fromJSON = function(arToolkitContext, parent3D, markerRoot, jsonData, parameters){
	var multiMarkerFile = JSON.parse(jsonData)
	// declare variables
	var subMarkersControls = []
	var subMarkerPoses = []
	// handle default arguments
	parameters = parameters || {}

	// prepare the parameters
	multiMarkerFile.subMarkersControls.forEach(function(item){
		// create a markerRoot
		var markerRoot = new THREE.Object3D()
		parent3D.add(markerRoot)

		// create markerControls for our markerRoot
		var subMarkerControls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, item.parameters)

// if( true ){
		// store it in the parameters
		subMarkersControls.push(subMarkerControls)
		subMarkerPoses.push(new THREE.Matrix4().fromArray(item.poseMatrix))	
// }else{
// 		// build a smoothedControls
// 		var smoothedRoot = new THREE.Group()
// 		parent3D.add(smoothedRoot)
// 		var smoothedControls = new THREEx.ArSmoothedControls(smoothedRoot, {
// 			lerpPosition : 0.1,
// 			lerpQuaternion : 0.1, 
// 			lerpScale : 0.1,
// 			minVisibleDelay: 0,
// 			minUnvisibleDelay: 0,
// 		})
// 		onRenderFcts.push(function(delta){
// 			smoothedControls.update(markerRoot)	// TODO this is a global
// 		})
// 	
// 
// 		// store it in the parameters
// 		subMarkersControls.push(smoothedControls)
// 		subMarkerPoses.push(new THREE.Matrix4().fromArray(item.poseMatrix))
// }
	})
	
	parameters.subMarkersControls = subMarkersControls
	parameters.subMarkerPoses = subMarkerPoses
	// create a new THREEx.ArMultiMarkerControls
	var multiMarkerControls = new THREEx.ArMultiMarkerControls(arToolkitContext, markerRoot, parameters)

	// return it
	return multiMarkerControls	
}
var ARjs = ARjs || {}
var THREEx = THREEx || {}

ARjs.MarkersAreaLearning = THREEx.ArMultiMakersLearning = function(arToolkitContext, subMarkersControls){
	var _this = this
	this._arToolkitContext = arToolkitContext

	// Init variables
	this.subMarkersControls = subMarkersControls
	this.enabled = true
		
	// listen to arToolkitContext event 'sourceProcessed'
	// - after we fully processed one image, aka when we know all detected poses in it
	arToolkitContext.addEventListener('sourceProcessed', function(){
		_this._onSourceProcessed()
	})
}


//////////////////////////////////////////////////////////////////////////////
//		statistic collection
//////////////////////////////////////////////////////////////////////////////

/**
 * What to do when a image source is fully processed
 */
ARjs.MarkersAreaLearning.prototype._onSourceProcessed = function(){
	var originQuaternion = this.subMarkersControls[0].object3d.quaternion
	// here collect the statistic on relative positioning 
	
	// honor this.enabled
	if( this.enabled === false )	return

	// keep only the visible markers
	var visibleMarkerControls = this.subMarkersControls.filter(function(markerControls){
		return markerControls.object3d.visible === true
	})

	var count = Object.keys(visibleMarkerControls).length

	var positionDelta = new THREE.Vector3()
	var quaternionDelta = new THREE.Quaternion()
	var scaleDelta = new THREE.Vector3()
	var tmpMatrix = new THREE.Matrix4()
	
	// go thru all the visibleMarkerControls
	for(var i = 0; i < count; i++){
		var markerControls1 = visibleMarkerControls[i]
		for(var j = 0; j < count; j++){
			var markerControls2 = visibleMarkerControls[j]

			// if markerControls1 is markerControls2, then skip it
			if( i === j )	continue


			//////////////////////////////////////////////////////////////////////////////
			//		create data in markerControls1.object3d.userData if needed
			//////////////////////////////////////////////////////////////////////////////
			// create seenCouples for markerControls1 if needed
			if( markerControls1.object3d.userData.seenCouples === undefined ){
				markerControls1.object3d.userData.seenCouples = {}
			}
			var seenCouples = markerControls1.object3d.userData.seenCouples
			// create the multiMarkerPosition average if needed`
			if( seenCouples[markerControls2.id] === undefined ){
				// console.log('create seenCouples between', markerControls1.id, 'and', markerControls2.id)
				seenCouples[markerControls2.id] = {
					count : 0,
					position : {
						sum: new THREE.Vector3(0,0,0),
						average: new THREE.Vector3(0,0,0),						
					},
					quaternion : {
						sum: new THREE.Quaternion(0,0,0,0),
						average: new THREE.Quaternion(0,0,0,0),						
					},
					scale : {
						sum: new THREE.Vector3(0,0,0),
						average: new THREE.Vector3(0,0,0),						
					},
				}
			}

			
			//////////////////////////////////////////////////////////////////////////////
			//		Compute markerControls2 position relative to markerControls1
			//////////////////////////////////////////////////////////////////////////////
			
			// compute markerControls2 position/quaternion/scale in relation with markerControls1
			tmpMatrix.getInverse(markerControls1.object3d.matrix)
			tmpMatrix.multiply(markerControls2.object3d.matrix)
			tmpMatrix.decompose(positionDelta, quaternionDelta, scaleDelta)
			
			//////////////////////////////////////////////////////////////////////////////
			//		update statistics
			//////////////////////////////////////////////////////////////////////////////
			var stats = seenCouples[markerControls2.id]
			// update the count
			stats.count++

			// update the average of position/rotation/scale
			THREEx.ArMultiMarkerControls.averageVector3(stats.position.sum, positionDelta, stats.count, stats.position.average)
			THREEx.ArMultiMarkerControls.averageQuaternion(stats.quaternion.sum, quaternionDelta, originQuaternion, stats.count, stats.quaternion.average)
			THREEx.ArMultiMarkerControls.averageVector3(stats.scale.sum, scaleDelta, stats.count, stats.scale.average)
		}
	}
}

//////////////////////////////////////////////////////////////////////////////
//		Compute markers transformation matrix from current stats
//////////////////////////////////////////////////////////////////////////////

ARjs.MarkersAreaLearning.prototype.computeResult = function(){
	var _this = this
	var originSubControls = this.subMarkersControls[0]

	this.deleteResult()

	// special case of originSubControls averageMatrix
	originSubControls.object3d.userData.result = {
		averageMatrix : new THREE.Matrix4(),
		confidenceFactor: 1,
	}
	// TODO here check if the originSubControls has been seen at least once!!
	
	
	/**
	 * ALGO in pseudo code
	 *
	 * - Set confidenceFactor of origin sub markers as 1
	 *
	 * Start Looping
	 * - For a given sub marker, skip it if it already has a result.
	 * - if no result, check all seen couple and find n ones which has a progress of 1 or more.
	 * - So the other seen sub markers, got a valid transformation matrix. 
	 * - So take local averages position/orientation/scale, compose a transformation matrix. 
	 *   - aka transformation matrix from parent matrix * transf matrix pos/orientation/scale
	 * - Multiple it by the other seen marker matrix. 
	 * - Loop on the array until one pass could not compute any new sub marker
	 */
	
	do{
		var resultChanged = false
		// loop over each subMarkerControls
		this.subMarkersControls.forEach(function(subMarkerControls){

			// if subMarkerControls already has a result, do nothing
			var result = subMarkerControls.object3d.userData.result
			var isLearned = (result !== undefined && result.confidenceFactor >= 1) ? true : false
			if( isLearned === true )	return
			
			// console.log('compute subMarkerControls', subMarkerControls.name())
			var otherSubControlsID = _this._getLearnedCoupleStats(subMarkerControls)
			if( otherSubControlsID === null ){
				// console.log('no learnedCoupleStats')
				return
			}
			
			var otherSubControls = _this._getSubMarkerControlsByID(otherSubControlsID)

			var seenCoupleStats = subMarkerControls.object3d.userData.seenCouples[otherSubControlsID]
			
			var averageMatrix = new THREE.Matrix4()
			averageMatrix.compose(seenCoupleStats.position.average, seenCoupleStats.quaternion.average, seenCoupleStats.scale.average)
				
			var otherAverageMatrix = otherSubControls.object3d.userData.result.averageMatrix

			var matrix = new THREE.Matrix4().getInverse(otherAverageMatrix).multiply(averageMatrix)
			matrix = new THREE.Matrix4().getInverse(matrix)

			console.assert( subMarkerControls.object3d.userData.result === undefined )
			subMarkerControls.object3d.userData.result = {
				averageMatrix: matrix,
				confidenceFactor: 1
			}
			
			resultChanged = true
		})
		// console.log('loop')
	}while(resultChanged === true)
	
	// debugger
	// console.log('json:', this.toJSON())
	// this.subMarkersControls.forEach(function(subMarkerControls){
	// 	var hasResult = subMarkerControls.object3d.userData.result !== undefined
	// 	console.log('marker', subMarkerControls.name(), hasResult ? 'has' : 'has NO', 'result')
	// })
}

//////////////////////////////////////////////////////////////////////////////
//		Utility function
//////////////////////////////////////////////////////////////////////////////

/** 
 * get a _this.subMarkersControls id based on markerControls.id
 */
ARjs.MarkersAreaLearning.prototype._getLearnedCoupleStats	= function(subMarkerControls){

	// if this subMarkerControls has never been seen with another subMarkerControls
	if( subMarkerControls.object3d.userData.seenCouples === undefined )	return null
	
	var seenCouples = subMarkerControls.object3d.userData.seenCouples
	var coupleControlsIDs = Object.keys(seenCouples).map(Number)

	for(var i = 0; i < coupleControlsIDs.length; i++){
		var otherSubControlsID = coupleControlsIDs[i]
		// get otherSubControls
		var otherSubControls = this._getSubMarkerControlsByID(otherSubControlsID)
			
		// if otherSubControls isnt learned, skip it
		var result = otherSubControls.object3d.userData.result
		var isLearned = (result !== undefined && result.confidenceFactor >= 1) ? true : false
		if( isLearned === false )	continue

		// return this seenCouplesStats
		return otherSubControlsID
	}
	
	// if none is found, return null
	return null
}

/** 
 * get a _this.subMarkersControls based on markerControls.id
 */
ARjs.MarkersAreaLearning.prototype._getSubMarkerControlsByID	= function(controlsID){

	for(var i = 0; i < this.subMarkersControls.length; i++){
		var subMarkerControls = this.subMarkersControls[i]
		if( subMarkerControls.id === controlsID ){
			return subMarkerControls
		}
	}

	return null
}
 //////////////////////////////////////////////////////////////////////////////
//		JSON file building
//////////////////////////////////////////////////////////////////////////////

ARjs.MarkersAreaLearning.prototype.toJSON = function(){

	// compute the average matrix before generating the file
	this.computeResult()

	//////////////////////////////////////////////////////////////////////////////
	//		actually build the json
	//////////////////////////////////////////////////////////////////////////////
	var data = {
		meta : {
			createdBy : "Area Learning - AR.js "+THREEx.ArToolkitContext.REVISION,
			createdAt : new Date().toJSON(),
			
		},
		trackingBackend: this._arToolkitContext.parameters.trackingBackend,
		subMarkersControls : [],
	}

	var originSubControls = this.subMarkersControls[0]
	var originMatrixInverse = new THREE.Matrix4().getInverse(originSubControls.object3d.matrix)
	this.subMarkersControls.forEach(function(subMarkerControls, index){
		
		// if a subMarkerControls has no result, ignore it
		if( subMarkerControls.object3d.userData.result === undefined )	return

		var poseMatrix = subMarkerControls.object3d.userData.result.averageMatrix
		console.assert(poseMatrix instanceof THREE.Matrix4)
		

		// build the info
		var info = {
			parameters : {
				// to fill ...
			},
			poseMatrix : poseMatrix.toArray(),
		}
		if( subMarkerControls.parameters.type === 'pattern' ){
			info.parameters.type = subMarkerControls.parameters.type
			info.parameters.patternUrl = subMarkerControls.parameters.patternUrl
		}else if( subMarkerControls.parameters.type === 'barcode' ){
			info.parameters.type = subMarkerControls.parameters.type
			info.parameters.barcodeValue = subMarkerControls.parameters.barcodeValue
		}else console.assert(false)

		data.subMarkersControls.push(info)
	})

	var strJSON = JSON.stringify(data, null, '\t');
	
	
	//////////////////////////////////////////////////////////////////////////////
	//		round matrix elements to ease readability - for debug
	//////////////////////////////////////////////////////////////////////////////
	var humanReadable = false
	if( humanReadable === true ){
		var tmp = JSON.parse(strJSON)
		tmp.subMarkersControls.forEach(function(markerControls){
			markerControls.poseMatrix = markerControls.poseMatrix.map(function(value){
				var roundingFactor = 100
				return Math.round(value*roundingFactor)/roundingFactor
			})
		})
		strJSON = JSON.stringify(tmp, null, '\t');
	}
	
	return strJSON;	
}

//////////////////////////////////////////////////////////////////////////////
//		utility function
//////////////////////////////////////////////////////////////////////////////

/**
 * reset all collected statistics
 */
ARjs.MarkersAreaLearning.prototype.resetStats = function(){
	this.deleteResult()
	
	this.subMarkersControls.forEach(function(markerControls){
		delete markerControls.object3d.userData.seenCouples
	})
}
/**
 * reset all collected statistics
 */
ARjs.MarkersAreaLearning.prototype.deleteResult = function(){
	this.subMarkersControls.forEach(function(markerControls){
		delete markerControls.object3d.userData.result
	})
}
var THREEx = THREEx || {}

var ARjs = ARjs || {}
var THREEx = THREEx || {}

ARjs.MarkersAreaUtils = THREEx.ArMultiMarkerUtils = {}

//////////////////////////////////////////////////////////////////////////////
//		navigateToLearnerPage
//////////////////////////////////////////////////////////////////////////////

/**
 * Navigate to the multi-marker learner page
 * 
 * @param {String} learnerBaseURL  - the base url for the learner
 * @param {String} trackingBackend - the tracking backend to use
 */
ARjs.MarkersAreaUtils.navigateToLearnerPage = function(learnerBaseURL, trackingBackend){
	var learnerParameters = {
		backURL : location.href,
		trackingBackend: trackingBackend,
		markersControlsParameters: ARjs.MarkersAreaUtils.createDefaultMarkersControlsParameters(trackingBackend),
	}
	location.href = learnerBaseURL + '?' + encodeURIComponent(JSON.stringify(learnerParameters))
}

//////////////////////////////////////////////////////////////////////////////
//		DefaultMultiMarkerFile
//////////////////////////////////////////////////////////////////////////////

/**
 * Create and store a default multi-marker file
 * 
 * @param {String} trackingBackend - the tracking backend to use
 */
ARjs.MarkersAreaUtils.storeDefaultMultiMarkerFile = function(trackingBackend){
	var file = ARjs.MarkersAreaUtils.createDefaultMultiMarkerFile(trackingBackend)
	// json.strinfy the value and store it in localStorage
	localStorage.setItem('ARjsMultiMarkerFile', JSON.stringify(file))
}



/**
 * Create a default multi-marker file
 * @param {String} trackingBackend - the tracking backend to use
 * @return {Object} - json object of the multi-marker file
 */
ARjs.MarkersAreaUtils.createDefaultMultiMarkerFile = function(trackingBackend){
	console.assert(trackingBackend)
	if( trackingBackend === undefined )	debugger
	
	// create absoluteBaseURL
	var link = document.createElement('a')
	link.href = ARjs.Context.baseURL
	var absoluteBaseURL = link.href

	// create the base file
	var file = {
		meta : {
			createdBy : 'AR.js ' + ARjs.Context.REVISION + ' - Default Marker',
			createdAt : new Date().toJSON(),
		},
		trackingBackend : trackingBackend,
		subMarkersControls : [
			// empty for now... being filled 
		]
	}
	// add a subMarkersControls
	file.subMarkersControls[0] = {
		parameters: {},
		poseMatrix: new THREE.Matrix4().makeTranslation(0,0, 0).toArray(),
	}
	if( trackingBackend === 'artoolkit' ){
		file.subMarkersControls[0].parameters.type = 'pattern'
		file.subMarkersControls[0].parameters.patternUrl = absoluteBaseURL + 'examples/marker-training/examples/pattern-files/pattern-hiro.patt'
	}else if( trackingBackend === 'aruco' ){
		file.subMarkersControls[0].parameters.type = 'barcode'
		file.subMarkersControls[0].parameters.barcodeValue = 1001
	}else console.assert(false)
	
	// json.strinfy the value and store it in localStorage
	return file
}

//////////////////////////////////////////////////////////////////////////////
//		createDefaultMarkersControlsParameters
//////////////////////////////////////////////////////////////////////////////

/**
 * Create a default controls parameters for the multi-marker learner
 * 
 * @param {String} trackingBackend - the tracking backend to use
 * @return {Object} - json object containing the controls parameters
 */
ARjs.MarkersAreaUtils.createDefaultMarkersControlsParameters = function(trackingBackend){
	// create absoluteBaseURL
	var link = document.createElement('a')
	link.href = ARjs.Context.baseURL
	var absoluteBaseURL = link.href


	if( trackingBackend === 'artoolkit' ){
		// pattern hiro/kanji/a/b/c/f
		var markersControlsParameters = [
			{
				type : 'pattern',
				patternUrl : absoluteBaseURL + 'examples/marker-training/examples/pattern-files/pattern-hiro.patt',
			},
			{
				type : 'pattern',
				patternUrl : absoluteBaseURL + 'examples/marker-training/examples/pattern-files/pattern-kanji.patt',
			},
			{
				type : 'pattern',
				patternUrl : absoluteBaseURL + 'examples/marker-training/examples/pattern-files/pattern-letterA.patt',
			},
			{
				type : 'pattern',
				patternUrl : absoluteBaseURL + 'examples/marker-training/examples/pattern-files/pattern-letterB.patt',
			},
			{
				type : 'pattern',
				patternUrl : absoluteBaseURL + 'examples/marker-training/examples/pattern-files/pattern-letterC.patt',
			},
			{
				type : 'pattern',
				patternUrl : absoluteBaseURL + 'examples/marker-training/examples/pattern-files/pattern-letterF.patt',
			},
		]		
	}else if( trackingBackend === 'aruco' ){
		var markersControlsParameters = [
			{
				type : 'barcode',
				barcodeValue: 1001,
			},
			{
				type : 'barcode',
				barcodeValue: 1002,
			},
			{
				type : 'barcode',
				barcodeValue: 1003,
			},
			{
				type : 'barcode',
				barcodeValue: 1004,
			},
			{
				type : 'barcode',
				barcodeValue: 1005,
			},
			{
				type : 'barcode',
				barcodeValue: 1006,
			},
		]
	}else console.assert(false)
	return markersControlsParameters
}


//////////////////////////////////////////////////////////////////////////////
//		Code Separator
//////////////////////////////////////////////////////////////////////////////
/**
 * generate areaFile
 */
ARjs.MarkersAreaUtils.storeMarkersAreaFileFromResolution = function (trackingBackend, resolutionW, resolutionH) {
	// generate areaFile
	var areaFile = this.buildMarkersAreaFileFromResolution(trackingBackend, resolutionW, resolutionH)
	// store areaFile in localStorage
	localStorage.setItem('ARjsMultiMarkerFile', JSON.stringify(areaFile))
}


//////////////////////////////////////////////////////////////////////////////
//		Code Separator
//////////////////////////////////////////////////////////////////////////////
	
ARjs.MarkersAreaUtils.buildMarkersAreaFileFromResolution = function(trackingBackend, resolutionW, resolutionH){
	// create the base file
	var file = {
		meta : {
			createdBy : 'AR.js - Augmented Website',
			createdAt : new Date().toJSON(),
		},
		trackingBackend : trackingBackend,
		subMarkersControls : [
			// empty for now...
		]
	}
	
	var whiteMargin = 0.1
	if( resolutionW > resolutionH ){
		var markerImageSize = 0.4 * resolutionH
	}else if( resolutionW < resolutionH ){
		var markerImageSize = 0.4 * resolutionW
	}else if( resolutionW === resolutionH ){
		// specific for twitter player - https://dev.twitter.com/cards/types/player
		var markerImageSize = 0.33 * resolutionW
	}else console.assert(false)

	// console.warn('using new markerImageSize computation')
	var actualMarkerSize = markerImageSize * (1 - 2*whiteMargin)
	
	var deltaX = (resolutionW - markerImageSize)/2 / actualMarkerSize
	var deltaZ = (resolutionH - markerImageSize)/2 / actualMarkerSize

	var subMarkerControls = buildSubMarkerControls('center', 0, 0)
	file.subMarkersControls.push(subMarkerControls)

	var subMarkerControls = buildSubMarkerControls('topleft', -deltaX, -deltaZ)
	file.subMarkersControls.push(subMarkerControls)
	
	var subMarkerControls = buildSubMarkerControls('topright', +deltaX, -deltaZ)
	file.subMarkersControls.push(subMarkerControls)

	var subMarkerControls = buildSubMarkerControls('bottomleft', -deltaX, +deltaZ)
	file.subMarkersControls.push(subMarkerControls)
	
	var subMarkerControls = buildSubMarkerControls('bottomright', +deltaX, +deltaZ)
	file.subMarkersControls.push(subMarkerControls)

	return file
	
	//////////////////////////////////////////////////////////////////////////////
	//		Code Separator
	//////////////////////////////////////////////////////////////////////////////

	function buildSubMarkerControls(layout, positionX, positionZ){
		console.log('buildSubMarkerControls', layout, positionX, positionZ)
		// create subMarkersControls
		var subMarkersControls = {
			parameters: {},
			poseMatrix: new THREE.Matrix4().makeTranslation(positionX,0, positionZ).toArray(),
		}
		// fill the parameters
		if( trackingBackend === 'artoolkit' ){
			layout2MarkerParametersArtoolkit(subMarkersControls.parameters, layout)
		}else if( trackingBackend === 'aruco' ){
			layout2MarkerParametersAruco(subMarkersControls.parameters, layout)
		}else console.assert(false)
		// return subMarkersControls
		return subMarkersControls
	}

	function layout2MarkerParametersArtoolkit(parameters, layout){
		// create absoluteBaseURL
		var link = document.createElement('a')
		link.href = ARjs.Context.baseURL
		var absoluteBaseURL = link.href
			
		var layout2PatternUrl = {
			'center' : convertRelativeUrlToAbsolute(absoluteBaseURL + 'examples/marker-training/examples/pattern-files/pattern-hiro.patt'),
			'topleft' : convertRelativeUrlToAbsolute(absoluteBaseURL + 'examples/marker-training/examples/pattern-files/pattern-letterA.patt'),
			'topright' : convertRelativeUrlToAbsolute(absoluteBaseURL + 'examples/marker-training/examples/pattern-files/pattern-letterB.patt'),
			'bottomleft' : convertRelativeUrlToAbsolute(absoluteBaseURL + 'examples/marker-training/examples/pattern-files/pattern-letterC.patt'),
			'bottomright' : convertRelativeUrlToAbsolute(absoluteBaseURL + 'examples/marker-training/examples/pattern-files/pattern-letterF.patt'),
		}
		console.assert(layout2PatternUrl[layout] !== undefined )
		parameters.type = 'pattern'
		parameters.patternUrl = layout2PatternUrl[layout]
		return
		function convertRelativeUrlToAbsolute(relativeUrl){
			var tmpLink = document.createElement('a');
			tmpLink.href = relativeUrl
			return tmpLink.href
		}
	}

	function layout2MarkerParametersAruco(parameters, layout){
		var layout2Barcode = {
			'center' : 1001,
			'topleft' : 1002,
			'topright' : 1003,
			'bottomleft' : 1004,
			'bottomright' : 1005,
		}
		console.assert(layout2Barcode[layout])
		parameters.type = 'barcode'
		parameters.barcodeValue = layout2Barcode[layout]
	}
}
