const WebSocket = require('ws')
const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT })
const onlinePlayers = new Map();
const handleConnection = require('./controllers/handleConnection');


wss.on('connection', (ws,request) => {
    handleConnection(onlinePlayers,ws,request)
    console.log(onlinePlayers)
  ws.on('message', (message) => {
    messagejson=JSON.parse(message.toString('utf-8'))
    console.log(messagejson)
    let myPlayer = Array.from(onlinePlayers.entries()).filter(([clientId, player]) => clientId==messagejson.clientId);
    let myname=myPlayer[0][1].username
    let myws=myPlayer[0][1].ws
    let myopon=myPlayer[0][1].opponent
    if( messagejson.subject=='close'){

      onlinePlayers.delete((messagejson.clientId).toString())
    }
    
    else{
        let opponPlayer = Array.from(onlinePlayers.entries()).filter(([clientId, player]) => clientId==myopon);
        let myoponws= opponPlayer[0][1].ws
        if(messagejson.subject=='exit'){
          onlinePlayers.set(opponPlayer[0][0],{ws:opponPlayer[0][1].ws,username:opponPlayer[0][1].username,occupied:false,opponent:''})
          onlinePlayers.set((messagejson.clientId).toString(), {ws: myws, username: myname, occupied: false, opponent: '' })
        }
        myoponws.send(JSON.stringify(messagejson))
        
    }
    
    console.log(onlinePlayers)
  })
  ws.on('close', (code, reason) => {
    if (code!=1005){
      let myPlayer = Array.from(onlinePlayers.entries()).filter(([clientId, player]) => player.ws==ws);
      let myId=myPlayer[0][0]
      
      let myopon=myPlayer[0][1].opponent 
      if (myopon){
        let opponPlayer = Array.from(onlinePlayers.entries()).filter(([clientId, player]) => clientId==myopon);
        let myoponws= opponPlayer[0][1].ws
        let myoponname=opponPlayer[0][1].username
        let myoponid=opponPlayer[0][0]
        onlinePlayers.set((myoponid).toString(), {ws: myoponws, username: myoponname, occupied: false, opponent: '' })
        myoponws.send(JSON.stringify({subject:'exit'}))
        
      }
      onlinePlayers.delete(myId)
    }
    console.log(`Connection closed with code ${code} and reason: ${reason}`);
    console.log(onlinePlayers)
  })
  
})



