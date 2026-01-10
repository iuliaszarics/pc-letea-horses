import axios from "axios";

export default async function UploadImage(image){

    if (image === null)
        return "";

    const data = new FormData();

    data.append("file", image);
    data.append("upload_preset", "image-upload");
    data.append("cloud_name", "dxzaegvyf");

    try {

        const res = await axios.post("https://api.cloudinary.com/v1_1/dxzaegvyf/image/upload", data, {
            headers: {
                Authorization: undefined, 
            }
        });
        
        console.log(res.data);

        return res.data.url;

    } catch (err) {
        return "";
    }
}
