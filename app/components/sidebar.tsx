import React from 'react'
import * as FaIcons from 'react-icons/fa'
import * as GiIcons from 'react-icons/gi' 
import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';

const sidebarData = [
    {
        title: 'Ônibus',
        path: 'https://www.saquarema.rj.gov.br/wp-content/uploads/2023/05/Alteracao-onibus-copiar.jpg?x32470',
        icon: <FaIcons.FaBusAlt />
    },
    {
        title: 'Farmácia',
        path: '/img/farmacia.PNG',
        icon: <GiIcons.GiHealthNormal />
    },
    {
        title: 'Polícia',
        path: '/img/policia.PNG',
        icon: <GiIcons.GiPoliceCar />
    },
    {
        title: 'Bombeiros',
        path: '/img/bombeiro.PNG',
        icon: <FaIcons.FaFireAlt />
    }
]

export function Sidebar() {
    return(
        <div>
            <ul className='flex flex-row justify-around items-center space-x-1'>
            {sidebarData.map(item => (
                <div key={item.title} className='list-none items-center'>
                <Dialog.Root>
                <Dialog.Trigger asChild>
                
                <button className="text-violet11 shadow-blackA7 hover:bg-mauve3 inline-flex h-[35px] items-center justify-center rounded-[4px] bg-white px-[15px] font-medium leading-none shadow-[0_2px_10px] focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none">
                <span className='mr-2'>{item.icon}</span>
                    </button>
                </Dialog.Trigger>
                <Dialog.Portal>
                    <Dialog.Overlay className="bg-blackA9 data-[state=open]:animate-overlayShow fixed inset-0" />
                    <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%]  translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
                    <img src={item.path} alt={item.title}
                            className="object-fill" />
                    <Dialog.Close asChild>
                        <button
                        className="text-violet11 hover:bg-violet4 focus:shadow-violet7 absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] focus:outline-none"
                        aria-label="Close"
                        >
                        <Cross2Icon />
                        </button>
                    </Dialog.Close>
                    </Dialog.Content>
                </Dialog.Portal>
                </Dialog.Root>
            </div>
            ))}
            </ul>

        </div>
    )
}
