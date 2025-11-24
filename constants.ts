export const DEFAULT_SPEC_YAML = `openapi: 3.0.0
info:
  title: E-Commerce Virtual API
  description: A sample API spec to demonstrate the virtual backend.
  version: 1.0.0
servers:
  - url: https://api.example.com/v1
paths:
  /products:
    get:
      summary: List all products
      operationId: listProducts
      tags:
        - Products
      parameters:
        - name: limit
          in: query
          description: How many items to return at one time (max 100)
          required: false
          schema:
            type: integer
            format: int32
          example: 20
      responses:
        '200':
          description: A paged array of products
          content:
            application/json:
              schema:
                type: object
                required:
                  - id
                  - name
                properties:
                  id:
                    type: integer
                    format: int64
                  name:
                    type: string
                  tag:
                    type: string
  /products/{productId}:
    get:
      summary: Info for a specific product
      operationId: showProductById
      tags:
        - Products
      parameters:
        - name: productId
          in: path
          required: true
          description: The id of the product to retrieve
          schema:
            type: string
      responses:
        '200':
          description: Expected response to a valid request
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: integer
                  name:
                    type: string
                  price:
                    type: number
                  description:
                    type: string
  /orders:
    post:
      summary: Create a new order
      operationId: createOrder
      tags:
        - Orders
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                productId:
                   type: integer
                quantity:
                   type: integer
      responses:
        '201':
          description: Order created successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  orderId:
                    type: string
                  status:
                    type: string
                    enum: [pending, confirmed]
                  total:
                    type: number
`;