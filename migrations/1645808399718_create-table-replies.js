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
};

exports.down = (pgm) => {
pgm.dropTable('replies');
};
  