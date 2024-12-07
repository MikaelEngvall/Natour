/**
 * Represents a set of API features for query manipulation.
 */
class APIFeatures {
    /**
     * Creates an instance of APIFeatures.
     * @param {Object} query - The MongoDB query object to be manipulated.
     * @param {Object} queryString - The query parameters from the request URL.
     */
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }


    /**
     * Applies filtering to the query based on the provided query string.
     * 
     * This method performs two types of filtering:
     * 1. Basic filtering: Removes specified fields from the query object.
     * 2. Advanced filtering: Converts comparison operators in the query string to MongoDB format.
     * 
     * @returns {APIFeatures} The current instance for method chaining.
     */
    filter() {
        // Filtering
        const queryObj = { ...this.queryString };
        const excludeFields = ['page', 'sort', 'limit', 'fields'];
        excludeFields.forEach(field => delete queryObj[field]);

        // 1B) Advanced filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    
    /**
     * Applies sorting to the query based on the provided sort parameter in the query string.
     * 
     * If a sort parameter is provided, it splits the parameter by commas and joins it with spaces
     * to create a valid sort string for MongoDB. If no sort parameter is provided, it defaults to
     * sorting by 'createdAt' in descending order.
     * 
     * @returns {APIFeatures} The current instance for method chaining.
     */
    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
            // sort('price ratingsAverage')
        } else {
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    
    /**
     * Limits the fields returned in the query results based on the 'fields' parameter in the query string.
     * 
     * This method processes the 'fields' parameter from the query string, if present.
     * It splits the fields by commas, trims each field, and creates a space-separated string
     * of field names to be used in the MongoDB select operation.
     * If no 'fields' parameter is provided, it excludes the '__v' field by default.
     * 
     * @returns {APIFeatures} The current instance for method chaining.
     */
    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').map(field => field.trim());
            const selectFields = fields.join(' ');
            this.query = this.query.select(selectFields);
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }

    
    /**
     * Applies pagination to the query based on the 'page' and 'limit' parameters in the query string.
     * 
     * This method calculates the number of documents to skip based on the requested page and limit,
     * then applies these values to the query using MongoDB's skip() and limit() methods.
     * 
     * @returns {APIFeatures} The current instance for method chaining.
     */
    paginate(){
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 10;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);

        return this;
    }

}
module.exports = APIFeatures;