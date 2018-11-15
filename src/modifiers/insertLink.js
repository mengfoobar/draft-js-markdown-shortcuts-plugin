import { EditorState, RichUtils, SelectionState, Modifier } from 'draft-js';

const insertLink = (editorState, matchArr) => {
  const currentContent = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  const key = selection.getStartKey();
  const [
    matchText,
    text,
    href,
    title
  ] = matchArr;
  const { index } = matchArr;
  const focusOffset = index + matchText.length;
  const wordSelection = SelectionState.createEmpty(key).merge({
    anchorOffset: index,
    focusOffset
  });

  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  let cleanedUrl;

  if (re.test(href)) {
    cleanedUrl = `mailto:${href}`;
  } else if (href.indexOf('http') === -1) {
    cleanedUrl = `http://${href}`;
  } else{
    cleanedUrl = href
  }

  const nextContent = currentContent.createEntity(
    'LINK',
    'MUTABLE',
    cleanedUrl
  );
  const entityKey = nextContent.getLastCreatedEntityKey();
  let newContentState = Modifier.replaceText(
    nextContent,
    wordSelection,
    text,
    null,
    entityKey
  );
  newContentState = Modifier.insertText(
    newContentState,
    newContentState.getSelectionAfter(),
    ' '
  );
  const newWordSelection = wordSelection.merge({
    focusOffset: index + text.length
  });
  let newEditorState = EditorState.push(editorState, newContentState, 'create-entity');
  newEditorState = RichUtils.toggleLink(newEditorState, newWordSelection, entityKey);
  return EditorState.forceSelection(newEditorState, newContentState.getSelectionAfter());
};

export default insertLink;
