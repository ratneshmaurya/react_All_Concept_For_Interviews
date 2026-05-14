//  Topics :
// React me closure kya hota?
// Stale closure kya hota?


// Before anything remeber one thing: React me har render pe, poora component function firse create hota hai, 
// aur uske andar jitne bhi variables and functions hain, wo sab firse create hote hain, but React 
// internally state value ko remember karta hai, so even if the function is recreated, it will 
// remember the updated state value.

// ---------------------------------------------------------------------------
// EXAMPLE: creating an inner handleClick() function inside a component counter() function.
function Counter() {
  const [count, setCount] = useState(0)

  // inner function, jo count variable ko access karta hai, and uske upar kaam karta hai, is called closure.
  function handleClick() {
    console.log("count is:", count)
    setCount(count + 1)
  }

  // returning this handleClick function, so wherever this is used, it will only use the inner handleClick function, 
  // and not the whole component counter function.
  return (
    <button onClick={handleClick}>
      {count}
    </button>
  )
}

// --------------------STEP 1 — FIRST RENDER
// React create this function: Counter()

// Inside function
const [count, setCount] = useState(0)
// Set the count value to 0.
count = 0

// Fir ye function banta:
function handleClick() {
  console.log("count is:", count)
  setCount(count + 1)
}

// At THIS moment:
count = 0
// Toh handleClick ne kya yaad rakha?
count = 0
// Yehi closure hai.


//------------------------ STEP 2 — Button click
// Here the component outer function is over and completed, only the inner function handleClick is left, 
// and that function is remembered by React, and whenever we click the button, it will execute that handleClick 
// function, and that function has closure over count variable, and it remembers the value of count at the time 
// of its creation, which is 0. 

// Browser runs this function:
handleClick()

// Inside handleClick
console.log(count)
// Output:0
// because function remembered: count=0

Fir:
setCount(count + 1)
// count kitna tha? 0
// So: setCount(1)

// ----------------- STEP 3 — React re-render, becoz setCount runs hence trigger react-render
// Now React: poora component function FIRSE recreate hota hai
// So again this function runs, and new refernce created for this function:
Counter()

// Ab kya hoga?
const [count, setCount] = useState(0) // ??????
// BUT React internally old state remember karta hai, So now:
count = 1

// Fir AGAIN new function banta:
// Ye NEW function ab: count=1, remember karta.
// OLD function gaya ❌
// NEW function aaya ✔
// and react have also the new value as count=1;
function handleClick() {
  console.log("count is:", count)
  setCount(count + 1)
}



// -------------------- STEP 4 — Next click
// Now current handleClick remembers: count=1, So output: count is: 1
// Fir:
setCount(2)
// React again re-renders.

// MOST IMPORTANT UNDERSTANDING
// Every render:
// new variables
// new functions
// new closures, but React internally remembers the state value, 
// so count is updated, although handleClick function is recreated, and it remembers the new count value.

// Render 1
// count=0
// handleClick remembers 0
// Render 2
// count=1
// NEW handleClick remembers 1
// Render 3
// count=2
// NEW handleClick remembers 2
// 💣 THIS is how React uses closures.

// -------------------------------------------------------------------------------
// --------------------------------- STALE CLOSURE ---------------------------------
// Stale closure: when a function remembers old value, and not the updated value, then we call it stale closure.
// Closure problem tab hoti hai when:
// koi function future me execute ho AND wo old render ke values remember kare

// ⚡ Isliye stale closures commonly: asyn calls.
// setTimeout
// setInterval
// event listeners
// promises
// async callbacks
// me dikhti hain.
// Becoz, when they moved to callback queue(as they all are asyn operations) they take the old closure 
// value jo uss point of time me thi, and work on that value only


// Same example me hi, using useEffect and setInterval(so that we can see the stale values in console
// at it runs on every one sec)

function Counter() {
  const [count, setCount] = useState(0)

  // stale closure will happen here, becoz this function will execute later after sometime, not immediately.
  // Means, when it runs first time, it moves to callback queue and then there on every one sec
  // it will execute and print the older value, becoz it has taken the older closure value and moved out.
  useEffect(() => {
    setInterval(() => {
      console.log("interval:", count)
    }, 1000)
  }, [])

  function handleClick() {
    setCount(count + 1)
  }

  return (
    <button onClick={handleClick}>
      {count}
    </button>
  )
}

// FIRST RENDER
count = 0
// useEffect runs
setInterval(() => {
  console.log(count)
}, 1000)

// This interval callback remembers: count=0

// Ab click krne pe:
// Count becomes:
// 1
// 2
// 3

// React re-renders.
// NEW handleClick functions bante rahenge.

// BUT interval callback? ❌ recreate nahi hua.
// Because: [] dependency empty hai.

// So interval STILL remembers: count=0
// Output always: after each one sec.
// interval: 0
// interval: 0
// interval: 0
// interval: 0
// interval: 0 .... continues.
// THIS is stale closure.

// Meaning
// old function old values pakad ke baitha hai

// ----------------------------  FIX, adding depedency in useEffect
useEffect(() => {
  const id = setInterval(() => {
    console.log(count)
  }, 1000)

  return () => clearInterval(id)
}, [count])

// Now whenever count changes:
// this useEffect will run again, and new Interval create hoga, and before creating, 
// it will clear the old interval becoz of that line - return () => clearInterval(id)
// old interval remove
// new interval create
// new interval get latest count value, and remember that value in its closure.


// -------------- what if we dont use clearInterval ???
//  so hrr interval jo created hoga, wo apna apna kaam karta rahega, and print karta rahega, 
// and it will create a mess in console, and also memory leak.