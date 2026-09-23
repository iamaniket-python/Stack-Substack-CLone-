const buildCommentTree = (flatComments) => {
  const map = new Map();
  const roots = [];

  flatComments.forEach((comment) => {
    map.set(comment.id, { ...comment, replies: [] });
  });

  flatComments.forEach((comment) => {
    const node = map.get(comment.id);
    if (comment.parent_comment_id) {
      const parent = map.get(comment.parent_comment_id);
      if (parent) parent.replies.push(node);
      else roots.push(node); // parent was deleted — treat as root rather than dropping it
    } else {
      roots.push(node);
    }
  });

  return roots;
};

module.exports = buildCommentTree;