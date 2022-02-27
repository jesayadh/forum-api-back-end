/* eslint-disable camelcase */
exports.up = (pgm) => {
    pgm.createTable('replies', {
      id: {
        type: 'VARCHAR(50)',
        primaryKey: true,
      },
      content: {
        type: 'TEXT',
        notNull: true,
      },
      commentId: {
        type: 'VARCHAR(50)',
        notNull: true,
      },
      owner: {
        type: 'VARCHAR(50)',
        notNull: true,
      },
      date: {
        type: 'TEXT',
        notNull: false,
      },
      is_delete: {
        type: 'TEXT',
        notNull: false,
      },
    });

    pgm.addConstraint('replies', 'fk_forum.user_id_users.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE');
    pgm.addConstraint('replies', 'fk_forum.comment_id_comments.id', 'FOREIGN KEY("commentId") REFERENCES comments(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
pgm.dropTable('replies');
};
  