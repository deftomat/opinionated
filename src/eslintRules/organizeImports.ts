// TODO: RULE NOT USED YET
// Implement auto-fix:
//   https://eslint.org/docs/developer-guide/working-with-rules#applying-fixes
//   https://github.com/microsoft/TypeScript/issues/32818

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Specifiers the ordering of import statements',
      category: 'Stylistic Issues',
      recommended: 'error'
    },
    messages: {
      sourceOrder: 'Import sources must be alphabetized.',
      namedOrder: 'Named imports must be alphabetized.'
    },
    schema: []
  },
  defaultOptions: [],
  create(context) {
    let previousNode: any;

    return {
      ImportDeclaration(node) {
        const localSpecifiers = node.specifiers
          .filter(specifier => specifier.type === 'ImportSpecifier')
          .map(specifier => specifier.local);
        const outOfOrderLocalSpecifiers = spefifiersOutOfOrder(localSpecifiers);

        if (outOfOrderLocalSpecifiers) {
          const [first, second] = outOfOrderLocalSpecifiers;
          context.report({
            node,
            messageId: 'namedOrder',
            loc: {
              start: first.loc.start,
              end: second.loc.end
            }
          });
        }

        if (previousNode) {
          if (
            'value' in node.source &&
            typeof node.source.value === 'string' &&
            'value' in previousNode.source &&
            typeof previousNode.source.value === 'string' &&
            node.source.value.toUpperCase() < previousNode.source.value.toUpperCase()
          ) {
            context.report({
              node,
              messageId: 'sourceOrder',
              loc: {
                start: previousNode.loc.start,
                end: node.loc.end
              }
            });
          }
        }

        previousNode = node;
      }
    };
  }
};

function spefifiersOutOfOrder(specifiers: any) {
  return pairwise(specifiers).find(
    ([first, second]) => second.name.toUpperCase() < first.name.toUpperCase()
  );
}

function pairwise(xs: any): any {
  const pairs: any[] = [];
  for (let i = 1; i < xs.length; i++) {
    pairs.push([xs[i - 1], xs[i]]);
  }
  return pairs;
}
