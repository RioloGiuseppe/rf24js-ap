import {Config} from './config'
import {NamePayload} from './NamePayload'
import {CRC} from 'crc-full'
import {Message} from 'byte-serializer'
import {radio, Irf24js, CRCLength, PALevel, Datarate} from 'rf24js'
import {Gpio, GpioOptions} from 'onoff'


import {} from 'node'

export class AccessPoint{
    private nameBroadcastInterval:NodeJS.Timer
    private config: Config;
    private _brctWrtAddr: Array<Buffer>
    private _brctReadAddr: Array<Buffer>
    private _interruptPin:Gpio;
    
    constructor(config:Config) {
        this.config = config;
        this.init();
    }

    private init(){
        if(!!this.config)
            throw "Invalid config class";

        if(typeof(this.config.radioCE)==="number" && typeof(this.config.radioCS)==="number")
            radio.create(this.config.radioCE, this.config.radioCS);
        else
            throw "Invalid radio pin config";

        if(typeof(this.config.radioIRQ)==="number")
            this._interruptPin = new Gpio(this.config.radioIRQ, 'in', 'falling');
        else
            throw "Invalid radio pin IRQ config";


        if(this.config.writeBroadcastAddr instanceof Buffer)
            this._brctWrtAddr = [this.config.writeBroadcastAddr];
        else 
             throw "Invalid write address for name broadcasting";
        if(this.config.writeBroadcastAddr1 instanceof Buffer) this._brctWrtAddr.push(this.config.writeBroadcastAddr1);
        if(this.config.writeBroadcastAddr2 instanceof Buffer) this._brctWrtAddr.push(this.config.writeBroadcastAddr2);
        

        if(this.config.readbroadcastAddr instanceof Buffer)
            this._brctReadAddr = [this.config.readbroadcastAddr];
        else 
            throw "Invalid read address for name broadcasting";
        if(this.config.readbroadcastAddr1 instanceof Buffer) this._brctReadAddr.push(this.config.readbroadcastAddr1);

        this.configInterrupt();
        this.startNameBroadcast();
        
    }


    public startNameBroadcast():void {
        let that = this;
        this.nameBroadcastInterval = setInterval(function(){
            radio.stopListening()
            for(let addr of that._brctWrtAddr){
                radio.openWritingPipe(addr);
                var p = new NamePayload();
                p.Address = that._brctReadAddr[0];
                p.Name = that.config.networkName;
                that.config.message.data = p.serialize();
                let buff = that.config.message.serialize()
                radio.write(buff,buff.length);
            }
            radio.startListening();
        },this.config.announcementInterval);
    }

    private onInterrupt(error:Error, value:number) {
        if(value === 0){
            let pipe = radio.availableFull();
            if(pipe.status === true) {
                let buf = radio.read(6)
                console.log(buf.toString());
            }
        } 
    }

    public stopNameBroadcast():void {
        clearInterval(this.nameBroadcastInterval);
    }

    private configInterrupt():void{
        radio.enableInterrupts(false, false, true);
        this._interruptPin.watch(this.onInterrupt)
    }

}