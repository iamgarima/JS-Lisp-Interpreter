// splitter function first add the spaces around both the parenthesis
// and then split them on space thus separating each element in input
// console.log(splitter('(+ 2 3)'))
function splitter (input) {
  return input.replace(/\(/g, ' ( ')
              .replace(/\)/g, ' ) ')
              .split(' ')
}

// tokenize function removes the empty strings and the parenthesis elements
// from the array and put each expression in a new array taking consideration
// of the parenthesis
// console.log(tokenize(splitter('(+ 2 3)'), []))
function tokenize (input, list) {
  var firstElem = input.shift()
  if (firstElem === undefined) {
    return list.pop()
  }
  if (firstElem === '') {
    return tokenize(input, list)
  }
  if (firstElem === '(') {
    list.push(tokenize(input, []))
    return tokenize(input, list)
  }
  if (firstElem === ')') {
    return list
  }
  list.push(firstElem)
  return tokenize(input, list)
}

// object having predefined and user-defined keywords
var obj = {
  '+': function sum (arr) {
    var l = arr.length
    var sum = 0
    for (var i = 0; i < l; ++i) {
      sum += arr[i]
    }
    return sum
  }
}

// function for special statements like define
// console.log(special(tokenize(splitter('(define A 5)'), [])))
function special (input) {
  var firstElem = input.shift()
  if (firstElem === 'define') {
    obj[input.shift()] = evaluator(input)
  }
  else {
    input.unshift(firstElem)
    return evaluator(input)
  }
}

// evaluator function for evaluating expressions, variables and literals
function evaluator (input) {
  var firstElem = input.shift()
  if (typeof Number(firstElem) === 'number' && Number(firstElem) === Number(firstElem)) {
    return Number(firstElem)
  }
  if (obj[firstElem] !== undefined) {
    return obj[firstElem]
  }
}

//console.log(special(tokenize(splitter('(define A 5)'), [])))
//console.log(special(tokenize(splitter('(A)'), [])))
