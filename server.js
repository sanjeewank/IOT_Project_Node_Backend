let express = require('express');
let app = express();
let ejs=require('ejs');

app.use(express.static("public"))
app.set('view engine', 'html');
app.engine('html',ejs.renderFile);

const mongoose = require('mongoose');


mongoose.connect('mongodb://localhost:27017/rasp15',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);

const schemaPlace = new mongoose.Schema({
    PlaceName: String,
    isReserved:Boolean
});
 
const Place = mongoose.model("Place", schemaPlace);


const schemaVehicle = new mongoose.Schema({
    VehiclePlate:String
});
 
const Vehicle = mongoose.model("Vehicle", schemaVehicle);


const schemaReservation = new mongoose.Schema({
    PlaceId: mongoose.Schema.Types.ObjectId,
    VehicleId:mongoose.Schema.Types.ObjectId,
    EntryTime:Date
});

const Reservation = mongoose.model("Reservation", schemaReservation);


let Slide=0;
let Data=[];


function resetslide(){
    Slide=0;
}

async function getParkingLotCount(){
    try{
        const result = await Place.where("isReserved").equals(false)
        let count=result.length;
        return count;
    }catch(e){
         console.log(e.message)
     }
}


app.get("/", (req, res) => {
    (async () => {
        parkingLots=await getParkingLotCount()
        Data=[parkingLots,]
        res.setHeader('Content-Type', 'text/html')
        res.render('home.html')

    })()
    
})


app.get("/receive", (req, res) => {
    const obj={"slideNo":Slide, "dataArr":Data};
    res.json(obj)
});

app.get("/send", (req, res) => {

    async function isVehicleRegistered(PlateID){
        try{
            const result = await Vehicle.exists({VehiclePlate:PlateID})
            return result;
        }catch(e){
            console.log(e.message)
        }
    }

    async function doRegistration(PlateID){
        try{
            await Vehicle.create({VehiclePlate:PlateID})
        }catch(e){
            console.log(e.message)
        }
    }

    async function getAvailablePlaces(){
        try{
            const result = await Place.find({isReserved:false})
            return result;
        }catch(e){
            console.log(e.message)
        }
    }

    async function getVehicle(PlateID){
        try{
            const result = await Vehicle.find({VehiclePlate:PlateID})
            return result;
        }catch(e){
            console.log(e.message)
        }
    }

    async function doReservation(PId,VId){
        try{
            DateNow=new Date()
            await Reservation.create({PlaceId:PId,VehicleId:VId,EntryTime:DateNow})
        }catch(e){
            console.log(e.message)
        }
    }

    async function PlaceReservation(PId,status){
        try{
            await Place.findOneAndUpdate({_id: PId},{ $set: {isReserved:status}})
        }catch(e){
            console.log(e.message)
        }
    }

    async function checkReservation(PlateID){
        try{
            const vehicleObj = await Vehicle.find({VehiclePlate:PlateID});
            let vehicle_Id=vehicleObj[0]['_id'].toString();
            const result = await Reservation.exists({VehicleId:vehicle_Id});
            return result;
        }catch(e){
            console.log(e.message)
        }
    }

    async function getReservation(PlateID){
        try{
            const vehicleObj = await Vehicle.find({VehiclePlate:PlateID});
            let vehicle_Id=vehicleObj[0]['_id'].toString();
            const result = await Reservation.find({VehicleId:vehicle_Id});
            return result;
        }catch(e){
            console.log(e.message)
        }
    }
    
    async function CalculateTimeDifference(PlateID){
        try{
            let selReservation=await getReservation(PlateID)
            let entryTime=selReservation[0]['EntryTime'];
            let TodayTime=DateNow=new Date();
            differnce=TodayTime-entryTime;
            Minutes=Math.round(differnce / 60000);
            return Minutes
        }catch(e){
            console.log(e.message)
        }
    }

    async function clearReservation(PlateID){
        try{
            let selReservation=await getReservation(PlateID)
            let reservationID=selReservation[0]['_id'];
            let reserPlaceID=selReservation[0]['PlaceId'].toString();
            PlaceReservation(reserPlaceID,false);
            await Reservation.deleteOne({_id:reservationID})  
        }catch(e){
            console.log(e.message)
        }
    }

    function CostCalculator(Minutes){
        return Minutes*3;
    }

    function Main(PlateID){
        (async () => {
            let result=await isVehicleRegistered(PlateID)
            if(!result){
                doRegistration(PlateID)
            }
            result=await checkReservation(PlateID);
            if(result){
                let parkingTime=await CalculateTimeDifference(PlateID);
                let Cost=CostCalculator(parkingTime);
                clearReservation(PlateID)
                Slide=2;
                parkingLots=await getParkingLotCount()+1;
                Data=[parkingLots,PlateID,parkingTime,Cost];
                setTimeout(resetslide, 5000);
                res.sendStatus(200);
            }else{
                result=await getAvailablePlaces();
                if(result.length>0){
                    randomPlaceId=Math.floor(Math.random() * (result.length-1)) + 0;
                    let reservedPlace=result[randomPlaceId];
                    let reservedPlaceId=reservedPlace['_id'].toString();
                    let reservedPlaceName=reservedPlace['PlaceName'].toString();
                    result=await getVehicle(PlateID);
                    let selectedVehicle=result[0];
                    let selectedVehicleId=selectedVehicle['_id'].toString();
                    PlaceReservation(reservedPlaceId,true);
                    doReservation(reservedPlaceId,selectedVehicleId);
                    parkingLots=await getParkingLotCount()
                    Slide=1;
                    Data=[parkingLots,PlateID,reservedPlaceName];
                    setTimeout(resetslide, 5000);
                    res.sendStatus(200);
                }else{
                    Slide=3;
                    setTimeout(resetslide, 5000);
                    res.sendStatus(200);
                }
            }
            
        })()
    } 
    Main(req.query.licenceplate)
})


app.listen(3011)