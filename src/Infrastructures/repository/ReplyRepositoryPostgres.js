const RegisteredReply = require('../../Domains/replies/entities/RegisteredReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const { mapRepliesToModel } = require('./utils');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(registerReply) {
    const { content, commentId, owner } = registerReply;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, content, commentId, owner, date],
    };

    const result = await this._pool.query(query);

    return new RegisteredReply({ ...result.rows[0] });
  }

  async getReplies(commentId){
    const queryReply = {
      text: `select 
                replies.id,
                username,
                date,
                content
              from replies
              LEFT JOIN users ON replies.owner = users.id
              where "commentId" = $1
              order by replies.date`,
      values: [commentId],
    };
    const resultReply = await this._pool.query(queryReply);
    
    return resultReply.rows.map(mapRepliesToModel);
  }

  async verifyAvailableReply(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1 and is_delete IS NULL',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (result.rows.length === 0) {
      throw new NotFoundError('replyId tidak ditemukan di database');
    }
  }

  async verifyReplyOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1 and is_delete IS NULL',
      values: [id],
    };
    const result = await this._pool.query(query);
    const Reply = result.rows[0];
    if (Reply.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async deleteReply(id) {
    const is_delete = new Date().toISOString();
    const query = {
      text: `update replies
              set 
                content = '**balasan telah dihapus**',
                is_delete = $2
              WHERE id = $1`,
      values: [id, is_delete],
    };

    await this._pool.query(query);
  }
}

module.exports = ReplyRepositoryPostgres;
