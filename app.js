
const WebSocket = require('ws')
const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT })
const onlinePlayers = new Map();



wss.on('connection', (ws,request) => {
    const clientId = new URL(request.url, `http://${request.headers.host}`).searchParams.get('clientId');
    const clientName= new URL(request.url, `http://${request.headers.host}`).searchParams.get('username');
    const unoccupiedPlayers = Array.from(onlinePlayers.entries()).filter(([clientId, player]) => !player.occupied);
    let dataToSend={}
    if (unoccupiedPlayers[0]&&unoccupiedPlayers[0]!=clientId){
        dataToSend.message=unoccupiedPlayers[0][1].username
        let opponetname=unoccupiedPlayers[0][1].username
        let ooponws=unoccupiedPlayers[0][1].ws
        let opponid=unoccupiedPlayers[0][0]
        onlinePlayers.set(opponid,{ws:ooponws,username:opponetname,occupied:true,opponent:clientId})
        onlinePlayers.set(clientId, {ws: ws, username: clientName, occupied: true, opponent: opponid})
        ooponws.send(JSON.stringify({message:clientName,subject:'startnewgame'}))

    }else{
        dataToSend.message='noavailableplayes'
        onlinePlayers.set(clientId, {ws: ws, username: clientName, occupied: false, opponent: '' })
    }
    ws.send(JSON.stringify(dataToSend))
  ws.on('message', (message) => {
    messagejson=JSON.parse(message.toString('utf-8'))
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
    
  })
  
})



