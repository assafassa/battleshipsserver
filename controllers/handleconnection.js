const handleConnection=(onlinePlayers,ws,request)=>{
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
}
module.exports = handleConnection;