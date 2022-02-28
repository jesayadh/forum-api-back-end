const RegisteredComment = require('../../Domains/comments/entities/RegisteredComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const { mapCommentsToModel } = require('./utils');
const ReplyRepositoryPostgres = require('./ReplyRepositoryPostgres');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
    this._reply = new ReplyRepositoryPostgres(pool,idGenerator);
  }

  async addComment(registerComment) {
    const { content, threadId, owner } = registerComment;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, content, threadId, owner, date],
    };

    const result = await this._pool.query(query);

    return new RegisteredComment({ ...result.rows[0] });
  }

  async getComments(threadId){
    const queryComment = {
      text: `select 
                comments.id,
                username,
                date,
                content,
                is_delete
              from comments
              LEFT JOIN users ON comments.owner = users.id
              where "threadId" = $1
              order by comments.date`,
      values: [threadId],
    };
    const resultComment = await this._pool.query(queryComment);
    const comments = resultComment.rows.map(mapCommentsToModel);
    for(let i=0;i<comments.length;i++){
      if(comments[i].is_delete!=undefined)
        comments[i].content="**komentar telah dihapus**";
      delete comments[i].is_delete;
    }
    return comments;
  }

  async verifyAvailableComment(commentId) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);
    
    if (!result.rowCount) {
      throw new NotFoundError('commentId tidak ditemukan di database');
    }
  }

  async verifyCommentOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1 and is_delete IS NULL',
      values: [id],
    };
    const result = await this._pool.query(query);
    const Comment = result.rows[0];
    if (Comment.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async deleteComment(id) {
    const is_delete = new Date().toISOString();
    const query = {
      text: `update comments
              set
                is_delete = $2
              WHERE id = $1`,
      values: [id, is_delete],
    };

    await this._pool.query(query);
  }
}

module.exports = CommentRepositoryPostgres;
