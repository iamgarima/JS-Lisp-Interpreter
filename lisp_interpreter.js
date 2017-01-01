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
    return list.pop();
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
