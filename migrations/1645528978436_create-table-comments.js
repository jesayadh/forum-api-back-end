/* eslint-disable camelcase */
exports.up = (pgm) => {
    pgm.createTable('comments', {
      id: {
        type: 'VARCHAR(50)',
        primaryKey: true,
      },
      content: {
        type: 'TEXT',
        notNull: true,
      },
      threadId: {
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
    
    pgm.addConstraint('comments', 'fk_forum.user_id_users.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE');
    pgm.addConstraint('comments', 'fk_forum.thread_id_threads.id', 'FOREIGN KEY("threadId") REFERENCES threads(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
pgm.dropTable('comments');
};
  