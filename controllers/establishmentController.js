// import module `database` from `../models/db.js`
const db = require('../models/db.js');

// import module `Establishment` from `../models/UserModel.js`
const Establishment = require('../models/EstablishmentModel.js');

const Review = require('../models/ReviewModel.js');

const helper = require('../helpers/helper.js');

const establishmentController = {
    getEstablishments: async function (req, res) {
        var result = await db.findMany(Establishment, {});

        if (result.length > 0) {
            var establishments = result.map((item) => {
                return {
                    name: item.name,
                    description: item.description,
                    overall_rating: item.overall_rating,
                    total_reviews: item.total_reviews,
                }
            });

            const username = req.session.username ? req.session.username : null;
            // console.log(req.session.username);
            res.render('establishments-list', {
                establishments: establishments,
                user: username
            });
        }

        /*
            if there is no establishments
        */
        else {
            res.render('error');
        }
    },

    getSearchEstablishments: async function (req, res) {
        var search = req.query.search; // Retrieve search query

        var query = {
            $or: [
              { name: { $regex: new RegExp(search, 'i') } },
              { description: { $regex: new RegExp(search, 'i') } }
            ]
          }; // Query for searching in the database

        var result = await db.findMany(Establishment, query);

        // Process the result 
        var establishments = result.map((item) => {
            return {
              name: item.name,
              description: item.description,
              overall_rating: item.overall_rating,
              total_reviews: item.total_reviews
            }});

        // Load search page
        res.render('search-establishments', {
            establishments: establishments,
            results_count: establishments.length,
            search_value: search
          });
    },

    getEstablishmentPage: async function (req, res) {
        var establishmentNameStr = req.params.establishmentName;

        var query = {
            name: helper.replaceHyphenWithSpace(establishmentNameStr)
        }

        var result = await db.findOne(Establishment, query);

        var reviewQuery = {
            establishment_id: result.establishment_id
        }

        // console.log(reviewQuery.establishment_id);

        var result2 = await db.findMany(Review, reviewQuery);

        // console.log(JSON.stringify(result2));

        var reviews = result2.map((item) => {
            return {
                review_id: item.review_id,
                username: item.username,
                establishment_id: item.establishment_id,
                title: item.title,
                body_desc: item.body_desc,
                date: item.date,
                edited: item.edited,
                rating: item.rating,
                votes: item.votes,
            }
        });

        // console.log(reviews[0].establishment_id);

        if (result != null) {
            var details = {
                name: result.name,
                description: result.description,
                overall_rating: result.overall_rating,
                total_reviews: result.total_reviews,
                contact: result.contact,
                address: result.address,

                // imagePaths array from the query
                // contains paths to pfp, header, map, menu, and gallery images
                // access using imagePaths.establishmentPfpPath, etc.
                // access menu images using imagePaths.establishmentMenuPhotos[0], etc.
                establishmentPfpPath: result.imagePaths.establishmentPfpPath,
                establishmentHeaderPath: result.imagePaths.establishmentHeaderPath,
                establishmentMapPath: result.imagePaths.establishmentMapPath,

                establishmentMenuPhotos: result.imagePaths.establishmentMenuPhotos, // array
                establishmentFoodPhotos: result.imagePaths.establishmentFoodPhotos, // array

                // reviews array from the query
                reviews: reviews
            };

            /* console.log(details.name);
            console.log(details.description);
            console.log(details.overall_rating);
            console.log(details.reviews[0].username); */

            res.render('establishment-page', details);
        } else {
            res.render('error', 'Establishment not found.');
        }
    }
}
module.exports = establishmentController;