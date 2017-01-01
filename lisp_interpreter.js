// splitter function will first add the spaces around both the parenthesis
// and then will split them on space thus separating each element in input
//console.log(splitter('(+ 2 3)'))
function splitter (input) {
  return input.replace(/\(/g, ' ( ')
              .replace(/\)/g, ' ) ')
              .split(' ')
}
