let interval=1000
function getDate(){
    var request = new XMLHttpRequest();
    request.open("GET", "http://etu-web2.ut-capitole.fr:3011/receive");
    request.onreadystatechange = function() {
        const obj = JSON.parse(this.responseText);
        var Slide=parseInt(obj['slideNo']);
        if(Slide==0){
            let Count=obj['dataArr'][0];
            let StringSubTitle=Count;
            document.getElementById('S1SUB').innerText = StringSubTitle
            document.getElementById('S01').style.display = 'inline';
            document.getElementById('S02').style.display = 'none';
            document.getElementById('S03').style.display = 'none';
            document.getElementById('S04').style.display = 'none';
        }else if(Slide==1){
            let vehicleId=obj['dataArr'][1];
            let parkinglot=obj['dataArr'][2];
            let StringT1=vehicleId;
            let StringT2=parkinglot;
            document.getElementById('S2VI').innerText = StringT1
            document.getElementById('S2PA').innerText = StringT2
            document.getElementById('S01').style.display = 'none';
            document.getElementById('S02').style.display = 'inline';
            document.getElementById('S03').style.display = 'none';
            document.getElementById('S04').style.display = 'none';
        }else if(Slide==2){
            let vehicleId=obj['dataArr'][1];
            let parkingTime=obj['dataArr'][2];
            let cost=obj['dataArr'][3];
            let StringT1=vehicleId;
            let StringT2='Time: '+ parkingTime +' hours';
            let StringT3='Fee: '+ cost+'€';
            document.getElementById('S3VI').innerText = StringT1
            document.getElementById('S3PT').innerText = StringT2
            document.getElementById('S3PF').innerText = StringT3
            document.getElementById('S01').style.display = 'none';
            document.getElementById('S02').style.display = 'none';
            document.getElementById('S03').style.display = 'inline';
            document.getElementById('S04').style.display = 'none';
        }else if(Slide==3){
            StringT1="All parking lots are already reserved"
            document.getElementById('S4ER').innerText = StringT1
            document.getElementById('S01').style.display = 'none';
            document.getElementById('S02').style.display = 'none';
            document.getElementById('S03').style.display = 'none';
            document.getElementById('S04').style.display = 'inline';
        }
    };
    request.send();
}

var intervalId = window.setInterval(function(){
    getDate();
}, interval);