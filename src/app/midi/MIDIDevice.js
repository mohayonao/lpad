import midi from "midi";
import * as operations from "./operations";

const os = require('os');

export default class MIDIDevice {
  constructor(deviceName, actions) {
    this.deviceName = deviceName;
    this.actions = actions;
    this.midiInput = null;
    this.midiOutput = null;
  }

  open() {
    this::operations.willMIDIPortOpen();
    if(os.platform() === 'win32') {
      console.log("Windows system: Please create virtual port 'Launchpad MK2' with LoopMIDI");
      this.midiInput = new midi.input();
      this.midiOutput = new midi.output();
      let inputPortIndex = -1;
      let outputPortIndex = -1;

      // Find loopMIDI virtual input and output ports
      for (let i = 0; i < this.midiInput.getPortCount(); i++) {
        if (this.midiInput.getPortName(i).includes(this.deviceName)) {
          inputPortIndex = i;
          break;
        }
      }

      for (let i = 0; i < this.midiOutput.getPortCount(); i++) {
        if (this.midiOutput.getPortName(i).includes(this.deviceName)) {
          outputPortIndex = i;
          break;
        }
      }

      // Trying open input and output ports
      if (inputPortIndex !== -1) {
        this.midiInput.openPort(inputPortIndex);
        this.midiInput.on('message', (_, data) => {
          this::operations.recvMessage(data, this.actions);
        });
      } else {
        console.error(`Input port ${this.deviceName} not found.`);
      }

      if (outputPortIndex !== -1) {
        this.midiOutput.openPort(outputPortIndex);
      } else {
        console.error(`Output port ${this.deviceName} not found.`);
      }
    } else {
      if (this.midiInput === null) {
        this.midiInput = new midi.input();
        this.midiInput.openVirtualPort(this.deviceName);
        this.midiInput.on("message", (_, data) => {
          this::operations.recvMessage(data, this.actions);
        });
      }
      if (this.midiOutput === null) {
        this.midiOutput = new midi.output();
        this.midiOutput.openVirtualPort(this.deviceName);
      }
    }
    this::operations.didMIDIPortOpen();
  }

  close() {
    this::operations.willMIDIPortClose();
    if (this.midiInput !== null) {
      this.midiInput.closePort();
      this.midiInput = null;
    }
    if (this.midiOutput !== null) {
      this.midiOutput.closePort();
      this.midiOutput = null;
    }
    this::operations.didMIDIPortClose();
  }

  setState(nextState) {
    this::operations.setState(nextState);
  }

  doAction(action) {
    this::operations.doAction(action, ::this.sendMessage);
  }

  sendMessage(data) {
    if (this.midiOutput !== null) {
      this.midiOutput.sendMessage(data);
    }
  }
}
