const RegisterThread = require('../../Domains/threads/entities/RegisterThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload,{owner}) {
    const registerThread = new RegisterThread(useCasePayload,{owner});
    return this._threadRepository.addThread(registerThread);
  }
}

module.exports = AddThreadUseCase;
