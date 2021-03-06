/**
 * Copyright (c) 2017 Julian Knight (Totally Information)
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

'use strict'

// Module name must match this nodes html file
var moduleName = 'vueui_template';

//var inited = false;
var settings = {};

var serveStatic = require('serve-static'),
    socketio = require('socket.io'),
    path = require('path'),
    fs = require('fs'),
    events = require('events'),
    vueUiVersion = require('../package.json').version
;

var io;

// Why?
var ev = new events.EventEmitter();
ev.setMaxListeners(0);

module.exports = function(RED) {
    'use strict'

    function nodeGo(config) {
        // Create the node
        RED.nodes.createNode(this,config);

        // Create local copies of the node configuration (as defined in the .html file)
        this.name   = config.name || ''
        this.url    = config.url  || 'vueui'
        this.template = config.template || '<p>{{ payload }}</p>'
 
        // copy 'this' object in case we need it in context of callbacks of other functions.
        var node = this;

        var fullPath = join( RED.settings.httpNodeRoot, node.url );

        // Start Socket.IO
        if (!io) { io = socketio.listen(RED.server); }

        // We need an http server to serve the page
        var app = RED.httpNode || RED.httpAdmin

        // Create a new, additional static http path to enable
        // loading of static resources for vueui
        fs.stat(path.join(__dirname, 'dist', 'index.html'), function(err, stat) {
            // If the ./dist/index.html exists use the dist folder, 
            // or use dev resources at ./src/
            if (!err) {
                app.use( join(node.url), serveStatic( path.join( __dirname, 'dist' ) ) );
            } else {
                RED.log.info('Using development folder');
                app.use( join(node.url), serveStatic( path.join( __dirname, 'src' ) ) );
                // Include vendor resource source paths if needed
                /*
                var vendor_packages = [
                    'font-awesome',
                    'sprintf-js',
                    'jquery', 'jquery-ui'
                ];
                vendor_packages.forEach(function (packageName) {
                    app.use(join(settings.path, 'vendor', packageName), serveStatic(path.join(__dirname, 'node_modules', packageName)));
                });
                */
            }
        });

        RED.log.info('Vue UI Version ' + vueUiVersion + ' started at ' + fullPath);

        // handler function for node input events (when a node instance recieves a msg)
        function nodeInputHandler(msg) {
            // Add the template to the msg
            if ( ! ('template' in msg) ) {
                msg.template = node.template;
            }
            // pass the msg payload to the ui
            // TODO: This should probably have some safety validation on it
            io.emit('vueui',msg);
        }
        node.on( 'input', nodeInputHandler )
        node.on('close', function() {
            node.status({});
            io.disconnect;
        });

        // When someone loads the page, it will try to connect over Socket.IO
        // note that the connection returns the socket instance to monitor for responses from 
        // the ui client instance
        io.on('connection', function(socket) {
            RED.log.audit( {'VueUI': 'Socket connected','clientCount':io.engine.clientsCount} );
            node.status({fill:'green',shape:'dot',text:'connected '+io.engine.clientsCount});

            socket.on('vueuiClient', function(msg) {
                RED.log.audit( {'VueUI': 'Data recieved from client','data':msg} );
                node.send(msg);
            })

            socket.on('disconnect', function(reason) {
                RED.log.audit( {'VueUI': 'Socket disconnected','clientCount':io.engine.clientsCount,'reason':reason} );
                node.removeListener('input', nodeInputHandler);
                node.status({fill:'green',shape:'ring',text:'connected '+io.engine.clientsCount});
            });
        });

   } // ---- End of nodeGo (initialised node instance) ---- //

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType(moduleName,nodeGo);
};

// ========== UTILITY FUNCTIONS ================ //

//from: http://stackoverflow.com/a/28592528/3016654
function join() {
    var trimRegex = new RegExp('^\\/|\\/$','g'),
    paths = Array.prototype.slice.call(arguments);
    return '/'+paths.map(function(e){return e.replace(trimRegex,'');}).filter(function(e){return e;}).join('/');
}

function init(RED, node) {
    /*
    var server = RED.server,
        app = RED.httpNode || RED.httpAdmin,
        log = RED.log,
        redSettings = RED.settings
    ;
    */

    //var uiSettings = redSettings.ui || {};
    //settings.path = uiSettings.path || 'vue';
    //settings.title = uiSettings.title || 'Node-RED Vue UI';

    //var fullPath = join(redSettings.httpNodeRoot, settings.path);
    //var socketIoPath = join(fullPath, 'socket.io');

    //io = socketio(RED.server, {path: join(fullPath, 'socket.io')});


    //log.info('Vue UI Version ' + dashboardVersion + ' started at ' + fullPath);
    /*
    io.on('connection', function(socket) {
        RED.log.audit( {'VueUI': 'Socket connected'} );

        //updateUi(socket);
        socket.on(updateValueEventName, ev.emit.bind(ev, updateValueEventName));
        socket.on('vueui-replay-state', function() {
            var ids = Object.getOwnPropertyNames(replayMessages);
            ids.forEach(function (id) {
                socket.emit(updateValueEventName, replayMessages[id]);
            });
            socket.emit('vueui-replay-done');
        });
    });
    */
} // ---- End of INIT ---- //

// EOF
