export class Query {
  value<T>(): Promise<T> {

  }

  stream<T>(): Observable<T> {

  }

  method(): Query {

  }

  property(): Query {
    
  }
}

export class Remote {
  service(token: string | number): Query {

  }
}