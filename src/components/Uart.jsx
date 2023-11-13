import React, { useRef, useState } from 'react'

export const Uart = () => {
    const [isOpen, setOpen] = useState(false);
    const [label, setLabel] = useState(0);
    const [chooseNumber, setChooseNumber] = useState(false);
    const port = useRef();
    const reader = useRef();
    const writer = useRef();
    const request_forget = new Uint8Array([0x55, 0xAA, 0x11, 0x00, 0x37, 0x47]);
    const request_learned_block = new Uint8Array([0x55, 0xAA, 0x11, 0x00, 0x24, 0x34]);
    // const request_learn = new Uint8Array([0x55, 0xAA, 0x11, 0x02, 0x36, 0x02, 0x00, 0x4A]);
    const request_learn = new Uint8Array([0x55, 0xAA, 0x11, 0x02, 0x36, 0x01, 0x00]);
    const handleClick = () => {
        if (isOpen) return;
        let opened = false;
        const openPort = async () => {
            try {
                port.current = await navigator.serial.requestPort();
                opened = true;
            } catch (err) {
                opened = false;
                setOpen(false);
            }
            if (opened) {
                console.log(port)
                await port.current.open({ baudRate: 9600 });
                reader.current = port.current.readable.getReader();
                writer.current = port.current.writable.getWriter();
                // await writer.current.write(command);
                // writer.current.releaseLock();
                // setTimeout(async () => {
                //     const { value, done } = await reader.current.read();
                //     console.log(value);
                // }, 3000);
                setOpen(true);
            }
        }
        openPort();
    }

    const handleClose = () => {
        if (!isOpen) {
            alert("Port is not connect");
            return;
        }
        if (writer.current) writer.current.releaseLock();
        if (reader.current) reader.current.releaseLock();

        port.current.close();
        setOpen(false);
    }

    const handleRead = async () => {
        if (!isOpen) {
            alert("Port is not connect");
            return;
        }
        // reader.current = port.current.readable.getReader();
        // writer.current = port.current.writable.getWriter();
        await writer.current.write(request_learned_block);
        // writer.current.releaseLock();
        setTimeout(async () => {
            const { value, done } = await reader.current.read();
            console.log(value);
            // reader.current.releaseLock();
        }, 1000);
    }

    function sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    function getLearnCommand(label) {
        request_learn[5] = label;
        console.log(request_learn);
        let checkSum = 0;
        for (const byte of request_learn) {
            checkSum += byte;
        }

        checkSum = checkSum & (0xFF);

        const newCommand = new Uint8Array(request_learn.length + 1);
        newCommand.set(request_learn);
        newCommand.set([checkSum], request_learn.length);
        return newCommand;
    }

    const handleLearn = async () => {
        if (!chooseNumber) {
            alert("Lock the number first");
            return;
        }
        if (!isOpen) {
            alert("Port is not connect");
            return;
        }
        setChooseNumber(false);
        const command = getLearnCommand(label + 1);
        for (let i = 0; i < 100; i++) {
            // await writer.current.write(request_learn);
            await writer.current.write(command);
            await sleep(50);
        }
    }

    const handleForget = async () => {
        console.log(label);
        if (!isOpen) {
            alert("Port is not connect");
            return;
        }
        await writer.current.write(request_forget);
    }

    return (
        <>
            <button onClick={handleClick} className="btn btn-primary">Open Port</button>
            <button onClick={handleClose} className="btn btn-primary">Close Port</button>
            <button onClick={handleRead} className="btn btn-primary">Read Learned Blocks</button>
            <button onClick={handleForget} className="btn btn-primary">Forget Learned</button>
            <div>
                <select className='form-select form-select-lg mb-3' id="" onChange={(e) => { setLabel(parseInt(e.target.value)) }}>
                    <option>0</option>
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5</option>
                    <option>6</option>
                    <option>7</option>
                    <option>8</option>
                    <option>9</option>
                </select>
                <button onClick={() => setChooseNumber(true)} className="btn btn-primary">Lock Number</button>
                <button onClick={handleLearn} className="btn btn-primary">Learn Number</button>
            </div>

        </>

    )
}
