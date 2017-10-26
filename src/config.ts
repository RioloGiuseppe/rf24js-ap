import {} from 'node'
import {CRC} from 'crc-full'
import {Message} from 'byte-serializer'

export interface Config {
    writeBroadcastAddr: Buffer;
    writeBroadcastAddr1: Buffer;
    writeBroadcastAddr2:Buffer;
    readbroadcastAddr:Buffer;
    readbroadcastAddr1:Buffer;
    networkName:string;
    announcementInterval: number;
    CRC:CRC;
    message:Message;

    radioCE:number,
    radioCS:number
    radioIRQ:number
}