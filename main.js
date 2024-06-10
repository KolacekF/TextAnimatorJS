class Parent{
    constructor(element){
        this.elementNode = element; //element node with text in it
        this.finalText = element.innerHTML.split(""); //save original innerHTML of given element node
        this.text = []; //holds current working state of innerHTML of element node
        this.replaceWhiteSpace(); //replace innerHTML with spaces, if JS is disabled, nothing will happen and text will stay
    }
    replaceWhiteSpace(){ //for every char in element node, replace it with space and save to [text] - &nbsp for non colapsing, but " " to not make oneline of spaces
        for (let i = 0; i < this.finalText.length; i++) {
            if (this.finalText[i] == " ") {
                this.text.push(" ");
            } else {
                this.text.push("&nbsp");
            }
        }
        this.elementNode.innerHTML = this.text.join(""); //finally replace element node text with spaces by array.join on variable text
    }
    updateNode(){ //update this.element node
        this.elementNode.innerHTML = this.text.join("");
    }
    sleep(ms){ //implementation of sleep / wait when combined with await
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export class FromCharCode extends Parent{
    constructor(element, interval, multInterval = false){
        super(element);

        if (multInterval === false) { //one char at a time, gradually
            this.replaceCharLoop(interval);
        } else{ //every multiInterval is triggered new replaceChar()
            this.replaceCharLoopMultiple(interval, multInterval);
        }
    }
    replaceChar(position, i){ //to text[position] give char based on i. If char is found, return true
        let found = false;
        if (i < 127) { //if i<127 which is max of ASCII table, continue giving fromCharCode()
            this.text[position] = String.fromCharCode(i);
            if (this.text[position] == this.finalText[position]) {found = true} //test if found the right char
        } else{ //if exceeds ASCI table (for example "č"), set text[position] to right answer
            this.text[position] = this.finalText[position];
            found = true;
        }
        this.updateNode();
        return found;
    }
    async replaceCharLoop(interval){ //for every position in this.text run whileLoop() and wait for its completation -> one char at a time
        //debugger
        for (let position = 0; position < this.text.length; position++) {
            await this.whileLoop(position, interval);
        }
    }
    async replaceCharLoopMultiple(interval, multInterval){ //for every position in this.text run whileLoop() and wait multInterval -> many char triggered every multInterval
        //debugger
        for (let position = 0; position < this.text.length; position++) {
            this.whileLoop(position, interval);
            await this.sleep(multInterval);
        }
    }
    async whileLoop(position, interval){
        //NEXT 2 LINES CAN BE SWITCHED BASED ON REQUIRED BEHAVIOUR
        let i = 32;     // !"#
        //let i = 65;   //ABCD
        while (!(this.replaceChar(position, i))) {i++; await this.sleep(interval);}
        i = 0;
    }
}


export class Cursor extends Parent{
    constructor(element, interval, disappear){
        super(element);

        this.position = 0; //position of current char in element.innerHTML string
        this.cursor = true; //blinking of cursos - true = visible, false = hidden //is boolean and get tested by cursorBlink()
        this.disappear = disappear; //false = | after "writting" string keeps blinking; true = | disappears
        this.interval_blink = setInterval(() => {this.cursor = !this.cursor; this.cursorBlink(0);}, 450); //blinking of | - very interval switch boolean a test i by cursorBlink()
        this.interval_next = setInterval(() => {this.showNext();}, interval); //every interval reveal next char
    }
    showNext(){ //reveal next char of element.innerHTML string if there is to be revealed, if there is not, run else{}
        if (this.position < this.finalText.length){ //this.text.length can grow because of cursorBlink(1)
            //this.cursorBlink(0); //make cursor blink on position n
            this.text[this.position] = this.finalText[this.position]; //on position n reveal new char
            this.cursorBlink(1); //make cursor blink on position n+1
            this.position += 1;
            this.updateNode();
            
        } else{ //=at the end of string
            clearInterval(this.interval_next); //stop revealing next characters
            if (this.disappear) { //cler interval for cursor blink if disappear=true
                clearInterval(this.interval_blink);
                setTimeout(() => { // show | for the last time with timeout, for better UI
                    this.text[this.position] = " ";
                    this.updateNode();
                }, 450);
            }
        }
    }
    cursorBlink(x){ //tests this.cursor, based on boolean it writes to this.text on this.position or this.position + 1 for better UI
        if (this.cursor){
            this.text[this.position + x] = "|";
        } else{
            this.text[this.position + x] = " ";
        }
        this.updateNode();
    }
}