/*
  Copyright (c) 2017 Julian Knight (Totally Information)

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

// Create an instance of Vue
new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue.js!'
  }
})

// Create the socket
var io = io()

// When the socket is connected ..................
io.on('connect', function() {
    console.log('SOCKET CONNECTED')

    io.emit('vueuiClient',{action:'connected'})

    io.on('vueui', function(msg) {
        console.log('vueui msg recieved')
        console.dir(msg)

        io.emit('vueuiClient','I got your msg!')
    })
}) // --- End of socket connection processing ----


// EOF
