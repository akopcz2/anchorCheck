const fsc = require("fs-cheerio");
const glob = require ("glob");
const appRoot = require("app-root-path");
const colors = require("colors");

var self = module.exports = {
    init:function(){

        //glob options
        let options = {
            "ignore": "**/node_modules/"
        }
        let failBuild = false;
        let buildPath = appRoot;
        buildPath = buildPath + '/';
        console.log(buildPath);

        glob(buildPath + "build/*.html", options, function (er, files) {
            'use strict';

            if (er) { 
                throw (er);
                return;
            }

            for(var i = 0; i < files.length; i++){
                let filePath = files[i];
                let numOfChanges = 0;
                let pageName = filePath;

                //Get the Children of a node
                let getNodeChildren = function(element , callback){
                let nodeChildren = element.children;
                    nodeChildren.forEach(function(node){
                        let nodeName = node.name;
                        let nodeType = node.type;
                        if ( (nodeName !== 'span' && nodeName !== 'br' && nodeName !=='img' && nodeName !=='strong' && nodeName !=='a' && nodeName !=='i') && nodeType === 'tag') {
                            numOfChanges += 1;
                            callback(nodeName, filePath);
                        }
                    });
                };

                fsc.readFile(filePath).then(function($){
                    let documentBody = $('body').find('*');
                    let buildStatus = colors.green('BUILD PASSED');

                    for(var i = 0; i < documentBody.length; i++){
                        let node = documentBody[i];
                        //Disclude Images, Breaks, and input fields

                        let anchorTag = (node.type === 'tag' && node.name === 'a');

                            if (anchorTag){
                                let anchorChildLength = node.children.length;
                                if(anchorChildLength > 0){
                                    getNodeChildren(node, function(blockLevelNode, filePath){
                                        let nodeContents = $(node).html();
                                        console.log(colors.yellow(blockLevelNode) + ' is a block level element. Please convert to a ' + colors.yellow('span'));
                                        console.log('Contents of the node  ' + colors.yellow(nodeContents) + '\n');
                                        console.log('build failed at ' + colors.red(filePath));
                                        buildStatus = colors.red('BUILD FAILED');
                                        failBuild = true;
                                        //This will halt all js execution until error is fixed
                                        process.exit();
                                    });

                                }
                                else{
                                    return;
                                }
                            }
                        }
                    console.log('There was a total of ' + colors.red(numOfChanges) + ' anchor issue(s) with the build on' + filePath + ' ' +  buildStatus + '\n');
                });

            }

        });
    }
}
self.init();
 