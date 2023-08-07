import { VStack, Image } from "@chakra-ui/react";

type ImgProps = {
    url: string;
};

//<div className="bg-white shadow-md rounded h-auto w-96 mx-8">
export function ImagesVila({ url }: ImgProps) {
    return (
                <img className="h-full w-full object-cover" src={url} alt="Vilatur, Saquarema, RJ"  />
            
           );
        };