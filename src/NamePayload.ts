import {Serializable, SerializerInfo, TextEncoding, PropertyType} from 'byte-serializer'

export class NamePayload extends Serializable {

    @SerializerInfo.position(0)
    @SerializerInfo.lenght(16)
    @SerializerInfo.textEncoding(TextEncoding.ASCII)
    public Name:string

    @SerializerInfo.position(16)
    @SerializerInfo.lenght(5)
    @SerializerInfo.propertyType(PropertyType.Buffer)
    public Address: Buffer

}