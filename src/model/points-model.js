import Observable from '../framework/observable.js';
import {UpdateType} from '../const.js';

export default class PointsModel extends Observable{
  #allOffers = [];
  #allDestinations = [];
  #points = [];
  #pointsApiService = null;
  #isLoaded = true;
  constructor({pointsApiService}) {
    super();
    this.#pointsApiService = pointsApiService;
  }

  get points() {
    return this.#points;
  }

  get destinations() {
    return this.#allDestinations;
  }

  get offers() {
    return this.#allOffers;
  }

  get isLoaded() {
    return this.#isLoaded;
  }

  async init() {
    try {
      const points = await this.#pointsApiService.points;
      this.#allOffers = await this.#pointsApiService.offers;
      this.#allDestinations = await this.#pointsApiService.destinations;
      this.#points = points.map(this.#adaptToClient);
    } catch(err) {
      this.#points = [];
      this.#isLoaded = false;
    }
    this._notify(UpdateType.INIT);
  }

  async updatePoint(updateType, update) {
    try {
      const response = await this.#pointsApiService.updatePoint(update);
      const updatedPoint = this.#adaptToClient(response);

      this.#points = this.#points.map((point) => point.id === updatedPoint.id ? updatedPoint : point);

      this._notify(updateType, update);
    }catch {
      throw new Error('Can\'t update point');
    }
  }

  async addPoint(updateType, update) {
    try {
      const response = await this.#pointsApiService.addPoint(update);
      const newPoint = this.#adaptToClient(response);

      this.#points = [
        newPoint,
        ...this.#points,
      ];

      this._notify(updateType, update);
    }catch {
      throw new Error('Can\'t add point');
    }
  }

  async deletePoint(updateType, update) {
    try {
      await this.#pointsApiService.deletePoint(update);

      this.#points = this.#points.filter((point) => point.id !== update.id);

      this._notify(updateType);
    } catch(err) {
      throw new Error('Can\'t delete point');
    }
  }

  #adaptToClient(point) {
    const adaptedPoint = {...point,
      dateFrom: point['date_from'] !== null ? new Date(point['date_from']) : point['date_from'],
      dateTo: point['date_to'] !== null ? new Date(point['date_to']) : point['date_to'],
      isFavorite: point['is_favorite'],
      basePrice: point['base_price'],
    };

    delete adaptedPoint['date_to'];
    delete adaptedPoint['date_from'];
    delete adaptedPoint['is_favorite'];
    delete adaptedPoint['base_price'];

    return adaptedPoint;
  }

}

