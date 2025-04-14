import { Dropbox } from 'dropbox';
import { Readable } from 'stream';
import axios from 'axios';
import { InternalServerErrorException } from '@nestjs/common';
import { Request } from 'express';
import { APP_KEY, APP_SECRET, REFRESH_TOKEN_DROPBOX } from './dropbox.constants';

export interface IDropOpts {
  accessToken: string;
}
export const getPath = (dbname: string, key: string) => `/${dbname}/` + key;
  
let accessToken: string = null;
let dateCache: Date = new Date();
let expiresIn = 14400;

export class DropboxService {
  opts: IDropOpts;
  dropbox: Dropbox;

  constructor(opts: IDropOpts) {
    this.opts = opts;
    this.dropbox = new Dropbox({ accessToken: accessToken });
  }

  async uploadFile(file: Buffer, req?: Request): Promise<any> {
    const accessToken = await this._getAccessToken();
    console.log(accessToken, 'accessToken dropbox')
    const dbx = new Dropbox({
      accessToken: accessToken,
    });

    const folder = "/images/users";
    return new Promise((resolve, reject) => {
      const key = `${new Date().getTime()}`;

      const fullPath = `${folder}/${key}`.replace(/\/+/g, '/');

      dbx
        .filesUpload({ path: fullPath, contents: file })
        .then(async () => {
          const location = await dbx.sharingCreateSharedLinkWithSettings({
            path: fullPath,
          });
          resolve({
            location: location.result.url.replace('www.dropbox.com', 'dl.dropboxusercontent.com'),
            rawLink: `${location.result.url}&raw=1`,
            key: key,
          });
        })
        .catch(async (err) => {
          console.error(err);
          reject('error while uploading to dropbox ' + err);
        });
    });
  }

  async download(file: string): Promise<Readable> {
    const accessToken = await this._getAccessToken();
    const dbx = new Dropbox({
      accessToken: accessToken,
    });
    return new Promise((resolve, reject) => {
      dbx
        .sharingGetSharedLinkFile({ url: file })
        .then((data: any) => {
          resolve(data);
        })
        .catch((err) => {
          console.log('dropbox error while downloading ' + err);
          reject(err);
        });
    });
  }

  async deleteFile(path: string): Promise<boolean> {
    const accessToken = await this._getAccessToken();
    const dbx = new Dropbox({
      accessToken: accessToken,
    });
    return new Promise((resolve, reject) => {
      dbx
        .filesDeleteV2({ path: path })
        .then(() => {
          resolve(true);
        })
        .catch((err) => {
          console.log('error while deleting from dropbox ', err);
          reject(false);
        });
    });
  }

  async getPresignedUrl(filepath: string): Promise<string> {
    const accessToken = await this._getAccessToken();
    const dbx = new Dropbox({
      accessToken: accessToken,
    });
    const ret = await dbx.filesGetTemporaryUploadLink({
      commit_info: {
        path: '/' + filepath,
      },
    });
    return ret.result.link;
  }

  private async _getAccessToken(): Promise<string> {
    if (accessToken) {
      if (expiresIn - Math.floor((new Date().getTime() - dateCache.getTime()) / 1e3) > 120) {
        console.log('getting access from cache');
        return accessToken;
      }
    }
    try {
      const data = new URLSearchParams();
      data.append('refresh_token', REFRESH_TOKEN_DROPBOX);
      data.append('grant_type', 'refresh_token');
      data.append('client_id', APP_KEY);
      data.append('client_secret', APP_SECRET);
      const res = await axios.post("https://www.dropbox.com/oauth2/token", data);
      accessToken = res.data.access_token;
      expiresIn = res.data;
      dateCache = new Date();
      return res.data.access_token;
    } catch (err) {
      console.log('error while getting axios token ', err);
      throw new InternalServerErrorException(`
              We apologize for the inconvenience,
              but we're encountering an internal server error while processing your files.
              Please try again later, and thank you for your patience as we work to resolve the issue`);
    }
  }
}
